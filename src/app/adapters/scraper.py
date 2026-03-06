import os
import httpx
import instructor
import google.generativeai as genai
from bs4 import BeautifulSoup
from pydantic import BaseModel
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from typing import List, Optional
from src.app.ports.job_ingest import JobIngestPort
from src.data_model.models import Job
import logging

logger = logging.getLogger(__name__)

class ExtractedJob(BaseModel):
    title: str
    location: str
    job_url: str
    department: Optional[str] = None
    salary_range: Optional[str] = None

class JobList(BaseModel):
    jobs: List[ExtractedJob]

class MultipassScraperAdapter(JobIngestPort):
    def __init__(self):
        if os.getenv("GEMINI_API_KEY"):
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        
        self.client = instructor.from_gemini(
            model="gemini-2.5-flash",
            mode=instructor.Mode.GEMINI_JSON,
        )

    def scrape_jobs(self, company_id: str, careers_url: str) -> List[Job]:
        """
        Implementation of the Multipass Scraping strategy.
        """
        # Level 1: Try Static Scrape (Fast)
        logger.info(f"Attempting static scrape for {careers_url}")
        html = self._static_scrape(careers_url)
        
        if self._is_javascript_wall(html):
            logger.info("JavaScript wall detected. Retrying with Playwright...")
            html = self._browser_scrape(careers_url)

        if not html:
            return []

        # Level 2: Parse and Extract (Gemini Intelligence)
        return self._extract_jobs_with_llm(html, company_id, careers_url)

    def _static_scrape(self, url: str) -> str:
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            with httpx.Client(follow_redirects=True, timeout=15.0, headers=headers) as client:
                response = client.get(url)
                return response.text
        except Exception as e:
            logger.error(f"Static scrape failed: {e}")
            return ""

    def _browser_scrape(self, url: str) -> str:
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                Stealth().apply_stealth_sync(page)
                
                logger.info(f"Navigating to {url} via Browser...")
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                
                # Try Agentic Navigation if we don't see jobs immediately
                self._navigate_agentically(page)
                
                # Final wait for any lazy-loading content
                page.wait_for_timeout(10000) 
                content = page.content()
                browser.close()
                return content
        except Exception as e:
            logger.error(f"Browser scrape failed: {e}")
            return ""

    def _navigate_agentically(self, page):
        """
        Uses LLM to find the 'See Jobs' button if we are stuck on a landing page.
        """
        # 1. Capture all clickable elements
        elements = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('a, button'))
                .map(el => ({
                    text: el.innerText.trim(),
                    tag: el.tagName,
                    id: el.id,
                    className: el.className
                }))
                .filter(el => el.text.length > 2 && el.text.length < 50)
                .slice(0, 50);
        }""")

        if not elements:
            return

        logger.info(f"Analyzing {len(elements)} clickable elements for navigation...")
        
        try:
            # Definition for the navigation action
            class NavigationAction(BaseModel):
                element_text: str
                reason: str

            # Ask Gemini which element to click
            prompt = f"Given these UI elements found on a career site's landing page, return the TEXT of the one most likely to lead to a list of ALL job openings or a 'Search jobs' view. If already looking at a list of job titles, return 'NONE'. \n\nElements: {elements}"
            
            action = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                response_model=NavigationAction,
            )

            if action.element_text.upper() != "NONE":
                logger.info(f"Agentic Nav: Clicking '{action.element_text}' because {action.reason}")
                page.click(f"text='{action.element_text}'", timeout=5000)
                page.wait_for_timeout(3000)
            else:
                logger.info("Agentic Nav: Already on target page.")

        except Exception as e:
            logger.warning(f"Agentic navigation skipped: {e}")
            page.wait_for_timeout(3000) # Fallback wait

    def _is_javascript_wall(self, html: str) -> bool:
        if not html:
            return True
        soup = BeautifulSoup(html, "html.parser")
        text_content = soup.get_text().lower()
        if "javascript" in text_content and ("enable" in text_content or "required" in text_content):
            return True
        if len(soup.get_text()) < 500 and len(html) > 5000:
            return True
        return False

    def _extract_jobs_with_llm(self, html: str, company_id: str, base_url: str) -> List[Job]:
        # Clean HTML to save tokens
        soup = BeautifulSoup(html, "html.parser")
        # Keep nav/footer for now as they might contain important links
        for script in soup(["script", "style", "svg"]):
            script.decompose()
        
        # Get a more readable version of the text
        clean_text = soup.get_text(separator="\n", strip=True)
        # If text is too small, maybe we are blocked
        if len(clean_text) < 200:
            logger.warning(f"Extracted text is very short ({len(clean_text)} chars). Site might be blocking or empty.")
            # Let's try to keep some HTML structure if text is too thin
            clean_text = str(soup.body)[:20000]

        logger.info(f"Sending {len(clean_text[:15000])} characters to Gemini for extraction...")

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at extracting job listings from website content. Return a JSON list of jobs found."
                    },
                    {
                        "role": "user",
                        "content": f"Extract all job listings from this content. Ensure URLs are absolute using {base_url} if needed. \n\nContent:\n{clean_text}"
                    }
                ],
                response_model=JobList,
            )

            result_jobs = []
            for ext in response.jobs:
                result_jobs.append(Job(
                    title=ext.title,
                    location=ext.location,
                    job_url=ext.job_url,
                    department=ext.department,
                    salary_range=ext.salary_range,
                    company_id=company_id,
                ))
            
            logger.info(f"Gemini extracted {len(result_jobs)} jobs.")
            return result_jobs
            
        except Exception as e:
            logger.error(f"LLM extraction failed: {e}")
            return []
