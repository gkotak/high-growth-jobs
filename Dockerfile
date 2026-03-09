# Use an official Python runtime as a parent image
# Playwright provides a special image with all browsers pre-installed
FROM mcr.microsoft.com/playwright/python:v1.48.0-jammy

# Set the working directory
WORKDIR /app

# Install uv for fast dependency management
RUN pip install uv

# Copy the lockfile and project file
COPY pyproject.toml uv.lock ./

# Add the virtualenv's bin directory to the PATH so we can run scripts easily
ENV PATH="/app/.venv/bin:$PATH"

# Force uv to use the system Python 3.12 from the Playwright image
# (without this, uv downloads Python 3.14 which lacks pre-built wheels for greenlet)
RUN uv sync --frozen --python-preference only-system

# Copy the rest of the application
COPY . .

# Set more environment variables
ENV PYTHONUNBUFFERED=1

# The command to run the janitor loop
CMD ["python", "scripts/janitor.py"]
