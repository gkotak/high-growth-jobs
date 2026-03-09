"""
Langfuse LLM Observability Module

Initializes OpenTelemetry-based tracing for all OpenAI-compatible LLM calls.
Since we route all providers (Gemini, GPT, Claude) through the OpenAI client,
a single instrumentor captures everything.

Required env vars:
    LANGFUSE_SECRET_KEY
    LANGFUSE_PUBLIC_KEY
    LANGFUSE_HOST
"""

import os
import logging

logger = logging.getLogger(__name__)

_initialized = False


def init_langfuse():
    """
    Initializes the Langfuse + OpenTelemetry pipeline.
    Safe to call multiple times — only runs once.
    """
    global _initialized
    if _initialized:
        return

    secret_key = os.getenv("LANGFUSE_SECRET_KEY")
    public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
    host = os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")

    if not secret_key or not public_key:
        logger.warning(
            "⚠️  Langfuse keys not found in environment. "
            "LLM tracing is DISABLED. Set LANGFUSE_SECRET_KEY and LANGFUSE_PUBLIC_KEY to enable."
        )
        return

    try:
        from langfuse import Langfuse

        # Initialize the Langfuse client
        Langfuse(
            secret_key=secret_key,
            public_key=public_key,
            host=host,
        )

        # Auto-instrument all OpenAI client calls via OpenTelemetry.
        # Since we route Gemini/GPT/Claude through the OpenAI-compatible interface,
        # this single instrumentor captures ALL LLM calls.
        from opentelemetry.instrumentation.openai import OpenAIInstrumentor

        OpenAIInstrumentor().instrument()

        _initialized = True
        logger.info("✅ Langfuse LLM observability initialized successfully.")
        logger.info(f"   Tracing to: {host}")

    except ImportError as e:
        logger.warning(
            f"⚠️  Langfuse instrumentation skipped — missing package: {e}. "
            "Run: uv add langfuse opentelemetry-instrumentation-openai"
        )
    except Exception as e:
        logger.error(f"❌ Failed to initialize Langfuse: {e}")
