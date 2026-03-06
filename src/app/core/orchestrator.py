from typing import List
from src.app.adapters.ats_linker import ATSLinkerAdapter
from src.app.adapters.scraper import MultipassScraperAdapter
from src.data_model.models import Job, Company
import logging

logger = logging.getLogger(__name__)

class MarketScraperOrchestrator:
    def __init__(self):
        self.ats_linker = ATSLinkerAdapter()
        self.multipass_scraper = MultipassScraperAdapter()

    def run_for_company(self, company: Company) -> List[Job]:
        """
        Runs the scraping sequence for a company.
        """
        if not company.website_url:
            logger.warning(f"No website URL for company {company.name}")
            return []

        # Step 1: Try ATS Linker (Level 0)
        logger.info(f"Checking ATS for {company.name}")
        jobs = self.ats_linker.scrape_jobs(str(company.id), company.website_url)
        
        if jobs:
            logger.info(f"Found {len(jobs)} jobs via ATS Linker for {company.name}")
            return jobs

        # Step 1.5: Proactive ATS Probe (Try common slugs)
        logger.info(f"Probing ATS for {company.name}")
        jobs = self.ats_linker.probe_for_ats(company.name, company.website_url, str(company.id))
        if jobs:
            logger.info(f"Found {len(jobs)} jobs via ATS Probing for {company.name}")
            return jobs

        # Step 2: Try Multipass Scraper (Level 1 & 2)
        logger.info(f"Using Multipass Scraper for {company.name}")
        jobs = self.multipass_scraper.scrape_jobs(str(company.id), company.website_url)
        
        return jobs
