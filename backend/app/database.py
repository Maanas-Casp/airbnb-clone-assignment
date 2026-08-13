import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Allow overriding the SQLite file via environment variable DATABASE_FILE for deployment.
# If DATABASE_FILE is set, use that path; otherwise use the default development DB file.
_db_file_env = os.getenv('DATABASE_FILE')
if _db_file_env:
    # Allow either an absolute or relative path provided by the environment.
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{_db_file_env}"
else:
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'airbnb_app.db')}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
