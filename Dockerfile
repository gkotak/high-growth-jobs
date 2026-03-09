# Use an official Python runtime as a parent image
# Playwright provides a special image with all browsers pre-installed
FROM mcr.microsoft.com/playwright/python:v1.48.0-jammy

# Set the working directory
WORKDIR /app

# Install build tools (needed for greenlet C extension) and uv
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/* \
    && pip install uv

# Tell uv to NEVER download its own Python — use the image's Python 3.12
ENV UV_PYTHON_PREFERENCE=only-system
ENV UV_PYTHON=/usr/bin/python3

# Copy the lockfile and project file
COPY pyproject.toml uv.lock ./

# Add the virtualenv's bin directory to the PATH
ENV PATH="/app/.venv/bin:$PATH"

# Install all project dependencies using the system Python 3.12
RUN uv sync --frozen

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1

# The command to run the janitor loop
CMD ["python", "scripts/janitor.py"]
