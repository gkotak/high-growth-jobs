import os
import sys
import logging
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def debug_openai():
    # Try the search page directly
    url = "https://openai.com/careers/search"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a more specific UA
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 720}
        )
        page = context.new_page()
        Stealth().apply_stealth_sync(page)
        
        logger.info(f"Navigating to {url}...")
        try:
            # Increase timeout and use wait_until="load"
            page.goto(url, wait_until="load", timeout=90000)
            
            # OpenAI sometimes has a delay even after load
            logger.info("Waiting 15 seconds for potential Cloudflare pass...")
            page.wait_for_timeout(15000)
            
            page.screenshot(path="openai_search_debug.png")
            
            # Check for jobs
            jobs = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('a'))
                    .map(el => el.innerText)
                    .filter(t => t.length > 5);
            }""")
            print(f"Found {len(jobs)} potential elements.")
            
            content = page.content()
            with open("openai_search_source.html", "w") as f:
                f.write(content)
        except Exception as e:
            logger.error(f"Failed: {e}")
        
        browser.close()

if __name__ == "__main__":
    debug_openai()
