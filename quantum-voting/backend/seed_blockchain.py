import os
import json
from datetime import datetime
from blockchain_engine import compute_block_hash, save_json, load_json, get_voter_node_id, get_voter_name_hash, BLOCKCHAIN_DIR, SECRET_SALT, PEPPER
from merkle_tree import compute_merkle_root, sha256_hash
from india_geography import INDIA_GEOGRAPHY
import auth

SEED_VOTERS = [
    {"voter_id": "TG1234567890", "full_name": "Ravi Kumar Reddy", "password": "Voter@123", "dob": "1990-05-15", "state": "Telangana", "district": "Hyderabad", "mandal": "Secunderabad", "constituency": "Secunderabad Assembly"},
    {"voter_id": "TG1234567891", "full_name": "Priya Lakshmi", "password": "Voter@123", "dob": "1995-08-22", "state": "Telangana", "district": "Hyderabad", "mandal": "Begumpet", "constituency": "Begumpet Assembly"},
    {"voter_id": "TG1234567892", "full_name": "Suresh Yadav", "password": "Voter@123", "dob": "1988-03-10", "state": "Telangana", "district": "Warangal", "mandal": "Hanamkonda", "constituency": "Hanamkonda Assembly"},
    {"voter_id": "AP1234567890", "full_name": "Venkata Rao Naidu", "password": "Voter@123", "dob": "1985-11-30", "state": "Andhra Pradesh", "district": "Visakhapatnam", "mandal": "Gajuwaka", "constituency": "Gajuwaka Assembly"},
    {"voter_id": "AP1234567891", "full_name": "Sita Devi Sharma", "password": "Voter@123", "dob": "1992-07-18", "state": "Andhra Pradesh", "district": "Vijayawada", "mandal": "Gannavaram", "constituency": "Gannavaram Assembly"},
    {"voter_id": "MH1234567890", "full_name": "Rahul Patil", "password": "Voter@123", "dob": "1993-02-14", "state": "Maharashtra", "district": "Mumbai", "mandal": "Andheri", "constituency": "Andheri East Assembly"},
    {"voter_id": "MH1234567891", "full_name": "Sneha Deshmukh", "password": "Voter@123", "dob": "1997-09-25", "state": "Maharashtra", "district": "Mumbai", "mandal": "Bandra", "constituency": "Bandra West Assembly"},
    {"voter_id": "MH1234567892", "full_name": "Amit Kulkarni", "password": "Voter@123", "dob": "1991-12-05", "state": "Maharashtra", "district": "Pune", "mandal": "Kothrud", "constituency": "Kothrud Assembly"},
    {"voter_id": "KA1234567890", "full_name": "Kiran Kumar Gowda", "password": "Voter@123", "dob": "1989-06-20", "state": "Karnataka", "district": "Bangalore", "mandal": "Whitefield", "constituency": "Whitefield Assembly"},
    {"voter_id": "KA1234567891", "full_name": "Deepa Nair", "password": "Voter@123", "dob": "1994-04-08", "state": "Karnataka", "district": "Mysore", "mandal": "Mysore Urban", "constituency": "Mysore Urban Assembly"},
    {"voter_id": "TN1234567890", "full_name": "Murugan Selvam", "password": "Voter@123", "dob": "1987-01-12", "state": "Tamil Nadu", "district": "Chennai", "mandal": "Anna Nagar", "constituency": "Anna Nagar Assembly"},
    {"voter_id": "TN1234567891", "full_name": "Kavitha Sundaram", "password": "Voter@123", "dob": "1996-10-30", "state": "Tamil Nadu", "district": "Coimbatore", "mandal": "Coimbatore Urban", "constituency": "Coimbatore North Assembly"},
    {"voter_id": "DL1234567890", "full_name": "Vikram Singh", "password": "Voter@123", "dob": "1990-08-17", "state": "Delhi", "district": "South Delhi", "mandal": "Hauz Khas", "constituency": "Hauz Khas Assembly"},
    {"voter_id": "DL1234567891", "full_name": "Pooja Sharma", "password": "Voter@123", "dob": "1998-03-22", "state": "Delhi", "district": "North Delhi", "mandal": "Model Town", "constituency": "Model Town Assembly"},
    {"voter_id": "UP1234567890", "full_name": "Rajesh Tiwari", "password": "Voter@123", "dob": "1986-07-04", "state": "Uttar Pradesh", "district": "Lucknow", "mandal": "Lucknow Urban", "constituency": "Lucknow Central Assembly"},
    {"voter_id": "UP1234567891", "full_name": "Sunita Mishra", "password": "Voter@123", "dob": "1993-11-19", "state": "Uttar Pradesh", "district": "Varanasi", "mandal": "Varanasi Urban", "constituency": "Varanasi North Assembly"}
]

def seed_blockchain():
    print("Seeding from strict INDIA_GEOGRAPHY config...")
    genesis_timestamp = datetime.utcnow().isoformat()
    state_block_hashes = []
    
    password_hash = auth.get_password_hash("Voter@123")
    
    for state_name, state_data in INDIA_GEOGRAPHY.items():
        s_code = state_data["code"]
        district_block_hashes = []
        state_total_voters = 0
        
        for dist_name, dist_data in state_data["districts"].items():
            d_code = dist_data["code"]
            mandal_block_hashes = []
            dist_total_voters = 0
            
            for mandal_name in dist_data["mandals"]:
                m_code = f"{d_code}-{mandal_name[:3].upper()}"
                
                # Find voters bound to THIS mandal strictly
                voters_list = [v for v in SEED_VOTERS if v["state"] == state_name and v["district"] == dist_name and v["mandal"] == mandal_name]
                
                voter_nodes = []
                voter_hashes_for_merkle = []
                
                for i, v in enumerate(voters_list):
                    v_id = v['voter_id']
                    node_id = get_voter_node_id(v_id)
                    
                    node = {
                        "block_type": "VOTER",
                        "voter_node_id": node_id,
                        "voter_name_hash": get_voter_name_hash(v['full_name'], v_id),
                        "voter_id_hash": sha256_hash(f"{v_id}{PEPPER}"),
                        "password_hash": password_hash,
                        "dob_hash": sha256_hash(f"{v['dob']}{SECRET_SALT}"),
                        "mandal_block_id": m_code,
                        "has_voted": False,
                        "vote_receipt_hash": "",
                        "registered_at_hash": sha256_hash(genesis_timestamp),
                        "previous_hash": "0000" if i == 0 else voter_nodes[-1]["current_hash"]
                    }
                    node["current_hash"] = compute_block_hash(node)
                    voter_nodes.append(node)
                    voter_hashes_for_merkle.append(node["current_hash"])
                
                if voter_nodes:
                    save_json(os.path.join(BLOCKCHAIN_DIR, "voters", f"{m_code}-voters.json"), voter_nodes)
                
                mandal_block = {
                    "block_type": "MANDAL",
                    "block_id": m_code,
                    "mandal_name_hash": sha256_hash(f"{mandal_name}{SECRET_SALT}"),
                    "parent_district_code": d_code,
                    "total_voters": len(voters_list),
                    "votes_cast": 0,
                    "previous_hash": "0000",
                    "voter_merkle_root": compute_merkle_root(voter_hashes_for_merkle)
                }
                mandal_block["current_hash"] = compute_block_hash(mandal_block)
                save_json(os.path.join(BLOCKCHAIN_DIR, "mandals", f"{m_code}.json"), mandal_block)
                mandal_block_hashes.append(mandal_block["current_hash"])
                dist_total_voters += len(voters_list)
                
            district_block = {
                "block_type": "DISTRICT",
                "block_id": d_code,
                "district_name_hash": sha256_hash(f"{dist_name}{SECRET_SALT}"),
                "parent_state_code": s_code,
                "total_mandals": len(dist_data["mandals"]),
                "total_voters_in_district": dist_total_voters,
                "previous_hash": "0000",
                "child_block_hashes": mandal_block_hashes
            }
            district_block["current_hash"] = compute_block_hash(district_block)
            save_json(os.path.join(BLOCKCHAIN_DIR, "districts", f"{d_code}.json"), district_block)
            district_block_hashes.append(district_block["current_hash"])
            state_total_voters += dist_total_voters
            
        state_block = {
            "block_type": "STATE",
            "block_id": f"STATE-{s_code}",
            "state_name_hash": sha256_hash(f"{state_name}{SECRET_SALT}"),
            "state_code": s_code,
            "total_districts": len(state_data["districts"]),
            "total_voters_in_state": state_total_voters,
            "previous_hash": "GENESIS_PLACEHOLDER",
            "child_block_hashes": district_block_hashes
        }
        state_block["current_hash"] = compute_block_hash(state_block)
        save_json(os.path.join(BLOCKCHAIN_DIR, "states", f"{s_code}.json"), state_block)
        state_block_hashes.append(state_block["current_hash"])
        
    genesis_block = {
        "block_type": "GENESIS",
        "block_id": "INDIA-001",
        "country": "India",
        "created_at": genesis_timestamp,
        "total_states": len(INDIA_GEOGRAPHY),
        "total_voters_hash": sha256_hash("".join(state_block_hashes)),
        "previous_hash": "0000000000000000000000000000000000000000000000000000000000000000"
    }
    genesis_block["current_hash"] = compute_block_hash(genesis_block)
    
    for s_code in [INDIA_GEOGRAPHY[s]["code"] for s in INDIA_GEOGRAPHY]:
        path = os.path.join(BLOCKCHAIN_DIR, "states", f"{s_code}.json")
        st = load_json(path)
        st["previous_hash"] = genesis_block["current_hash"]
        st["current_hash"] = compute_block_hash(st) 
        save_json(path, st)

    save_json(os.path.join(BLOCKCHAIN_DIR, "genesis.json"), genesis_block)
    print("Seeding Complete with Hard Geographic Constraints!")

if __name__ == "__main__":
    seed_blockchain()
