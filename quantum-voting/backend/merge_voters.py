import sqlite3, hashlib, auth

SEED_VOTERS = [
    {'v_id': 'TG1234567890', 'name': 'Ravi Kumar Reddy', 'pwd': 'Ravi@1234', 'st': 'TG', 'dist': 'HYD', 'man': 'TG-HYD-SEC', 'const': 'Secunderabad Assembly'},
    {'v_id': 'TG1234567891', 'name': 'Priya Lakshmi', 'pwd': 'Priya@1234', 'st': 'TG', 'dist': 'HYD', 'man': 'TG-HYD-BGP', 'const': 'Begumpet Assembly'},
    {'v_id': 'AP1234567890', 'name': 'Venkata Rao Naidu', 'pwd': 'Venkat@1234', 'st': 'AP', 'dist': 'VSP', 'man': 'AP-VSP-GAJ', 'const': 'Gajuwaka Assembly'},
    {'v_id': 'MH1234567890', 'name': 'Rahul Patil', 'pwd': 'Rahul@1234', 'st': 'MH', 'dist': 'MUM', 'man': 'MH-MUM-AND', 'const': 'Andheri East Assembly'},
    {'v_id': 'KA1234567890', 'name': 'Kiran Kumar Gowda', 'pwd': 'Kiran@1234', 'st': 'KA', 'dist': 'BLR', 'man': 'KA-BLR-WHT', 'const': 'Whitefield Assembly'},
    {'v_id': 'TN1234567890', 'name': 'Murugan Selvam', 'pwd': 'Murugan@1234', 'st': 'TN', 'dist': 'CHN', 'man': 'TN-CHN-ANN', 'const': 'Anna Nagar Assembly'},
    {'v_id': 'DL1234567890', 'name': 'Vikram Singh', 'pwd': 'Vikram@1234', 'st': 'DL', 'dist': 'SDL', 'man': 'DL-SDL-HAU', 'const': 'Hauz Khas Assembly'},
    {'v_id': 'UP1234567890', 'name': 'Rajesh Tiwari', 'pwd': 'Rajesh@1234', 'st': 'UP', 'dist': 'LKO', 'man': 'UP-LKO-LKU', 'const': 'Lucknow Central Assembly'}
]

conn = sqlite3.connect('quantum_voting.db')
c = conn.cursor()

added = 0
for v in SEED_VOTERS:
    v_hash = hashlib.sha256((v['v_id'] + 'PEPPER').encode()).hexdigest()
    p_hash = auth.get_password_hash(v['pwd'])
    node_id = hashlib.sha256(v['v_id'].encode()).hexdigest()
    
    try:
        c.execute("""
            INSERT INTO voters (voter_node_id, voter_id_hash, voter_name_hash, dob_hash, password_hash, state_code, district_code, mandal_code, constituency, block_hash, previous_hash)
            VALUES (?, ?, 'SEED-NAME-HASH', 'SEED-DOB-HASH', ?, ?, ?, ?, ?, 'HASH', '0000')
        """, (node_id, v_hash, p_hash, v['st'], v['dist'], v['man'], v['const']))
        added += 1
    except sqlite3.IntegrityError:
        pass

conn.commit()
conn.close()
print(f'Successfully merged {added} legacy voters back into the Quantum Ledger.')
