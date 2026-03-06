import os
import sys
import logging
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def debug_openai():
    url = "https://openai.com/careers"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a real-looking user agent
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        Stealth().apply_stealth_sync(page)
        
        logger.info(f"Navigating to {url}...")
        try:
            page.goto(url, wait_until="networkidle", timeout=60000)
        except Exception as e:
            logger.warning(f"Networkidle failed, falling back to load: {e}")
            page.goto(url, wait_until="load", timeout=60000)

        # Wait a bit for extra animations
        page.wait_for_timeout(5000)
        
        # Take a screenshot to see what's happening
        page.screenshot(path="openai_debug.png")
        logger.info("Screenshot saved to openai_debug.png")
        
        # Get elements
        elements = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('a, button'))
                .map(el => ({
                    text: el.innerText.trim(),
                    tag: el.tagName,
                    href: el.href || 'N/A'
                }))
                .filter(el => el.text.length > 2);
        }""")
        
        print("\n--- VISIBLE ELEMENTS ---")
        for el in elements[:20]:
            print(f"[{el['tag']}] {el['text']} -> {el['href'][:50]}")
            
        # Get content length
        content = page.content()
        print(f"\nHTML Length: {len(content)}")
        
        with open("openai_source.html", "w") as f:
            f.write(content)
        
        browser.close()

if __name__ == "__main__":
    debug_openai()
