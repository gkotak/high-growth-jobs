import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))

def fix():
    with engine.connect() as conn:
        conn.execute(text("UPDATE company SET website_url = NULL WHERE website_url = '#'"))
        conn.commit()
    print("Fixed # websites to NULL")

if __name__ == "__main__":
    fix()
