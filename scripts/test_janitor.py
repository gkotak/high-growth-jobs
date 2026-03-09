import os
import sys
import logging
from sqlmodel import Session, select
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.app.core.logging_setup import setup_logger

logger = setup_logger("JanitorTest", "logs/janitor.log")

from src.app.services.janitor import JanitorService

def run_test():
    load_dotenv()
    logger.info("Starting a single test run of the Janitor Service (Limit: 2)")
    service = JanitorService()
    service.cleanup_and_sync(limit=2)
    logger.info("Test run complete. Check logs/janitor.log for output.")

if __name__ == "__main__":
    run_test()
