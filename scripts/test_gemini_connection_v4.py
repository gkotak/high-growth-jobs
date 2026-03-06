import os
import sys
import google.genai as genai
from dotenv import load_dotenv

# Ensure we can import from src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

load_dotenv()

def test_gemini_v4():
    print("Testing Gemini API connection with new key...")
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    try:
        model = "gemini-2.5-flash" # The newest model in the list
        print(f"Trying model: {model}...")
        response = client.models.generate_content(
            model=model,
            contents=["Say 'Connection Success' if you can read this."]
        )
        print(f"✅ Success with {model}! Gemini responded: {response.text.strip()}")
        return True
    except Exception as e:
        print(f"❌ Gemini connection failed: {e}")
        return False

if __name__ == "__main__":
    test_gemini_v4()
