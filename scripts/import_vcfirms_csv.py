import os
import sys
import logging
import csv
from typing import Optional
from sqlmodel import Session, create_engine, select
from dotenv import load_dotenv

# Ensure we can import from src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.data_model.models import VCFirm

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# Load local environment
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.error("DATABASE_URL not found in .env")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

def parse_int(val: str, column_name: str = "Unknown") -> Optional[int]:
    """Helper to parse Crunchbase integer strings (e.g., '1,049' -> 1049)."""
    if not val or val == '—':
        return None
    try:
        # Remove commas and convert
        clean_val = val.replace(',', '').strip()
        return int(clean_val)
    except ValueError:
        logger.warning(f"Failed to parse '{val}' as integer for column '{column_name}'")
        return None

def import_csv(file_path: str):
    logger.info(f"Starting import from {file_path}")
    
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return
        
    created_count = 0
    updated_count = 0

    with open(file_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        
        with Session(engine) as session:
            for row in reader:
                name = row.get('Organization/Person Name', '').strip()
                if not name:
                    continue
                    
                website_url = row.get('Website', '').strip()
                
                # We need a fallback URL if one isn't provided, though the model requires it right now
                if not website_url:
                    website_url = "#"
                elif not website_url.startswith('http'):
                    website_url = f"https://{website_url}"
                
                print(f"Processing row {created_count + updated_count + 1}: {name}")
                stmt = select(VCFirm).where(VCFirm.name == name)
                vc = session.exec(stmt).first()
                print(f"Fetched {name}")
                
                if not vc:
                    vc = VCFirm(name=name, website_url=website_url)
                    created_count += 1
                else:
                    # Update website just in case it's better
                    vc.website_url = website_url
                    updated_count += 1
                
                # Map Crunchbase data
                vc.num_portfolio_orgs = parse_int(row.get('Number of Portfolio Organizations'), 'Number of Portfolio Organizations')
                vc.investor_type = row.get('Investor Type', '').strip() or None
                vc.num_investments = parse_int(row.get('Number of Investments'), 'Number of Investments')
                vc.num_exits = parse_int(row.get('Number of Exits'), 'Number of Exits')
                vc.location = row.get('Location', '').strip() or None
                vc.cb_rank = parse_int(row.get('CB Rank (Investor)'), 'CB Rank (Investor)')
                
                session.add(vc)
                
                # Commit in batches of 100 for safety and speed
                if (created_count + updated_count) % 100 == 0:
                    session.commit()
            
            # Final commit
            session.commit()
            
    logger.info(f"Import complete! Created: {created_count}, Updated: {updated_count}")
    
if __name__ == "__main__":
    csv_path = os.path.join(os.path.dirname(__file__), "data", "crunchbase_vc_firms_830.csv")
    import_csv(csv_path)
