"""
LLM Registry — Single source of truth for all LLM configuration.

All model names, providers, and client construction are centralized here.
To swap LLMs, change the env vars — no code changes needed.

Env Vars:
    SCRAPER_LLM_MODEL       (default: gemini-2.5-flash)
    SCRAPER_LLM_API_KEY     (default: falls back to GEMINI_API_KEY)
    SCRAPER_LLM_BASE_URL    (default: Google's OpenAI-compatible endpoint)
"""

import os
import logging
import instructor
from openai import OpenAI

logger = logging.getLogger(__name__)

# --- Google Gemini via OpenAI-compatible endpoint ---
GOOGLE_OPENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

# --- Default Config (overridable via env) ---
DEFAULT_SCRAPER_MODEL = "gemini-2.5-flash"


def get_scraper_client() -> instructor.Instructor:
    """
    Returns an instructor-patched OpenAI client configured for the scraper LLM.

    Uses the OpenAI-compatible interface regardless of provider (Gemini, GPT, Claude).
    To swap models, set these env vars:
        SCRAPER_LLM_MODEL      — e.g. "gpt-4o-mini" or "gemini-2.5-flash"
        SCRAPER_LLM_API_KEY    — the API key for the chosen provider
        SCRAPER_LLM_BASE_URL   — the provider's OpenAI-compatible base URL
    """
    model = os.getenv("SCRAPER_LLM_MODEL", DEFAULT_SCRAPER_MODEL)
    api_key = os.getenv("SCRAPER_LLM_API_KEY") or os.getenv("GEMINI_API_KEY")
    base_url = os.getenv("SCRAPER_LLM_BASE_URL", GOOGLE_OPENAI_BASE_URL)

    if not api_key:
        raise ValueError(
            "No LLM API key found. Set SCRAPER_LLM_API_KEY or GEMINI_API_KEY in your environment."
        )

    logger.info(f"LLM Registry: model={model}, base_url={base_url[:50]}...")

    raw_client = OpenAI(api_key=api_key, base_url=base_url)
    return instructor.from_openai(raw_client), model


def get_scraper_model() -> str:
    """Returns the configured scraper model name."""
    return os.getenv("SCRAPER_LLM_MODEL", DEFAULT_SCRAPER_MODEL)
