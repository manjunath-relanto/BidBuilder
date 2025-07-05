#!/usr/bin/env python3
"""
fetch_db_data.py

A stand-alone script to connect to a SQLite database and dump all rows
from the `proposals` table to the console.
"""

import sqlite3
import sys
from pathlib import Path

def fetch_data(db_path: Path):
    # Make sure the file actually exists
    if not db_path.is_file():
        print(f"Error: database file not found at {db_path}")
        sys.exit(1)

    # Connect to the SQLite database (file path, not URI)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Execute the query
    try:
        cur.execute("SELECT * FROM proposals")
    except sqlite3.OperationalError as e:
        print(f"SQL error: {e}")
        conn.close()
        sys.exit(1)

    rows = cur.fetchall()

    if not rows:
        print("No proposals found in the database.")
    else:
        # Print header
        headers = rows[0].keys()
        print("\t".join(headers))
        # Print each row
        for row in rows:
            print("\t".join(str(row[h]) for h in headers))

    conn.close()

if __name__ == "__main__":
    # You can also accept a CLI arg: python fetch_db_data.py /path/to/db.db
    if len(sys.argv) == 2:
        db_file = Path(sys.argv[1]).expanduser()
    else:
        # Default: look for bidbuilder.db in the same directory as this script
        db_file = Path(__file__).resolve().parent / "bidbuilder.db"

    fetch_data(db_file)
