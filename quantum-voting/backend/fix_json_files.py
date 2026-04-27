import os
import json

voters_dir = "blockchain/voters"
if os.path.exists(voters_dir):
    for filename in os.listdir(voters_dir):
        if filename.endswith(".json"):
            filepath = os.path.join(voters_dir, filename)
            try:
                with open(filepath, "r") as f:
                    json.load(f)
            except Exception as e:
                print(f"Fixing {filename}: {e}")
                with open(filepath, "w") as f:
                    f.write("[]")
