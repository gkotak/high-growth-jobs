import os
import sys

# Add the project root to the Python path so 'src' can be discovered by Vercel
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.app.main import app

# Vercel's Python runtime can find the app object here
# and route requests to it.
