# Use an official Python runtime as a parent image
# Playwright provides a special image with all browsers pre-installed
FROM mcr.microsoft.com/playwright/python:v1.48.0-jammy

# Set the working directory
WORKDIR /app

# Install uv for fast dependency management
RUN pip install uv

# Copy the lockfile and project file
COPY pyproject.toml uv.lock ./

# Install dependencies from the scraper extra
# This matches the [project.optional-dependencies] section in pyproject.toml
RUN uv sync --frozen --extra scrapers

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1

# The command to run the janitor loop
CMD ["uv", "run", "scripts/janitor.py"]
