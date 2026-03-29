import sqlite3
import os

# Connect to database
db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=" * 80)
print("SQLITE DATABASE VIEWER")
print("=" * 80)

# List all tables
print("\n📋 DATABASE TABLES:")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
for table in tables:
    print(f"  • {table[0]}")

# Get detailed info about ImageAnalysis table
print("\n" + "=" * 80)
print("IMAGEANALYSIS TABLE DATA")
print("=" * 80)

# Get column info
cursor.execute("PRAGMA table_info(detector_imageanalysis);")
columns = cursor.fetchall()
print("\nColumns:")
for col in columns:
    print(f"  • {col[1]}: {col[2]}")

# Get all records
cursor.execute("SELECT * FROM detector_imageanalysis ORDER BY created_at DESC;")
rows = cursor.fetchall()

if rows:
    print(f"\n📊 Total Records: {len(rows)}\n")
    
    for idx, row in enumerate(rows, 1):
        print(f"\n--- Record #{idx} ---")
        print(f"  ID: {row[0]}")
        print(f"  Original Image: {row[1]}")
        print(f"  Tampered Image: {row[2]}")
        print(f"  Modification Type: {row[3]}")
        print(f"  Predicted Result: {row[4]}")
        print(f"  Actual Result: {row[5]}")
        print(f"  Confidence: {row[6]}")
        print(f"  Created At: {row[7]}")
else:
    print("\n⚠️  No records found in database")

# Summary stats
print("\n" + "=" * 80)
print("SUMMARY STATISTICS")
print("=" * 80)

cursor.execute("SELECT COUNT(*) FROM detector_imageanalysis;")
total = cursor.fetchone()[0]
print(f"Total Analyses: {total}")

cursor.execute("SELECT COUNT(*) FROM detector_imageanalysis WHERE predicted_result = 1;")
tampered = cursor.fetchone()[0]
print(f"Predicted Tampered: {tampered}")

cursor.execute("SELECT COUNT(*) FROM detector_imageanalysis WHERE predicted_result = 0;")
clean = cursor.fetchone()[0]
print(f"Predicted Clean: {clean}")

cursor.execute("SELECT AVG(confidence) FROM detector_imageanalysis WHERE confidence IS NOT NULL;")
avg_conf = cursor.fetchone()[0]
print(f"Average Confidence: {avg_conf:.2%}" if avg_conf else "Average Confidence: N/A")

print("\n" + "=" * 80)

conn.close()
