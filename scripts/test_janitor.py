import os
import sys
import logging
from sqlmodel import Session, select
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from logging.handlers import RotatingFileHandler

# Configure logging with both Console and Truncating File outputs
log_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")

console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)

os.makedirs("logs", exist_ok=True)
file_handler = RotatingFileHandler(
    "logs/janitor.log", maxBytes=5 * 1024 * 1024, backupCount=3
)
file_handler.setFormatter(log_formatter)

logging.basicConfig(
    level=logging.INFO,
    handlers=[console_handler, file_handler]
)

logger = logging.getLogger("JanitorTest")

from src.app.services.janitor import JanitorService

def run_test():
    load_dotenv()
    logger.info("Starting a single test run of the Janitor Service (Limit: 2)")
    service = JanitorService()
    service.cleanup_and_sync(limit=2)
    logger.info("Test run complete. Check logs/janitor.log for output.")

if __name__ == "__main__":
    run_test()
