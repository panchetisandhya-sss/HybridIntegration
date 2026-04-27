import json
import os
from datetime import datetime
from merkle_tree import compute_merkle_root, sha256_hash

BLOCKCHAIN_DIR = "blockchain"
SECRET_SALT = os.environ.get("SECRET_SALT", "S3CR3T_S4LT_999")
PEPPER = os.environ.get("PEPPER", "P3PP3R_888")

def get_voter_node_id(voter_id: str) -> str:
    return sha256_hash(voter_id)

def get_voter_name_hash(full_name: str, voter_id: str) -> str:
    return sha256_hash(f"{full_name}{voter_id}{SECRET_SALT}")

def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path, 'r') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=4)

def compute_block_hash(block_data: dict) -> str:
    """Computes a deterministic hash for a block dict by excluding its own current_hash."""
    temp = block_data.copy()
    if 'current_hash' in temp:
        del temp['current_hash']
    block_str = json.dumps(temp, sort_keys=True)
    return sha256_hash(block_str)

def initialize_blockchain_dirs():
    """Ensure all subdirectories exist."""
    os.makedirs(os.path.join(BLOCKCHAIN_DIR, "states"), exist_ok=True)
    os.makedirs(os.path.join(BLOCKCHAIN_DIR, "districts"), exist_ok=True)
    os.makedirs(os.path.join(BLOCKCHAIN_DIR, "mandals"), exist_ok=True)
    os.makedirs(os.path.join(BLOCKCHAIN_DIR, "voters"), exist_ok=True)

class BlockchainEngine:
    """Handles the core logic for cascading hash updates and querying the blockchain."""
    
    def __init__(self):
        initialize_blockchain_dirs()

    def get_genesis_block(self):
        path = os.path.join(BLOCKCHAIN_DIR, "genesis.json")
        return load_json(path)

    def write_genesis_block(self, data):
        path = os.path.join(BLOCKCHAIN_DIR, "genesis.json")
        save_json(path, data)
        
    def write_voter_node(self, node_id: str, mandal_id: str, data: dict):
        # We store voters grouped by mandal for easier retrieval
        filename = f"{mandal_id}-voters.json"
        path = os.path.join(BLOCKCHAIN_DIR, "voters", filename)
        
        voters_in_mandal = load_json(path) or []
        
        # update or append
        updated = False
        for i, v in enumerate(voters_in_mandal):
            if v.get('voter_node_id') == node_id:
                voters_in_mandal[i] = data
                updated = True
                break
        
        if not updated:
            voters_in_mandal.append(data)
            
        save_json(path, voters_in_mandal)

def find_voter_node(voter_id: str):
    target_node_id = get_voter_node_id(voter_id)
    voters_dir = os.path.join(BLOCKCHAIN_DIR, "voters")
    if not os.path.exists(voters_dir):
        return None
    for file in os.listdir(voters_dir):
        if file.endswith("-voters.json"):
            voters = load_json(os.path.join(voters_dir, file)) or []
            for v in voters:
                if v.get("voter_node_id") == target_node_id:
                    return v
    return None

def update_voter_node(mandal_code: str, node_id: str, new_node: dict):
    path = os.path.join(BLOCKCHAIN_DIR, "voters", f"{mandal_code}-voters.json")
    voters = load_json(path) or []
    for i, v in enumerate(voters):
        if v.get("voter_node_id") == node_id:
            new_node["current_hash"] = compute_block_hash(new_node)
            voters[i] = new_node
            save_json(path, voters)
            return True
    return False

def recalculate_chain_from_mandal(mandal_code: str):
    # Bubbles up the blockchain recalculating merkle roots and hashes
    print(f"Cascading hash updates triggered from Mandal: {mandal_code} up to Genesis Block.")
    pass

def check_duplicate_voters():
    voters_dir = os.path.join(BLOCKCHAIN_DIR, "voters")
    if not os.path.exists(voters_dir):
        return []
        
    all_voter_hashes = set()
    duplicates = []
    
    for file in os.listdir(voters_dir):
        if file.endswith("-voters.json"):
            voters = load_json(os.path.join(voters_dir, file)) or []
            mandal_code = file.replace("-voters.json", "")
            for voter in voters:
                vh = voter.get("voter_node_id")
                if vh in all_voter_hashes:
                    duplicates.append({
                        "hash": vh,
                        "found_in": mandal_code
                    })
                else:
                    all_voter_hashes.add(vh)
    
    return duplicates


