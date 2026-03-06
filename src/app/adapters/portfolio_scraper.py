import os
import sys
import logging
from typing import List, Optional
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
import openai
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class ExtractedCompany(BaseModel):
    name: str
    website_url: Optional[str] = None
    description: Optional[str] = None

class CompanyList(BaseModel):
    companies: List[ExtractedCompany]

class VCPortfolioScraperAdapter:
    def __init__(self):
        from dotenv import load_dotenv
        load_dotenv()
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            logger.warning("OPENAI_API_KEY missing - Portfolio Extraction requires LLM.")
        else:
            self.client = openai.OpenAI(api_key=self.api_key)

    def discover_companies(self, vc_name: str, portfolio_url: str) -> List[ExtractedCompany]:
        """
        Uses Playwright and OpenAI to scrape a VC portfolio page and extract all startups.
        """
        logger.info(f"Navigating to {vc_name} portfolio: {portfolio_url}...")
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                Stealth().apply_stealth_sync(page)
                
                page.goto(portfolio_url, wait_until="networkidle", timeout=60000)
                
                # Scroll down slowly to trigger lazy-loaded companies
                self._scroll_page(page)
                
                html = page.content()
                browser.close()
                
            if not html:
                return []
                
            return self._extract_with_openai(html, vc_name)

        except Exception as e:
            logger.error(f"Failed to scrape {portfolio_url}: {e}")
            return []

    def _scroll_page(self, page):
        """Scrolls down a page incrementally to trigger lazy loading."""
        logger.info("Scrolling page to trigger lazy loading...")
        for _ in range(5):
            page.evaluate("window.scrollBy(0, document.body.scrollHeight / 5)")
            page.wait_for_timeout(1000)

    def _extract_with_openai(self, html: str, vc_name: str) -> List[ExtractedCompany]:
        """
        Passes cleaned HTML chunks to OpenAI to extract company details.
        """
        if not hasattr(self, 'client'):
            logger.error("OpenAI Client not initialized.")
            return []

        soup = BeautifulSoup(html, "lxml")
        
        # Strip out unneeded nodes to massively save tokens
        for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'svg']):
            tag.decompose()
            
        clean_text = soup.get_text(separator="\n", strip=True)
        text_preview = clean_text[:25000] # Limit to avoid context bloat initially

        logger.info(f"Extracted {len(text_preview)} chars from {vc_name} HTML. Sending to OpenAI...")

        from src.app.core.prompts import PORTFOLIO_EXTRACTION_PROMPT
        prompt = PORTFOLIO_EXTRACTION_PROMPT.format(vc_name=vc_name, text_preview=text_preview)

        try:
            # We use parse() to enforce the Pydantic schema easily in new OpenAI SDK
            response = self.client.beta.chat.completions.parse(
                model='gpt-4o-mini',
                messages=[{"role": "user", "content": prompt}],
                response_format=CompanyList,
            )
            
            extracted = response.choices[0].message.parsed.companies
            logger.info(f"OpenAI successfully extracted {len(extracted)} companies from {vc_name}.")
            return extracted
            
        except Exception as e:
            logger.error(f"OpenAI Extraction failed for {vc_name}: {e}")
            return []
