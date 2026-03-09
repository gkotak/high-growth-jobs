import os
import sys
import logging
import time
import asyncio
from sqlmodel import Session, select
from dotenv import load_dotenv

# Ensure we can import from src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.app.services.janitor import JanitorService
from src.app.core.database import engine
from src.data_model.models import Company
from src.app.core.logging_setup import setup_logger

logger = setup_logger("JanitorOrchestrator", "logs/janitor.log")

load_dotenv()

class JanitorDaemon:
    def __init__(self):
        self.service = JanitorService()
        self.interval_seconds = int(os.getenv("JANITOR_INTERVAL_SECONDS", "3600"))

    async def run_forever(self):
        logger.info(f"🚀 Janitor Daemon started via Railway. Interval: {self.interval_seconds}s")
        
        while True:
            try:
                logger.info("🧹 Starting scheduled cleanup and sync...")
                # In a real Railway deployment, this might take a while
                self.service.cleanup_and_sync()
                logger.info(f"✅ Sync complete. Sleeping for {self.interval_seconds} seconds...")
            except Exception as e:
                logger.error(f"❌ Janitor encountered an error: {e}")
                # Wait a bit before retrying to avoid rapid failure loops
                await asyncio.sleep(60)
            
            await asyncio.sleep(self.interval_seconds)

if __name__ == "__main__":
    daemon = JanitorDaemon()
    asyncio.run(daemon.run_forever())
