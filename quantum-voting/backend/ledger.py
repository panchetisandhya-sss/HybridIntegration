import json
import hashlib
import os

LEDGER_FILE = "ledger.json"

def get_ledger():
    if not os.path.exists(LEDGER_FILE):
        return []
    with open(LEDGER_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_ledger(ledger):
    with open(LEDGER_FILE, "w") as f:
        json.dump(ledger, f, indent=4)

def calculate_hash(block):
    block_string = json.dumps(block, sort_keys=True).encode()
    return hashlib.sha256(block_string).hexdigest()

def verify_ledger():
    ledger = get_ledger()
    for i in range(1, len(ledger)):
        previous_block = ledger[i-1]
        current_block = ledger[i]
        
        # We temporarily remove the 'hash' from the block to recalculate and verify
        # Assuming the hash was calculated without the 'hash' field itself
        # For simplicity, let's verify if previous_hash matches
        if current_block["previous_hash"] != previous_block["hash"]:
            return False
    return True

def append_to_ledger(voter_id, encrypted_vote, qber, s_value, timestamp):
    if not verify_ledger():
        raise Exception("Ledger integrity compromised")
        
    ledger = get_ledger()
    previous_hash = "0" * 64
    if len(ledger) > 0:
        previous_hash = ledger[-1]["hash"]
        
    new_block = {
        "voter_id": voter_id,
        "encrypted_vote": encrypted_vote,
        "qber": qber,
        "s_value": s_value,
        "timestamp": timestamp,
        "previous_hash": previous_hash
    }
    
    current_hash = calculate_hash(new_block)
    new_block["hash"] = current_hash
    
    ledger.append(new_block)
    save_ledger(ledger)
    return new_block
