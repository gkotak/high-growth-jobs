import os
import sys
import logging
from typing import List
from pydantic import BaseModel

# Ensure we can import from src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlmodel import Session, select
from src.app.core.database import engine
from src.data_model.models import VCFirm
from src.app.adapters.scraper import MultipassScraperAdapter
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(name)s: %(message)s')
logger = logging.getLogger(__name__)

class ExtractedVC(BaseModel):
    name: str
    website_url: str
    region: str
    tier: str

class VCList(BaseModel):
    vcs: List[ExtractedVC]

def scrape_and_seed_vcs():
    """
    Scrapes the top VC lists from Vestbee and populates the VCFirm database.
    """
    scraper = MultipassScraperAdapter()
    
    targets = [
        {"url": "https://www.vestbee.com/blog/articles/top-100-vc-funds-from-the-us", "region": "US"},
        {"url": "https://www.vestbee.com/blog/articles/top-100-vc-funds-in-europe", "region": "EU"}
    ]

    session = Session(engine)
    total_added = 0
    
    for target in targets:
        logger.info(f"Scraping {target['region']} VCs from {target['url']}...")
        
        # 1. Grab HTML
        html = scraper._browser_scrape(target['url'], disable_agentic=True)
        if not html:
            logger.error(f"Failed to fetch HTML for {target['url']}")
            continue

        # Clean HTML to reduce tokens (similar to _extract_jobs_with_llm)
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
        for script in soup(["script", "style", "svg", "nav", "footer"]):
            script.decompose()
            
        clean_text = soup.get_text(separator="\n", strip=True)
        # We might only need the core list part. We'll send the first 400k chars.
        clean_text = clean_text[:400000] 
        
        logger.info(f"Extracted {len(clean_text)} characters. Sending to Gemini for parsing...")

        # 2. Extract with LLM
        prompt = f"""
        Extract the list of Top Venture Capital (VC) firms mentioned in the following text.
        For each VC firm, provide its exact name and its website URL.
        Set region to '{target['region']}' and set tier to 'Tier 1' for the top 20, and 'Tier 2' for the rest.
        
        Content:
        {clean_text}
        """

        try:
            response = scraper.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a data extraction bot. Return a list of VC firms."},
                    {"role": "user", "content": prompt}
                ],
                response_model=VCList,
            )
        except Exception as e:
            logger.error(f"Gemini extraction failed for {target['region']}: {e}")
            continue

        # 3. Save to Database
        vcs_found = response.vcs
        logger.info(f"Gemini extracted {len(vcs_found)} VCs for {target['region']}.")
        
        for vc in vcs_found:
            # Check if exists
            existing = session.exec(select(VCFirm).where(VCFirm.name == vc.name)).first()
            if not existing:
                new_vc = VCFirm(
                    name=vc.name.strip(),
                    website_url=vc.website_url.strip(),
                    region=vc.region,
                    tier=vc.tier
                )
                session.add(new_vc)
                total_added += 1
                
        session.commit()
    
    logger.info(f"✅ Seeding complete. Added {total_added} new VC firms to the database.")

if __name__ == "__main__":
    scrape_and_seed_vcs()
