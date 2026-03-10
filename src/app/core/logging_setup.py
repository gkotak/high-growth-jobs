import os
import logging
import warnings
from logging.handlers import RotatingFileHandler

# Muffle persistent deprecation warnings from instructor/generativeai that clutter Railway logs
warnings.filterwarnings("ignore", category=FutureWarning, module="instructor.providers.gemini.client")
warnings.filterwarnings("ignore", category=FutureWarning, message=".*google.generativeai.*")

def setup_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """Configures and returns a logger with both console and rotating file output."""
    os.makedirs("logs", exist_ok=True)
    
    # We configure the ROOT logger so that all module-level inner loggers 
    # automatically inherit these file handlers.
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    
    # Avoid adding handlers multiple times if already configured
    if not root_logger.handlers:
        log_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")

        # Console Output (for everything)
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(log_formatter)
        root_logger.addHandler(console_handler)

        class ServerFilter(logging.Filter):
            def filter(self, record):
                # Keep scraper, janitor, admin noise out of the core server.log
                scrape_keywords = ["scraper", "janitor", "src.app.api.admin", "scripts.", "__main__"]
                return not any(kw in record.name for kw in scrape_keywords)

        class ScrapeFilter(logging.Filter):
            def filter(self, record):
                # Route specific background agents and CLI scripts to scrape.log
                scrape_keywords = ["scraper", "janitor", "src.app.api.admin", "scripts.", "__main__"]
                return any(kw in record.name for kw in scrape_keywords)

        # File Output: server.log
        server_handler = RotatingFileHandler(
            "logs/server.log", maxBytes=5 * 1024 * 1024, backupCount=3
        )
        server_handler.setFormatter(log_formatter)
        server_handler.addFilter(ServerFilter())
        root_logger.addHandler(server_handler)

        # File Output: scrape.log
        scrape_handler = RotatingFileHandler(
            "logs/scrape.log", maxBytes=5 * 1024 * 1024, backupCount=3
        )
        scrape_handler.setFormatter(log_formatter)
        scrape_handler.addFilter(ScrapeFilter())
        root_logger.addHandler(scrape_handler)
    
    # Return the specific named logger requested (it will inherit the root handlers)
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    return logger
