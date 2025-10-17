import csv
import json

with open("csv-data.csv", newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    data = []

    for row in reader:
        row["# of Skill Badges Completed"] = int(row["# of Skill Badges Completed"]) if row["# of Skill Badges Completed"] else 0
        row["# of Arcade Games Completed"] = int(row["# of Arcade Games Completed"]) if row["# of Arcade Games Completed"] else 0
        
        data.append(row)

with open("data.json", "w", encoding="utf-8") as jsonfile:
    json.dump(data, jsonfile, indent=4, ensure_ascii=False)

print(" CSV converted to JSON successfully → data.json")
