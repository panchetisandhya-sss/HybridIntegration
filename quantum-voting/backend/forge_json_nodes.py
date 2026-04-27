import sqlite3, json, os, hashlib, datetime
import blockchain_engine

conn = sqlite3.connect('quantum_voting.db')
c = conn.cursor()

# Fetch all AP voters
voters = c.execute("SELECT voter_node_id, voter_id_hash, state_code, district_code, mandal_code, constituency FROM voters WHERE state_code = 'AP'").fetchall()

# Initialize dirs
blockchain_engine.initialize_blockchain_dirs()

# Group voters by mandal
mandal_groups = {}
for v in voters:
    node_id, v_hash, state, dist, mandal, const = v
    if mandal not in mandal_groups: mandal_groups[mandal] = []
    
    node_data = {
        "voter_node_id": node_id,
        "voter_id_hash": v_hash,
        "state": state,
        "district": dist,
        "mandal_block_id": mandal,
        "constituency": const,
        "has_voted": False,
        "registered_at": str(datetime.datetime.now())
    }
    mandal_groups[mandal].append(node_data)

# Write JSON files
for mandal, nodes in mandal_groups.items():
    path = os.path.join('blockchain', 'voters', f'{mandal}-voters.json')
    with open(path, 'w') as f:
        json.dump(nodes, f, indent=4)

conn.close()
print(f"Successfully forged JSON blockchain nodes for {len(voters)} AP voters.")
