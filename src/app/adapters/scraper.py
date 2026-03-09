import os
import httpx
import asyncio
import instructor
import google.generativeai as genai
from bs4 import BeautifulSoup
from pydantic import BaseModel
from playwright.async_api import async_playwright
from playwright_stealth import Stealth
from typing import List, Optional, Tuple
import hashlib
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
            client=genai.GenerativeModel(model_name="gemini-2.5-flash"),
            mode=instructor.Mode.GEMINI_JSON,
        )

    async def scrape_jobs(self, company_id: str, website_url: str, current_hash: Optional[str] = None) -> Tuple[List[Job], Optional[str]]:
        """
        Implementation of the Multipass Scraping strategy:
        1. Static BS4 (Cheap/Fast) + Hash Check
        2. AI Link Hopping (BS4 on Career page)
        3. Playwright (Final Fallback)
        """
        logger.info(f"Multipass: Starting Tier 3 for {website_url}")
        
        # --- PHASE 1: STATIC BS4 + HASH CHECK ---
        html = await self._static_scrape(website_url)
        if html and not self._is_javascript_wall(html):
            soup = BeautifulSoup(html, "html.parser")
            visible_text = soup.get_text(separator=" ", strip=True)
            new_hash = hashlib.sha256(visible_text.encode('utf-8')).hexdigest()

            if current_hash and new_hash == current_hash:
                logger.info(f"⏭️ Smart Skip: Content hash matches for {website_url}. No changes detected.")
                return [], new_hash

            jobs = await self._extract_jobs_with_llm(html, company_id, website_url)
            if jobs:
                logger.info(f"Success: Found {len(jobs)} jobs via static scrape of {website_url}")
                return jobs, new_hash
            
            # --- PHASE 2: AI LINK HOPPING (STATIC) ---
            logger.info("Jobs not found on landing page. Attempting AI link detection...")
            career_link = await self._detect_career_link(html, website_url)
            
            if career_link and career_link.startswith("http"):
                logger.info(f"Hopping to detected link: {career_link}")
                career_html = await self._static_scrape(career_link)
                if career_html and not self._is_javascript_wall(career_html):
                    jobs = await self._extract_jobs_with_llm(career_html, company_id, career_link)
                    if jobs:
                        logger.info(f"Success: Found {len(jobs)} jobs via link-hop to {career_link}")
                        return jobs, new_hash

        # --- PHASE 3: PLAYWRIGHT (THE HAMMER) ---
        logger.info(f"Static methods failed for {website_url}. Falling back to Playwright...")
        browser_html = await self._browser_scrape(website_url)
        if browser_html:
            browser_soup = BeautifulSoup(browser_html, "html.parser")
            browser_text = browser_soup.get_text(separator=" ", strip=True)
            new_hash = hashlib.sha256(browser_text.encode('utf-8')).hexdigest()
            
            if current_hash and new_hash == current_hash:
                logger.info(f"⏭️ Smart Skip: Browser content hash matches for {website_url}.")
                return [], new_hash

            jobs = await self._extract_jobs_with_llm(browser_html, company_id, website_url)
            if jobs:
                logger.info(f"Success: Found {len(jobs)} jobs via Playwright for {website_url}")
                return jobs, new_hash

        logger.warning(f"All Multipass Tiers failed for {website_url}")
        return [], None

    async def deep_scrape_job(self, job_url: str) -> str:
        """
        Deep-scraping Phase 2: Grab the raw HTML body for AI extraction.
        Currently defaults to a fast HTTP GET.
        """
        html = await self._static_scrape(job_url)
        return html or ""

    async def _detect_career_link(self, html: str, url: str) -> Optional[str]:
        soup = BeautifulSoup(html, "html.parser")
        links = [{"text": a.get_text(strip=True), "href": a.get("href")} for a in soup.find_all("a") if a.get("href")]
        links_context = str(links)[:5000]

        try:
            class LinkDetection(BaseModel):
                status: str
                url: Optional[str]
                reason: str

            from src.app.core.prompts import MULTIPASS_LINK_DETECTION_PROMPT
            prompt = MULTIPASS_LINK_DETECTION_PROMPT.format(url=url, text=links_context)
            
            # Using asyncio.to_thread because instructor's client call is synchronous here
            def _ask_gemini():
                return self.client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    response_model=LinkDetection,
                )
            
            result = await asyncio.to_thread(_ask_gemini)

            if result.status == "ALREADY_ON_JOBS_PAGE":
                return None
            
            if result.url and result.url.startswith("http"):
                return result.url
                
            if result.url and not result.url.startswith("http"):
                from urllib.parse import urljoin
                return urljoin(url, result.url)

            return None
        except Exception as e:
            logger.warning(f"Link detection failed: {e}")
            return None

    async def _static_scrape(self, url: str) -> str:
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            async with httpx.AsyncClient(follow_redirects=True, timeout=15.0, headers=headers) as client:
                response = await client.get(url)
                return response.text
        except Exception as e:
            logger.error(f"Static scrape failed for {url}: {e}")
            return ""

    async def _browser_scrape(self, url: str, disable_agentic: bool = False) -> str:
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                await Stealth().apply_stealth_async(page)
                
                logger.info(f"Navigating to {url} via Browser...")
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                
                if not disable_agentic:
                    await self._navigate_agentically(page)
                
                await page.wait_for_timeout(10000) 
                content = await page.content()
                await browser.close()
                return content
        except Exception as e:
            logger.error(f"Browser scrape failed for {url}: {e}")
            return ""

    async def _navigate_agentically(self, page):
        elements = await page.evaluate("""() => {
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
            class NavigationAction(BaseModel):
                element_text: str
                reason: str

            from src.app.core.prompts import MULTIPASS_NAVIGATION_PROMPT
            prompt = MULTIPASS_NAVIGATION_PROMPT.format(elements=elements)
            
            def _ask_gemini_nav():
                return self.client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    response_model=NavigationAction,
                )
            
            action = await asyncio.to_thread(_ask_gemini_nav)

            if action.element_text.upper() != "NONE":
                logger.info(f"Agentic Nav: Clicking '{action.element_text}' because {action.reason}")
                await page.click(f"text='{action.element_text}'", timeout=5000)
                await page.wait_for_timeout(3000)
            else:
                logger.info("Agentic Nav: Already on target page.")

        except Exception as e:
            logger.warning(f"Agentic navigation skipped: {e}")
            await page.wait_for_timeout(3000) 

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

    async def _extract_jobs_with_llm(self, html: str, company_id: str, base_url: str) -> List[Job]:
        soup = BeautifulSoup(html, "html.parser")
        for script in soup(["script", "style", "svg"]):
            script.decompose()
        
        clean_text = soup.get_text(separator="\n", strip=True)
        if len(clean_text) < 200:
            logger.warning(f"Extracted text is very short ({len(clean_text)} chars). Site might be blocking or empty.")
            clean_text = str(soup.body)[:20000]

        logger.info(f"Sending {len(clean_text[:15000])} characters to Gemini for extraction...")

        try:
            from src.app.core.prompts import MULTIPASS_JOB_EXTRACTION_SYSTEM, MULTIPASS_JOB_EXTRACTION_USER
            
            def _ask_gemini_extract():
                return self.client.chat.completions.create(
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
                
            response = await asyncio.to_thread(_ask_gemini_extract)

            result_jobs = []
            for ext in response.jobs:
                result_jobs.append(Job(
                    title=ext.title,
                    location=ext.location,
                    job_url=ext.job_url,
                    department=ext.department,
                    salary_range=ext.salary_range,
                    company_id=company_id,
                    needs_deep_scrape=True,
                ))
            
            logger.info(f"Gemini extracted {len(result_jobs)} jobs.")
            return result_jobs
            
        except Exception as e:
            logger.error(f"LLM extraction failed: {e}")
            return []
