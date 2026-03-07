import os
import sys
import logging
import csv
import uuid
from typing import Optional
from dateutil import parser
from sqlmodel import Session, create_engine, select
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.data_model.models import Company, VCFirm, Tenant, CompanyVCFirmLink

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.error("DATABASE_URL not found")
    sys.exit(1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def parse_int(val: str) -> Optional[int]:
    if not val or val == '—':
        return None
    try:
        return int(val.replace(',', '').strip())
    except ValueError:
        return None

def parse_date(val: str):
    if not val or val == '—':
        return None
    try:
        return parser.parse(val)
    except Exception:
        return None

def import_companies(file_path: str):
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return

    # PHASE 1: Load existing data into memory and close session
    with Session(engine) as session:
        tenant = session.exec(select(Tenant).where(Tenant.slug == "system")).first()
        if not tenant:
            tenant = Tenant(name="System Tenant", slug="system")
            session.add(tenant)
            session.commit()
            session.refresh(tenant)
        tenant_id = tenant.id
        
        db_vcs = session.exec(select(VCFirm)).all()
        vc_map = {vc.name: vc.id for vc in db_vcs}
        
        db_comps = session.exec(select(Company).where(Company.tenant_id == tenant_id)).all()
        comp_map = {c.name.lower(): c.id for c in db_comps}
        
        db_links = session.exec(select(CompanyVCFirmLink)).all()
        link_set = {(l.company_id, l.vc_firm_id) for l in db_links}

    # PHASE 2: Process CSV entirely in-memory using UUIDs
    new_companies = []
    new_vcfirms = []
    new_links = []
    
    with open(file_path, mode='r', encoding='utf-8-sig') as f:
        reader = list(csv.DictReader(f))
        
        for row in reader:
            name = row.get('Organization Name', '').strip()
            if not name:
                continue
                
            website_url = row.get('Website', '').strip() or "#"
            if website_url != "#" and not website_url.startswith('http'):
                website_url = f"https://{website_url}"
                
            # Parse fields
            t_funding = row.get('Total Funding Amount', '').strip() or None
            l_date = parse_date(row.get('Last Funding Date'))
            stage = row.get('Stage', '').strip() or None
            ind = row.get('Industries', '').strip() or None
            loc = row.get('Headquarters Location', '').strip() or None
            desc = row.get('Description', '').strip() or None
            rank = parse_int(row.get('CB Rank (Company)'))
            rev = row.get('Estimated Revenue Range', '').strip() or None
            
            comp_id = comp_map.get(name.lower())
            if not comp_id:
                comp_id = uuid.uuid4()
                comp_map[name.lower()] = comp_id
                company = Company(
                    id=comp_id, name=name, website_url=website_url, tenant_id=tenant_id,
                    total_funding_amount=t_funding, last_funding_date=l_date, stage=stage,
                    industries=ind, location=loc, description=desc, cb_rank=rank,
                    estimated_revenue_range=rev
                )
                new_companies.append(company)
            
            # Parse investors
            top = [v.strip() for v in row.get('Top 5 Investors', '').split(',') if v.strip() and v != '—']
            lead = [v.strip() for v in row.get('Lead Investors', '').split(',') if v.strip() and v != '—']
            all_investors = list(set(top + lead))
            
            for inv_name in all_investors:
                vc_id = vc_map.get(inv_name)
                if not vc_id:
                    vc_id = uuid.uuid4()
                    vc_map[inv_name] = vc_id
                    vc = VCFirm(id=vc_id, name=inv_name, website_url="#", is_stub=True)
                    new_vcfirms.append(vc)
                
                link_key = (comp_id, vc_id)
                if link_key not in link_set:
                    link_set.add(link_key)
                    new_links.append(CompanyVCFirmLink(company_id=comp_id, vc_firm_id=vc_id))

    # PHASE 3: Fast bulk database insertion in a single transaction
    logger.info(f"Inserting {len(new_vcfirms)} new VCFirms, {len(new_companies)} new Companies, {len(new_links)} new Links...")
    with Session(engine) as session:
        session.add_all(new_vcfirms)
        session.add_all(new_companies)
        session.flush() # CRITICAL: Push companies to DB so foreign keys for links don't fail
        session.add_all(new_links)
        session.commit()
        
    logger.info("Import complete!")

if __name__ == "__main__":
    import_companies(os.path.join(os.path.dirname(__file__), "data", "crunchbase_companies_968.csv"))
