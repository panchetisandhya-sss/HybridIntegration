import os
import json

voters_dir = "blockchain/voters"
if os.path.exists(voters_dir):
    for filename in os.listdir(voters_dir):
        if filename.startswith("AP-") and filename.endswith(".json"):
            filepath = os.path.join(voters_dir, filename)
            try:
                with open(filepath, "r") as f:
                    voters = json.load(f)
                
                for v in voters:
                    v["has_voted"] = False
                    if "vote_receipt_hash" in v:
                        v["vote_receipt_hash"] = ""
                
                with open(filepath, "w") as f:
                    json.dump(voters, f, indent=4)
                print(f"Reset {filename}")
            except Exception as e:
                print(f"Failed to reset {filename}: {e}")
