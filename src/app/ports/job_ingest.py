from abc import ABC, abstractmethod
from typing import List, Tuple, Optional
from src.data_model.models import Job

class JobIngestPort(ABC):
    @abstractmethod
    async def scrape_jobs(self, company_id: str, website_url: str, current_hash: Optional[str] = None) -> Tuple[List[Job], Optional[str]]:
        """
        Scrapes a career directory page and returns discovered jobs + a content hash.
        """
        pass

    @abstractmethod
    async def deep_scrape_job(self, job_url: str) -> str:
        """
        Extracts the full raw text body from a specific job description page.
        """
        pass
