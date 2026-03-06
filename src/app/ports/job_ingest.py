from abc import ABC, abstractmethod
from typing import List
from src.data_model.models import Job

class JobIngestPort(ABC):
    @abstractmethod
    def scrape_jobs(self, company_id: str, careers_url: str) -> List[Job]:
        """
        Scrapes jobs from a given URL and returns a list of Job objects.
        """
        pass
