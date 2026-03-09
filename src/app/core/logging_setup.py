import os
import logging
from logging.handlers import RotatingFileHandler

def setup_logger(name: str, log_file: str = "logs/app.log", level: int = logging.INFO) -> logging.Logger:
    """Configures and returns a logger with both console and rotating file output."""
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    # We configure the ROOT logger so that all module-level inner loggers 
    # (like src.app.adapters.scraper) automatically inherit these file handlers.
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    
    # Avoid adding handlers multiple times if already configured
    if not root_logger.handlers:
        log_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")

        # Console Output
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(log_formatter)

        # File Output (Rotating logs: 5MB max, 3 backups)
        file_handler = RotatingFileHandler(
            log_file, maxBytes=5 * 1024 * 1024, backupCount=3
        )
        file_handler.setFormatter(log_formatter)

        root_logger.addHandler(console_handler)
        root_logger.addHandler(file_handler)
    
    # Return the specific named logger requested (it will inherit the root handlers)
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    return logger
