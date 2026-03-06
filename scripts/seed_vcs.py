import os
import sys
import json
import logging
from typing import List

# Ensure we can import from src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlmodel import Session, select
from src.app.core.database import engine
from src.data_model.models import VCFirm
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(name)s: %(message)s')
logger = logging.getLogger(__name__)

def seed_vcs_from_json():
    """
    Reads the curated Top VC list from JSON and populates the database.
    This avoids brittle scraping and provides perfect URLs for Epic 2.
    """
    json_path = os.path.join(os.path.dirname(__file__), "data", "initial_seed_top_vcs.json")
    
    if not os.path.exists(json_path):
        logger.error(f"JSON data file not found at {json_path}")
        return

    with open(json_path, 'r') as f:
        vcs = json.load(f)

    session = Session(engine)
    total_added = 0
    total_skipped = 0
    
    logger.info(f"Loaded {len(vcs)} VCs from JSON. Beginning database insertion...")

    for vc in vcs:
        # Check if exists
        name = vc.get("name", "").strip()
        existing = session.exec(select(VCFirm).where(VCFirm.name == name)).first()
        
        if not existing:
            new_vc = VCFirm(
                name=name,
                website_url=vc.get("website_url", "").strip(),
                region=vc.get("region", ""),
                tier=vc.get("tier", "")
            )
            session.add(new_vc)
            total_added += 1
        else:
            # Optionally update fields if it already exists, but here we just skip
            total_skipped += 1
            
    session.commit()
    
    logger.info(f"✅ Seeding complete. Added {total_added} new VC firms. (Skipped {total_skipped} duplicates).")

if __name__ == "__main__":
    seed_vcs_from_json()
