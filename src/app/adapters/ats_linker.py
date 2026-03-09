import httpx
from typing import List, Tuple, Optional
import asyncio
import re
from uuid import uuid4
from src.app.ports.job_ingest import JobIngestPort
from src.data_model.models import Job

class ATSLinkerAdapter(JobIngestPort):
    """
    Handles standard ATS platforms like Greenhouse, Lever, and Ashby
    by using their public JSON/API feeds.
    """
    async def scrape_jobs(self, company_id: str, careers_url: str, current_hash: Optional[str] = None) -> Tuple[List[Job], Optional[str]]:
        # 1. Try to detect from the URL directly
        if "greenhouse.io" in careers_url:
            return await self._handle_greenhouse(careers_url, company_id), None
        elif "lever.co" in careers_url:
            return await self._handle_lever(careers_url, company_id), None
        elif "ashbyhq.com" in careers_url:
            return await self._handle_ashby(careers_url, company_id), None
            
        return [], None

    async def probe_for_ats(self, company_name: str, careers_url: str, company_id: str) -> List[Job]:
        """
        Actively tries to guest the ATS slug based on the company name
        if the careers_url is a custom domain.
        """
        slug = company_name.lower().replace(" ", "")
        
        # Try Ashby first (common for high-growth)
        ashby_jobs = await self._handle_ashby(f"https://jobs.ashbyhq.com/{slug}", company_id)
        if ashby_jobs: return ashby_jobs
        
        # Try Greenhouse
        greenhouse_jobs = await self._handle_greenhouse(f"https://boards.greenhouse.io/{slug}", company_id)
        if greenhouse_jobs: return greenhouse_jobs
        
        # Try Lever
        lever_jobs = await self._handle_lever(f"https://jobs.lever.co/{slug}", company_id)
        if lever_jobs: return lever_jobs
        
        return []

    async def deep_scrape_job(self, job_url: str) -> str:
        """
        Fallback implementation. For ATS, usually we would hit the JSON API again or Phase 2 Enrichment will handle it via HTTP.
        """
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(job_url, timeout=10.0)
                return res.text
        except:
            return ""

    async def _handle_greenhouse(self, url: str, company_id: str) -> List[Job]:
        match = re.search(r"greenhouse.io/([^/?#]+)", url)
        if not match: return []
        board_slug = match.group(1)
        # Adding content=true fetches job descriptions if we want to deep-scrape immediately in the future
        api_url = f"https://boards-api.greenhouse.io/v1/boards/{board_slug}/jobs"
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(api_url)
                if response.status_code != 200: return []
                data = response.json()
                jobs = []
                for item in data.get("jobs", []):
                    jobs.append(Job(
                        title=item["title"],
                        location=item["location"]["name"],
                        job_url=item["absolute_url"],
                        company_id=company_id,
                        needs_deep_scrape=True,
                    ))
                return jobs
        except:
            return []

    async def _handle_lever(self, url: str, company_id: str) -> List[Job]:
        match = re.search(r"lever.co/([^/?#]+)", url)
        if not match: return []
        slug = match.group(1)
        api_url = f"https://api.lever.co/v0/postings/{slug}"
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(api_url)
                if response.status_code != 200: return []
                data = response.json()
                jobs = []
                if not isinstance(data, list): return []
                for item in data:
                    jobs.append(Job(
                        title=item["text"],
                        location=item["categories"]["location"],
                        job_url=item["hostedUrl"],
                        company_id=company_id,
                        needs_deep_scrape=True,
                    ))
                return jobs
        except:
            return []

    async def _handle_ashby(self, url: str, company_id: str) -> List[Job]:
        match = re.search(r"ashbyhq.com/([^/?#]+)", url)
        if not match: return []
        slug = match.group(1)
        
        api_url = f"https://api.ashbyhq.com/posting-api/job-board/{slug}"
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(api_url)
                if response.status_code != 200: return []
                data = response.json()
                jobs = []
                for item in data.get("jobs", []):
                    jobs.append(Job(
                        title=item["title"],
                        location=item.get("location", "Remote"),
                        job_url=item["jobUrl"],
                        company_id=company_id,
                        needs_deep_scrape=True,
                    ))
                return jobs
        except:
            return []
