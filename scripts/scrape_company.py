import os
import sys
import argparse
import logging
from sqlmodel import Session, select
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.app.core.database import engine
from src.data_model.models import Company
from src.app.services.janitor import JanitorService
from src.app.core.logging_setup import setup_logger

logger = setup_logger("ManualScraper")

def scrape_single_company(identifier: str):
    """
    Scrapes a single company by name or exact website URL.
    """
    load_dotenv()
    
    with Session(engine) as session:
        # Try to find the company
        statement = select(Company).where(
            (Company.website_url == identifier) | 
            (Company.name.ilike(f"%{identifier}%"))
        )
        companies = session.exec(statement).all()
        
        if not companies:
            logger.error(f"❌ Could not find any company matching '{identifier}' in the database.")
            logger.info("Please provide an exact website (e.g., 'https://www.stripe.com') or name.")
            return
            
        if len(companies) > 1:
            logger.warning(f"⚠️ Found {len(companies)} matching companies. Using the first one: {companies[0].name} ({companies[0].website_url})")
            
        company = companies[0]
        logger.info(f"🚀 Initiating targeted scrape for: {company.name} ({company.website_url})")
        
        # We can just use the internal process_company logic from the Janitor
        # which handles the Orchestrator + DB updating perfectly
        service = JanitorService()
        
        # Temporarily clear the hash just for this manual run so it forces a scrape
        original_hash = company.last_content_hash
        company.last_content_hash = None
        
        try:
            service._process_company(session, company)
            # The session is flushed inside _process_company, so we commit the final result
            session.commit()
            logger.info("✅ Targeted scrape completed successfully.")
        except Exception as e:
            logger.error(f"❌ Scrape failed: {e}")
            session.rollback()
        finally:
            # If nothing was found, we might want to put the hash back so we don't break the background loop
            if original_hash and not company.last_content_hash:
                company.last_content_hash = original_hash
                session.add(company)
                session.commit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Manually scrape a single company from the DB.")
    parser.add_argument("identifier", help="The company name or website URL (e.g., 'Anthropic' or 'https://anthropic.com')")
    args = parser.parse_args()
    
    scrape_single_company(args.identifier)
