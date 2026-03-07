import os
import sys
import argparse
import logging
import asyncio
import httpx
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid
from sqlmodel import Session, create_engine, select
from dotenv import load_dotenv
from openai import AsyncOpenAI

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.data_model.models import Company, VCFirm, Tenant, CompanyVCFirmLink

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not DATABASE_URL:
    logger.error("DATABASE_URL not found in .env")
    sys.exit(1)

if not OPENAI_API_KEY:
    logger.error("OPENAI_API_KEY not found in .env")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
client = AsyncOpenAI(api_key=OPENAI_API_KEY)

class FundingDeal(BaseModel):
    company_name: str = Field(description="Name of the company raising funds")
    total_funding_amount: Optional[str] = Field(description="Amount raised in this round, e.g. '$10M'")
    stage: Optional[str] = Field(description="Stage of funding, e.g. 'Series A', 'Seed'")
    industries: Optional[str] = Field(description="Industry or sector of the company")
    location: Optional[str] = Field(description="Headquarters location, e.g. 'New York', 'San Francisco'")
    description: Optional[str] = Field(description="Brief description of what the company does")
    investors: List[str] = Field(description="List of investors participating in the round")

class DealsList(BaseModel):
    deals: List[FundingDeal]

async def fetch_axios_prorata(url: str) -> str:
    # Use Jina.ai's reader API to bypass Cloudflare and return clean markdown
    jina_url = f"https://r.jina.ai/{url}"
    
    headers = {
        "User-Agent": "curl/8.7.1",
        "Accept": "*/*"
    }
    
    # Increase timeout because the proxy might take a few seconds to render JavaScript pages
    async with httpx.AsyncClient(headers=headers, timeout=30.0) as http_client:
        response = await http_client.get(jina_url, follow_redirects=True)
        response.raise_for_status()
        return response.text

def extract_vc_deals_text(html: str) -> Optional[str]:
    soup = BeautifulSoup(html, 'html.parser')
    
    # We want to extract just the VC deals section.
    # In Axios, it's typically under a header "Venture Capital Deals"
    full_text = soup.get_text(separator="\n", strip=True)
    
    start_flags = ["Venture Capital Deals", "Venture capital deals", "Venture Capital deals", "Venture Capital"]
    end_flags = ["Private Equity Deals", "Private equity deals", "Private Equity deals", "Private equity", "PE deals"]
    
    start_idx = -1
    for flag in start_flags:
        idx = full_text.find(flag)
        if idx != -1:
            start_idx = idx
            break
            
    if start_idx == -1:
        # Fallback: Just return the whole text and let the LLM filter it
        logger.warning("Could not explicitly isolate 'Venture Capital Deals' header. Falling back to parsing full HTML text.")
        return full_text
        
    end_idx = len(full_text)
    for flag in end_flags:
        idx = full_text.find(flag, start_idx)
        if idx != -1 and idx < end_idx:
            end_idx = idx
            
    return full_text[start_idx:end_idx]

async def extract_deals_with_ai(text: str) -> List[FundingDeal]:
    logger.info("Extracting deals using OpenAI (gpt-4o-mini)...")
    
    prompt = f"""
    Extract all funding deals from the following text (which is typically a section from an Axios Pro Rata newsletter).
    For each deal, extract the company name, funding amount, stage (e.g. Series A, Seed, Pre-seed, Debt), industries, location, a brief description, and the list of investors.
    Include all companies mentioned that are raising funds, regardless of the explicit stage. Include Seed, Pre-seed, and un-bracketed equity rounds.
    
    Text snippet:
    {text}
    """
    
    try:
        response = await client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a specialized AI agent that extracts venture capital funding data from news articles into structured JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format=DealsList,
            temperature=0.0
        )
        
        parsed = response.choices[0].message.parsed
        if parsed:
            return parsed.deals
        return []
    except Exception as e:
        logger.error(f"Failed to extract deals via OpenAI: {e}")
        return []

def upsert_deals(deals: List[FundingDeal]):
    if not deals:
        logger.info("No deals to upsert.")
        return
        
    logger.info(f"Upserting {len(deals)} deals into the database...")
    
    with Session(engine) as session:
        # Resolve Tenant
        tenant = session.exec(select(Tenant).where(Tenant.slug == "system")).first()
        if not tenant:
            tenant = Tenant(name="System Tenant", slug="system")
            session.add(tenant)
            session.commit()
            session.refresh(tenant)
            
        today = datetime.utcnow()
        created_comps = 0
        updated_comps = 0
        created_vcs = 0
        seen_links = set()
        
        for deal in deals:
            # Query Company by name (case-insensitive approximation)
            comp_stmt = select(Company).where(Company.tenant_id == tenant.id).where(Company.name == deal.company_name)
            company = session.exec(comp_stmt).first()
            
            if not company:
                company = Company(
                    id=uuid.uuid4(),
                    name=deal.company_name,
                    tenant_id=tenant.id,
                    website_url="#",
                    total_funding_amount=deal.total_funding_amount,
                    last_funding_date=today,
                    stage=deal.stage,
                    industries=deal.industries,
                    location=deal.location,
                    description=deal.description
                )
                session.add(company)
                created_comps += 1
            else:
                updated_comps += 1
                if deal.total_funding_amount:
                    company.total_funding_amount = deal.total_funding_amount
                company.last_funding_date = today
                if deal.stage:
                    company.stage = deal.stage
                if deal.industries:
                    company.industries = deal.industries
                if deal.location:
                    company.location = deal.location
                if deal.description:
                    company.description = deal.description
            
            session.flush() # Ensure company gets its UUID populated for foreign keys
            
            # Upsert Investors and link them
            for inv_name in deal.investors:
                if not inv_name.strip():
                    continue
                    
                vc_stmt = select(VCFirm).where(VCFirm.name == inv_name)
                vc = session.exec(vc_stmt).first()
                if not vc:
                    vc = VCFirm(id=uuid.uuid4(), name=inv_name, website_url="#", is_stub=True)
                    session.add(vc)
                    session.flush()
                    created_vcs += 1
                
                # Check for existing link
                link_key = (company.id, vc.id)
                if link_key in seen_links:
                    continue
                seen_links.add(link_key)
                
                link_stmt = select(CompanyVCFirmLink).where(
                    CompanyVCFirmLink.company_id == company.id,
                    CompanyVCFirmLink.vc_firm_id == vc.id
                )
                if not session.exec(link_stmt).first():
                    session.add(CompanyVCFirmLink(company_id=company.id, vc_firm_id=vc.id))
                    
        session.commit()
        logger.info(f"Finished upserting: Created {created_comps} companies, updated {updated_comps} existing ones, created {created_vcs} VC stubs.")

async def main(source: str):
    logger.info(f"Initiating ingestion from: {source}")
    try:
        if os.path.exists(source):
            with open(source, 'r', encoding='utf-8') as f:
                content = f.read()
        else:
            if not source.startswith("http"):
                logger.error(f"Provided source is neither a valid file path nor a URL: {source}")
                return
            content = await fetch_axios_prorata(source)
    except Exception as e:
        logger.error(f"Failed to retrieve content from {source}: {e}")
        return
        
    text_snippet = extract_vc_deals_text(content)
    if not text_snippet:
        logger.warning("No text was extracted to send to the AI.")
        return
        
    logger.info(f"Isolated {len(text_snippet)} characters of relevant context.")
    deals = await extract_deals_with_ai(text_snippet)
    
    if deals:
        logger.info(f"AI Output: {len(deals)} valid funding events parsed.")
        for d in deals:
            logger.info(f" ╰─ {d.company_name}: {d.total_funding_amount} ({d.stage}) from {', '.join(d.investors)}")
        
        upsert_deals(deals)
    else:
        logger.warning("AI did not return any deals. Check the text snippet.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest VC Deals from an Axios Pro Rata Newsletter URL or Local File")
    parser.add_argument("source", help="URL of the Axios Pro Rata post OR path to a local html/text file")
    args = parser.parse_args()
    
    asyncio.run(main(args.source))
