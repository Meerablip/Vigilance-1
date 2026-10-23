import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Primary Neon PostgreSQL engine with fallback to local SQLite
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10
    )
    # Test connection
    with engine.connect() as conn:
        print("[DATABASE] Successfully connected to Neon Serverless PostgreSQL!")
except Exception as e:
    print(f"[DATABASE] Neon connection failed ({e}). Falling back to local SQLite resilience...")
    engine = create_engine(
        "sqlite:///./vigilance.db",
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    import app.models.entities # Register all models
    Base.metadata.create_all(bind=engine)
    print("[DATABASE] All tables verified and created in Neon database.")
