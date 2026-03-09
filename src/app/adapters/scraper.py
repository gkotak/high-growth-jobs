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
            client=genai.GenerativeModel(model_name="gemini-1.5-flash"),
            mode=instructor.Mode.GEMINI_JSON,
        )

    def scrape_jobs(self, company_id: str, website_url: str, current_hash: Optional[str] = None) -> tuple[List[Job], Optional[str]]:
        """
        Implementation of the Multipass Scraping strategy:
        1. Static BS4 (Cheap/Fast) + Hash Check
        2. AI Link Hopping (BS4 on Career page)
        3. Playwright (Final Fallback)
        
        Returns: (List[Job], new_hash)
        """
        import hashlib
        logger.info(f"Multipass: Starting Tier 3 for {website_url}")
        
        # --- PHASE 1: STATIC BS4 + HASH CHECK ---
        html = self._static_scrape(website_url)
        if html and not self._is_javascript_wall(html):
            # Compute a hash of the visible text to detect changes
            soup = BeautifulSoup(html, "html.parser")
            visible_text = soup.get_text(separator=" ", strip=True)
            new_hash = hashlib.sha256(visible_text.encode('utf-8')).hexdigest()

            if current_hash and new_hash == current_hash:
                logger.info(f"⏭️ Smart Skip: Content hash matches for {website_url}. No changes detected.")
                return [], new_hash

            # Check if jobs are already here
            jobs = self._extract_jobs_with_llm(html, company_id, website_url)
            if jobs:
                logger.info(f"Success: Found {len(jobs)} jobs via static scrape of {website_url}")
                return jobs, new_hash
            
            # --- PHASE 2: AI LINK HOPPING (STATIC) ---
            logger.info("Jobs not found on landing page. Attempting AI link detection...")
            career_link = self._detect_career_link(html, website_url)
            
            if career_link and career_link.startswith("http"):
                logger.info(f"Hopping to detected link: {career_link}")
                career_html = self._static_scrape(career_link)
                if career_html and not self._is_javascript_wall(career_html):
                    jobs = self._extract_jobs_with_llm(career_html, company_id, career_link)
                    if jobs:
                        logger.info(f"Success: Found {len(jobs)} jobs via link-hop to {career_link}")
                        return jobs, new_hash

        # --- PHASE 3: PLAYWRIGHT (THE HAMMER) ---
        logger.info(f"Static methods failed for {website_url}. Falling back to Playwright...")
        browser_html = self._browser_scrape(website_url)
        if browser_html:
            # Re-compute hash from browser content for custom sites
            browser_soup = BeautifulSoup(browser_html, "html.parser")
            browser_text = browser_soup.get_text(separator=" ", strip=True)
            new_hash = hashlib.sha256(browser_text.encode('utf-8')).hexdigest()
            
            if current_hash and new_hash == current_hash:
                logger.info(f"⏭️ Smart Skip: Browser content hash matches for {website_url}.")
                return [], new_hash

            jobs = self._extract_jobs_with_llm(browser_html, company_id, website_url)
            if jobs:
                logger.info(f"Success: Found {len(jobs)} jobs via Playwright for {website_url}")
                return jobs, new_hash

        logger.warning(f"All Multipass Tiers failed for {website_url}")
        return [], None

    def _detect_career_link(self, html: str, url: str) -> Optional[str]:
        """Uses AI to find a 'Careers' link from a static HTML snippet."""
        soup = BeautifulSoup(html, "html.parser")
        # Extract all links with their text
        links = [{"text": a.get_text(strip=True), "href": a.get("href")} for a in soup.find_all("a") if a.get("href")]
        # Truncate to save tokens
        links_context = str(links)[:5000]

        try:
            class LinkDetection(BaseModel):
                status: str
                url: Optional[str]
                reason: str

            from src.app.core.prompts import MULTIPASS_LINK_DETECTION_PROMPT
            prompt = MULTIPASS_LINK_DETECTION_PROMPT.format(url=url, text=links_context)
            
            result = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                response_model=LinkDetection,
            )

            if result.status == "ALREADY_ON_JOBS_PAGE":
                return None
            
            if result.url and result.url.startswith("http"):
                return result.url
                
            # Handle relative URLs
            if result.url and not result.url.startswith("http"):
                from urllib.parse import urljoin
                return urljoin(url, result.url)

            return None
        except Exception as e:
            logger.warning(f"Link detection failed: {e}")
            return None

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

    def _browser_scrape(self, url: str, disable_agentic: bool = False) -> str:
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                Stealth().apply_stealth_sync(page)
                
                logger.info(f"Navigating to {url} via Browser...")
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                
                # Try Agentic Navigation if we don't see jobs immediately
                if not disable_agentic:
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
            from src.app.core.prompts import MULTIPASS_NAVIGATION_PROMPT
            prompt = MULTIPASS_NAVIGATION_PROMPT.format(elements=elements)
            
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
            from src.app.core.prompts import MULTIPASS_JOB_EXTRACTION_SYSTEM, MULTIPASS_JOB_EXTRACTION_USER
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": MULTIPASS_JOB_EXTRACTION_SYSTEM
                    },
                    {
                        "role": "user",
                        "content": MULTIPASS_JOB_EXTRACTION_USER.format(base_url=base_url, clean_text=clean_text)
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
