import os
import sys
import google.genai as genai
from dotenv import load_dotenv

# Ensure we can import from src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

load_dotenv()

def list_and_test_gemini():
    print("Testing Gemini API connection with new key...")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ No GEMINI_API_KEY found in environment.")
        return False
        
    client = genai.Client(api_key=api_key)
    try:
        # Try a few common model names
        model_names = ["gemini-1.5-flash", "models/gemini-1.5-flash-latest"]
        for m in model_names:
            try:
                print(f"Trying model: {m}...")
                response = client.models.generate_content(
                    model=m,
                    contents=["Say 'Connection Success' if you can read this."]
                )
                print(f"✅ Success with {m}! Gemini responded: {response.text.strip()}")
                return True
            except Exception as e:
                print(f"Failed with {m}: {e}")
                
        # If all fail, list models
        print("Listing available models...")
        for m in client.models.list():
            print(f"- {m.name}")
        return False
    except Exception as e:
        print(f"❌ General Gemini connection failed: {e}")
        return False

if __name__ == "__main__":
    list_and_test_gemini()
