import os
import logging
from logging.handlers import RotatingFileHandler

def setup_logger(name: str, log_file: str = "logs/app.log", level: int = logging.INFO) -> logging.Logger:
    """Configures and returns a logger with both console and rotating file output."""
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Avoid adding handlers multiple times if already configured
    if not logger.handlers:
        log_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")

        # Console Output
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(log_formatter)

        # File Output (Rotating logs: 5MB max, 3 backups)
        file_handler = RotatingFileHandler(
            log_file, maxBytes=5 * 1024 * 1024, backupCount=3
        )
        file_handler.setFormatter(log_formatter)

        logger.addHandler(console_handler)
        logger.addHandler(file_handler)
    
    return logger
