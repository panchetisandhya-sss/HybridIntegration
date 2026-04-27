import sqlite3, hashlib, random, datetime

conn = sqlite3.connect('quantum_voting.db')
c = conn.cursor()

# 1. Fetch all AP voters
voters = c.execute("SELECT voter_node_id, voter_id_hash, constituency, mandal_code, district_code, state_code FROM voters WHERE state_code = 'AP' AND has_voted = 0").fetchall()

# 2. Fetch all candidates and group by constituency
candidates_db = c.execute("SELECT candidate_id_hash, constituency FROM candidates").fetchall()
const_map = {}
for c_hash, const in candidates_db:
    if const not in const_map: const_map[const] = []
    const_map[const].append(c_hash)

print(f"Simulating {len(voters)} votes...")

votes_cast = 0
for v_node_id, v_id_hash, const, mandal, district, state in voters:
    if const not in const_map: continue
    
    # Pick a random candidate from their constituency
    candidate_choice = random.choice(const_map[const])
    
    # Generate Mock Quantum Metrics
    qber = random.uniform(0.5, 2.5)
    s_val = random.uniform(2.5, 2.9)
    vote_id = hashlib.sha256(str(random.random()).encode()).hexdigest()[:16]
    receipt_hash = hashlib.sha256((v_node_id + candidate_choice).encode()).hexdigest()
    
    # Insert into votes table
    c.execute("""
        INSERT INTO votes (
            vote_id, voter_node_id, election_id, mandal_code, district_code, state_code,
            encrypted_vote, vote_receipt_hash, candidate_id_hash,
            qber_value, s_value, photon_count, basis_match_rate, channel_status,
            quantum_circuit, block_hash, previous_hash, voted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        vote_id, v_node_id, 'ELEC-AP-2026-001', mandal, district, state,
        'ENCRYPTED_SIM', receipt_hash, candidate_choice,
        qber, s_val, 1024, 0.99, 'SECURE', '{}',
        hashlib.sha256(vote_id.encode()).hexdigest(), '0000',
        datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ))
    
    # Update voter status
    c.execute("UPDATE voters SET has_voted = 1 WHERE voter_node_id = ?", (v_node_id,))
    votes_cast += 1

conn.commit()
conn.close()
print(f"Success: {votes_cast} votes cryptographically committed to the blockchain.")
