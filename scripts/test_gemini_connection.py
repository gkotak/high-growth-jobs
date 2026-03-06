import os
import sys
import google.genai as genai
from dotenv import load_dotenv

# Ensure we can import from src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

load_dotenv()

def test_gemini():
    print("Testing Gemini API connection with new key...")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ No GEMINI_API_KEY found in environment.")
        return False
        
    client = genai.Client(api_key=api_key)
    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=["Say 'Connection Success' if you can read this."]
        )
        print(f"✅ Success! Gemini responded: {response.text.strip()}")
        return True
    except Exception as e:
        print(f"❌ Gemini connection failed: {e}")
        return False

if __name__ == "__main__":
    test_gemini()
