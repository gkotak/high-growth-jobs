# Use an official Python runtime as a parent image
# Playwright provides a special image with all browsers pre-installed
FROM mcr.microsoft.com/playwright/python:v1.48.0-jammy

# Set the working directory
WORKDIR /app

# Install uv for fast dependency management
RUN pip install uv

# Copy the lockfile and project file
COPY pyproject.toml uv.lock ./

# Install ONLY the scraper-group dependencies (we moved playwright here earlier)
# This keeps the image smaller and focused
RUN uv sync --frozen --with scrapers

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1

# The command to run the janitor loop
CMD ["uv", "run", "scripts/janitor.py"]
