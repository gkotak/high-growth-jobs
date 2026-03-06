import os
import sys
import logging
from dotenv import load_dotenv

load_dotenv()

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Setup logging to be very clear about levels
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")

from src.app.core.orchestrator import MarketScraperOrchestrator
from src.data_model.models import Company

def run_seed_company_test():
    orchestrator = MarketScraperOrchestrator()
    
    # Using the most common career entry points for these seeded companies
    seed_companies = [
        Company(id="id-1", name="Anthropic", website_url="https://boards.greenhouse.io/anthropic"),
        Company(id="id-2", name="Stripe", website_url="https://stripe.com/jobs/search"),
        Company(id="id-3", name="OpenAI", website_url="https://openai.com/careers")
    ]

    results = []

    for company in seed_companies:
        print(f"\n--- SCRAPING {company.name.upper()} ---")
        print(f"URL: {company.website_url}")
        
        jobs = orchestrator.run_for_company(company)
        
        # Determine Level based on logs (this is manual interpretation for the user)
        results.append({
            "name": company.name,
            "jobs_found": len(jobs),
            "url": company.website_url
        })

    print("\n" + "="*50)
    print("FINAL SUMMARY REPORT")
    print("="*50)
    for r in results:
        print(f"Company: {r['name']}")
        print(f"Jobs Extracted: {r['jobs_found']}")
        # I will manually add the level based on the command output in the response
    print("="*50)

if __name__ == "__main__":
    run_seed_company_test()
