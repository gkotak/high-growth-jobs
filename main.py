from src.app.main import app

# This root main.py acts as the entrypoint for Vercel deployment
# by exposing the FastAPI 'app' object.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
