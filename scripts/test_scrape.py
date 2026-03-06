import os
import sys
import logging
from dotenv import load_dotenv

load_dotenv()

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

from src.app.core.orchestrator import MarketScraperOrchestrator
from src.data_model.models import Company

def test_scrape():
    orchestrator = MarketScraperOrchestrator()
    
    test_companies = [
        Company(id="test-openai-id", name="OpenAI", website_url="https://openai.com/careers"),
        Company(id="test-anthropic-id", name="Anthropic", website_url="https://boards.greenhouse.io/anthropic"),
        Company(id="test-stripe-id", name="Stripe", website_url="https://stripe.com/jobs/search")
    ]

    for test_company in test_companies:
        print(f"\n🚀 Testing scrape for {test_company.name} ({test_company.website_url})...")
        jobs = orchestrator.run_for_company(test_company)

        print(f"✅ Found {len(jobs)} jobs!")
        for job in jobs[:3]:
            print(f"  - {job.title} ({job.location}) -> {job.job_url[:50]}...")
        
        if len(jobs) > 3:
            print(f"  ... and {len(jobs) - 3} more.")

if __name__ == "__main__":
    test_scrape()
