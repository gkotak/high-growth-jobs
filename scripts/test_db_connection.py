import os
import sys
from sqlmodel import Session, select
from dotenv import load_dotenv

# Ensure we can import from src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

load_dotenv()

from src.app.core.database import engine
from src.data_model.models import Company

def test_connection():
    print("Testing Supabase connection with new credentials...")
    try:
        with Session(engine) as session:
            statement = select(Company).limit(1)
            results = session.exec(statement).all()
            print(f"✅ Success! Connected. Found {len(results)} companies.")
            return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()
