import os
import sys
import logging
from dotenv import load_dotenv

# Absolute path setup
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("janitor.log")
    ]
)

from src.app.services.janitor import JanitorService

def run_janitor():
    print("🧹 Starting HighGrowthJobs Janitor...")
    janitor = JanitorService()
    janitor.cleanup_and_sync()
    print("✅ Janitor run complete.")

if __name__ == "__main__":
    run_janitor()
