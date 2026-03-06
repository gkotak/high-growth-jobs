import os
from dotenv import load_dotenv
from sqlmodel import create_engine, Session, SQLModel
from typing import Generator

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set in environment")

# For Supabase, we might want to tune pooling
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def init_db():
    # This is handled by Alembic in prod, 
    # but useful for local scratch testing
    SQLModel.metadata.create_all(engine)
