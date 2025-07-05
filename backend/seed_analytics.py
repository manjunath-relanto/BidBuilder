# seed_analytics.py: One-time script to seed analytics data into the database
import os
import json
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent))

from db import SessionLocal
from models import Analytics
from db import Base
from sqlalchemy import create_engine

# Ensure DB tables exist
from db import engine
Base.metadata.create_all(bind=engine)

def seed_analytics():
    analytics_path = os.path.join(os.path.dirname(__file__), "analytics_data.json")
    with open(analytics_path, "r") as f:
        data = json.load(f)
    with SessionLocal() as db:
        for key, value in data.items():
            if not db.query(Analytics).filter_by(key=key).first():
                db.add(Analytics(key=key, data=value))
        db.commit()
    print("Analytics data seeded to DB.")

if __name__ == "__main__":
    seed_analytics()
