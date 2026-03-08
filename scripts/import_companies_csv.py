import os
import sys
import logging
import csv
import uuid
import glob
from typing import Optional, List, Dict
from datetime import datetime
from dateutil import parser
from sqlmodel import Session, create_engine, select
from sqlalchemy import func
from sqlalchemy.orm import attributes
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.data_model.models import Company, VCFirm, Tenant, CompanyVCFirmLink

logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.error("DATABASE_URL not found")
    sys.exit(1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def parse_int(val: str, column_name: str = "Unknown") -> Optional[int]:
    if not val or val == '—':
        return None
    try:
        return int(val.replace(',', '').strip())
    except ValueError:
        logger.warning(f"Failed to parse '{val}' as integer for column '{column_name}'")
        return None

def parse_date(val: str):
    if not val or val == '—':
        return None
    try:
        if isinstance(val, datetime):
            return val
        return parser.parse(str(val))
    except Exception:
        return None

def clean_url(url: str) -> str:
    if not url or url == '—':
        return "#"
    url = url.strip()
    if not url.startswith('http'):
        url = f"https://{url}"
    return url

def import_all_csvs(data_dir: str):
    csv_files = glob.glob(os.path.join(data_dir, "crunchbase_companies_new_*.csv"))
    if not csv_files:
        logger.error(f"No matching CSV files found in {data_dir}")
        return

    logger.info(f"Found {len(csv_files)} CSV files to process.")

    # PHASE 1: Initialize metadata
    with Session(engine) as session:
        tenant = session.exec(select(Tenant).where(Tenant.slug == "system")).first()
        if not tenant:
            tenant = Tenant(name="System Tenant", slug="system")
            session.add(tenant)
            session.commit()
            session.refresh(tenant)
        tenant_id = tenant.id
        
        # Load existing VCs to avoid duplicates
        db_vcs = session.exec(select(VCFirm)).all()
        vc_map = {vc.name: vc.id for vc in db_vcs}
        
        # Load companies for de-duplication
        db_comps = session.exec(select(Company).where(Company.tenant_id == tenant_id)).all()
        # Map by name and website for de-duplication
        comp_map = {(c.name.lower(), c.website_url.replace("https://", "").replace("http://", "").strip("/").lower()): c for c in db_comps}
        
        db_links = session.exec(select(CompanyVCFirmLink)).all()
        link_set = {(l.company_id, l.vc_firm_id) for l in db_links}

        # PHASE 2: Accumulate updates and inserts
        new_companies_objs = []
        updated_companies_count = 0
        new_links_objs = []
        unique_vcs_to_add = {} # name -> VCFirm obj

        for file_path in sorted(csv_files):
            logger.info(f"Processing {os.path.basename(file_path)}...")
            with open(file_path, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    name = row.get('Organization Name', '').strip()
                    if not name:
                        continue
                        
                    website_url = clean_url(row.get('Website', ''))
                    website_key = website_url.replace("https://", "").replace("http://", "").strip("/").lower()
                    
                    # Metadata from CSV
                    t_funding = row.get('Total Funding Amount', '').strip() or None
                    l_funding = row.get('Last Funding Amount', '').strip() or None
                    l_date = parse_date(row.get('Last Funding Date'))
                    stage = row.get('Stage Track Stages', '').strip() or None
                    ind = row.get('Industries', '').strip() or None
                    loc = row.get('Headquarters Location', '').strip() or None
                    desc = row.get('Description', '').strip() or None
                    rank = parse_int(row.get('CB Rank (Company)'), 'CB Rank (Company)')
                    rev = row.get('Estimated Revenue Range', '').strip() or None
                    
                    emp_count = row.get('Number of Employees', '').strip() or None
                    f_date = row.get('Founded Date', '').strip() or None
                    twitter = row.get('Twitter URL', '').strip() or None
                    linkedin = row.get('LinkedIn URL', '').strip() or None

                    comp_record = comp_map.get((name.lower(), website_key))
                    
                    if comp_record:
                        # UPDATING existing record (in-session object)
                        comp_record.total_funding_amount = t_funding or comp_record.total_funding_amount
                        comp_record.last_funding_amount = l_funding or comp_record.last_funding_amount
                        comp_record.last_funding_date = l_date or comp_record.last_funding_date
                        comp_record.stage = stage or comp_record.stage
                        comp_record.industries = ind or comp_record.industries
                        comp_record.location = loc or comp_record.location
                        comp_record.employee_count = emp_count or comp_record.employee_count
                        comp_record.founded_date = f_date or comp_record.founded_date
                        comp_record.twitter_url = twitter or comp_record.twitter_url
                        comp_record.linkedin_url = linkedin or comp_record.linkedin_url
                        comp_record.cb_rank = rank or comp_record.cb_rank
                        comp_record.updated_at = datetime.utcnow()
                        updated_companies_count += 1
                        comp_id = comp_record.id
                    else:
                        # NEW record
                        comp_id = uuid.uuid4()
                        company = Company(
                            id=comp_id, 
                            name=name, 
                            website_url=website_url, 
                            tenant_id=tenant_id,
                            total_funding_amount=t_funding, 
                            last_funding_amount=l_funding,
                            last_funding_date=l_date, 
                            stage=stage,
                            industries=ind, 
                            location=loc, 
                            description=desc, 
                            cb_rank=rank,
                            estimated_revenue_range=rev,
                            employee_count=emp_count,
                            founded_date=f_date,
                            twitter_url=twitter,
                            linkedin_url=linkedin
                        )
                        new_companies_objs.append(company)
                        comp_map[(name.lower(), website_key)] = company # Track to avoid re-adding if same file has dupes
                    
                    # Investors
                    top = [v.strip() for v in row.get('Top 5 Investors', '').split(',') if v.strip() and v != '—']
                    lead = [v.strip() for v in row.get('Lead Investors', '').split(',') if v.strip() and v != '—']
                    all_investors = list(set(top + lead))
                    
                    for inv_name in all_investors:
                        vc_id = vc_map.get(inv_name)
                        if not vc_id:
                            # Check if we already created it in this run
                            if inv_name not in unique_vcs_to_add:
                                vc_id = uuid.uuid4()
                                vc = VCFirm(id=vc_id, name=inv_name, website_url="#", is_stub=True)
                                unique_vcs_to_add[inv_name] = vc
                            else:
                                vc_id = unique_vcs_to_add[inv_name].id
                        
                        link_key = (comp_id, vc_id)
                        if link_key not in link_set:
                            link_set.add(link_key)
                            new_links_objs.append(CompanyVCFirmLink(company_id=comp_id, vc_firm_id=vc_id))

        # PHASE 3: Bulk Save
        logger.info(f"Done parsing. Summary:")
        logger.info(f" - {len(new_companies_objs)} NEW companies")
        logger.info(f" - {updated_companies_count} UPDATED companies")
        logger.info(f" - {len(unique_vcs_to_add)} NEW VC firms (stubs)")
        logger.info(f" - {len(new_links_objs)} NEW company-vc links")

        # 1. Add new VCs
        if unique_vcs_to_add:
            session.add_all(unique_vcs_to_add.values())
        
        # 2. Add new companies
        if new_companies_objs:
            session.add_all(new_companies_objs)
            
        session.flush()
        
        # 3. Add links
        if new_links_objs:
            session.add_all(new_links_objs)
            
        session.commit()
        
    logger.info("Import successful!")

if __name__ == "__main__":
    data_directory = os.path.join(os.path.dirname(__file__), "data")
    import_all_csvs(data_directory)
