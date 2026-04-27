import sqlite3, hashlib, os, datetime
import auth
import blockchain_engine

conn = sqlite3.connect('quantum_voting.db')
c = conn.cursor()

# 1. Clear Existing Simulation Data
c.execute('DELETE FROM voters')
c.execute('DELETE FROM votes')
c.execute('DELETE FROM candidates')
c.execute('DELETE FROM elections')
c.execute("DELETE FROM geography_mandals WHERE state_code = 'AP'")
c.execute("DELETE FROM geography_districts WHERE state_code = 'AP'")

# 2. Inject AP Geography
districts = [
    ('VSP', 'Visakhapatnam', 'AP'), ('VJA', 'Vijayawada', 'AP'), 
    ('GNT', 'Guntur', 'AP'), ('TPT', 'Tirupati', 'AP'), ('KNL', 'Kurnool', 'AP')
]
for d_code, d_name, s_code in districts:
    c.execute("INSERT OR IGNORE INTO geography_districts (district_code, district_name, district_name_hash, state_code, block_hash, previous_hash) VALUES (?,?,?,?,'HASH','0000')",
              (d_code, d_name, hashlib.sha256(d_name.encode()).hexdigest(), s_code))

mandals = [
    ('AP-VSP-GAJ', 'Gajuwaka', 'VSP'), ('AP-VSP-BHP', 'Bheemunipatnam', 'VSP'),
    ('AP-VJA-VJU', 'Vijayawada Urban', 'VJA'), ('AP-VJA-GAN', 'Gannavaram', 'VJA'),
    ('AP-GNT-GNU', 'Guntur Urban', 'GNT'), ('AP-GNT-TEN', 'Tenali', 'GNT'),
    ('AP-TPT-TPU', 'Tirupati Urban', 'TPT'), ('AP-TPT-SRK', 'Srikalahasti', 'TPT'),
    ('AP-KNL-KNU', 'Kurnool Urban', 'KNL'), ('AP-KNL-ADO', 'Adoni', 'KNL')
]
for m_code, m_name, d_code in mandals:
    c.execute("INSERT OR IGNORE INTO geography_mandals (mandal_code, mandal_name, mandal_name_hash, district_code, state_code, block_hash, previous_hash) VALUES (?,?,?,?,?,'HASH','0000')",
              (m_code, m_name, hashlib.sha256(m_name.encode()).hexdigest(), d_code, 'AP'))

# 3. Create AP Election
election_id = 'ELEC-AP-2026-001'
c.execute("""
    INSERT INTO elections (election_id, state_code, election_type, status, start_datetime, end_datetime, block_hash, previous_hash)
    VALUES (?, 'AP', 'Andhra Pradesh State Assembly Election 2026', 'ACTIVE', '2026-01-01 00:00:00', '2026-12-31 23:59:59', ?, '0000')
""", (election_id, hashlib.sha256(election_id.encode()).hexdigest()))

# 4. Forge 50 AP Voters
AP_VOTERS = [
    ('AP2026000001', 'Venkata Suresh Naidu', 'Suresh@2026', 'VSP', 'AP-VSP-GAJ', 'Gajuwaka Assembly'),
    ('AP2026000002', 'Padmavathi Rao', 'Padma@2026', 'VSP', 'AP-VSP-GAJ', 'Gajuwaka Assembly'),
    ('AP2026000003', 'Ramu Krishna Varma', 'Ramu@2026', 'VSP', 'AP-VSP-GAJ', 'Gajuwaka Assembly'),
    ('AP2026000004', 'Swathi Laxmi', 'Swathi@2026', 'VSP', 'AP-VSP-GAJ', 'Gajuwaka Assembly'),
    ('AP2026000005', 'Charan Kumar Reddy', 'Charan@2026', 'VSP', 'AP-VSP-GAJ', 'Gajuwaka Assembly'),
    ('AP2026000006', 'Naga Raju Patnaik', 'Naga@2026', 'VSP', 'AP-VSP-BHP', 'Bheemunipatnam Assembly'),
    ('AP2026000007', 'Durga Prasad Rao', 'Durga@2026', 'VSP', 'AP-VSP-BHP', 'Bheemunipatnam Assembly'),
    ('AP2026000008', 'Sravani Devi', 'Sravani@2026', 'VSP', 'AP-VSP-BHP', 'Bheemunipatnam Assembly'),
    ('AP2026000009', 'Kiran Babu Naidu', 'Kiran@2026', 'VSP', 'AP-VSP-BHP', 'Bheemunipatnam Assembly'),
    ('AP2026000010', 'Mounika Sharma', 'Mounika@2026', 'VSP', 'AP-VSP-BHP', 'Bheemunipatnam Assembly'),
    ('AP2026000011', 'Balakrishna Rao', 'Bala@2026', 'VJA', 'AP-VJA-VJU', 'Vijayawada Central Assembly'),
    ('AP2026000012', 'Sarada Devi Sharma', 'Sarada@2026', 'VJA', 'AP-VJA-VJU', 'Vijayawada Central Assembly'),
    ('AP2026000013', 'Praveen Kumar Varma', 'Praveen@2026', 'VJA', 'AP-VJA-VJU', 'Vijayawada Central Assembly'),
    ('AP2026000014', 'Hymavathi Naidu', 'Hyma@2026', 'VJA', 'AP-VJA-VJU', 'Vijayawada Central Assembly'),
    ('AP2026000015', 'Siva Prasad Reddy', 'Siva@2026', 'VJA', 'AP-VJA-VJU', 'Vijayawada Central Assembly'),
    ('AP2026000016', 'Apparao Naidu', 'Appa@2026', 'VJA', 'AP-VJA-GAN', 'Gannavaram Assembly'),
    ('AP2026000017', 'Vasantha Lakshmi', 'Vasu@2026', 'VJA', 'AP-VJA-GAN', 'Gannavaram Assembly'),
    ('AP2026000018', 'Murali Krishna Rao', 'Murali@2026', 'VJA', 'AP-VJA-GAN', 'Gannavaram Assembly'),
    ('AP2026000019', 'Nirmala Devi', 'Nirmala@2026', 'VJA', 'AP-VJA-GAN', 'Gannavaram Assembly'),
    ('AP2026000020', 'Ravi Teja Varma', 'Ravi@2026', 'VJA', 'AP-VJA-GAN', 'Gannavaram Assembly'),
    ('AP2026000021', 'Narasimha Rao Potti', 'Nara@2026', 'GNT', 'AP-GNT-GNU', 'Guntur Urban Assembly'),
    ('AP2026000022', 'Kamala Devi', 'Kamala@2026', 'GNT', 'AP-GNT-GNU', 'Guntur Urban Assembly'),
    ('AP2026000023', 'Venkat Ramana Reddy', 'Venkat@2026', 'GNT', 'AP-GNT-GNU', 'Guntur Urban Assembly'),
    ('AP2026000024', 'Anitha Kumari', 'Anitha@2026', 'GNT', 'AP-GNT-GNU', 'Guntur Urban Assembly'),
    ('AP2026000025', 'Srikanth Naidu', 'Srikanth@2026', 'GNT', 'AP-GNT-GNU', 'Guntur Urban Assembly'),
    ('AP2026000026', 'Raghava Rao', 'Raghu@2026', 'GNT', 'AP-GNT-TEN', 'Tenali Assembly'),
    ('AP2026000027', 'Vijaya Lakshmi', 'Vijaya@2026', 'GNT', 'AP-GNT-TEN', 'Tenali Assembly'),
    ('AP2026000028', 'Sudheer Kumar Sharma', 'Sudheer@2026', 'GNT', 'AP-GNT-TEN', 'Tenali Assembly'),
    ('AP2026000029', 'Aruna Kumari', 'Aruna@2026', 'GNT', 'AP-GNT-TEN', 'Tenali Assembly'),
    ('AP2026000030', 'Prasad Rao Naidu', 'Prasad@2026', 'GNT', 'AP-GNT-TEN', 'Tenali Assembly'),
    ('AP2026000031', 'Govinda Raju', 'Govinda@2026', 'TPT', 'AP-TPT-TPU', 'Tirupati Urban Assembly'),
    ('AP2026000032', 'Venkateswari Devi', 'Venky@2026', 'TPT', 'AP-TPT-TPU', 'Tirupati Urban Assembly'),
    ('AP2026000033', 'Ramesh Babu Reddy', 'Ramesh@2026', 'TPT', 'AP-TPT-TPU', 'Tirupati Urban Assembly'),
    ('AP2026000034', 'Sudha Rani', 'Sudha@2026', 'TPT', 'AP-TPT-TPU', 'Tirupati Urban Assembly'),
    ('AP2026000035', 'Tirupati Naidu', 'Tirupati@2026', 'TPT', 'AP-TPT-TPU', 'Tirupati Urban Assembly'),
    ('AP2026000036', 'Narayana Swamy', 'Narayana@2026', 'TPT', 'AP-TPT-SRK', 'Srikalahasti Assembly'),
    ('AP2026000037', 'Sarojini Devi', 'Saroja@2026', 'TPT', 'AP-TPT-SRK', 'Srikalahasti Assembly'),
    ('AP2026000038', 'Venkata Subramanyam', 'Subbu@2026', 'TPT', 'AP-TPT-SRK', 'Srikalahasti Assembly'),
    ('AP2026000039', 'Radha Krishna Naidu', 'Radha@2026', 'TPT', 'AP-TPT-SRK', 'Srikalahasti Assembly'),
    ('AP2026000040', 'Manjula Rani', 'Manju@2026', 'TPT', 'AP-TPT-SRK', 'Srikalahasti Assembly'),
    ('AP2026000041', 'Obul Reddy', 'Obul@2026', 'KNL', 'AP-KNL-KNU', 'Kurnool Urban Assembly'),
    ('AP2026000042', 'Jhansi Rani', 'Jhansi@2026', 'KNL', 'AP-KNL-KNU', 'Kurnool Urban Assembly'),
    ('AP2026000043', 'Krishna Murthy Sharma', 'Krishna@2026', 'KNL', 'AP-KNL-KNU', 'Kurnool Urban Assembly'),
    ('AP2026000044', 'Latha Devi', 'Latha@2026', 'KNL', 'AP-KNL-KNU', 'Kurnool Urban Assembly'),
    ('AP2026000045', 'Srinivasa Rao', 'Srini@2026', 'KNL', 'AP-KNL-KNU', 'Kurnool Urban Assembly'),
    ('AP2026000046', 'Peda Raju Naidu', 'Peda@2026', 'KNL', 'AP-KNL-ADO', 'Adoni Assembly'),
    ('AP2026000047', 'Bhagyalaxmi', 'Bhagya@2026', 'KNL', 'AP-KNL-ADO', 'Adoni Assembly'),
    ('AP2026000048', 'Chennakesava Reddy', 'Chenna@2026', 'KNL', 'AP-KNL-ADO', 'Adoni Assembly'),
    ('AP2026000049', 'Usha Rani Sharma', 'Usha@2026', 'KNL', 'AP-KNL-ADO', 'Adoni Assembly'),
    ('AP2026000050', 'Nagarjuna Rao', 'Nagarjuna@2026', 'KNL', 'AP-KNL-ADO', 'Adoni Assembly'),
]

# --- BLOCKCHAIN SEEDING INTEGRATION ---
BLOCKCHAIN_DIR = 'blockchain'
VOTERS_DIR = os.path.join(BLOCKCHAIN_DIR, 'voters')
MANDALS_DIR = os.path.join(BLOCKCHAIN_DIR, 'mandals')

os.makedirs(VOTERS_DIR, exist_ok=True)
os.makedirs(MANDALS_DIR, exist_ok=True)

# Map voters to mandals for blockchain file generation
mandal_voters = {}
for v_id, name, pwd, dist, mand, const in AP_VOTERS:
    if mand not in mandal_voters: mandal_voters[mand] = []
    mandal_voters[mand].append({
        "v_id": v_id, "name": name, "pwd": pwd, "dist": dist, "mand": mand, "const": const
    })

for m_code, mv_list in mandal_voters.items():
    voter_nodes = []
    for v in mv_list:
        v_id = v['v_id']
        v_hash = hashlib.sha256((v_id + 'PEPPER').encode()).hexdigest()
        p_hash = auth.get_password_hash(v['pwd'])
        node_id = blockchain_engine.get_voter_node_id(v_id) # USE THE HASHED ID
        
        # Insert into SQLite
        c.execute("""
            INSERT INTO voters (voter_node_id, voter_id_hash, voter_name_hash, dob_hash, password_hash, state_code, district_code, mandal_code, constituency, block_hash, previous_hash)
            VALUES (?, ?, ?, 'AP-DOB-HASH', ?, 'AP', ?, ?, ?, 'HASH', '0000')
        """, (node_id, v_hash, hashlib.sha256(v['name'].encode()).hexdigest(), p_hash, v['dist'], v['mand'], v['const']))
        
        # Prepare Blockchain Node
        node = {
            "voter_node_id": node_id, # Match SQLite and find_voter_node logic
            "voter_id_hash": v_hash,
            "state": "AP",
            "district": v['dist'],
            "mandal_block_id": v['mand'],
            "constituency": v['const'],
            "has_voted": False,
            "registered_at": datetime.datetime.now().isoformat(),
            "voter_name_hash": hashlib.sha256(v['name'].encode()).hexdigest(),
            "current_hash": hashlib.sha256(f"{v_id}{v_hash}".encode()).hexdigest()
        }
        voter_nodes.append(node)
    
    # Save to blockchain/voters/
    blockchain_engine.save_json(os.path.join(VOTERS_DIR, f"{m_code}-voters.json"), voter_nodes)
    
    # Also save Mandal block
    mandal_block = {
        "block_type": "MANDAL",
        "block_id": m_code,
        "parent_district_code": m_code.split("-")[1],
        "total_voters": len(voter_nodes),
        "votes_cast": 0,
        "current_hash": hashlib.sha256(m_code.encode()).hexdigest()
    }
    blockchain_engine.save_json(os.path.join(MANDALS_DIR, f"{m_code}.json"), mandal_block)

# 5. Seed Candidates
AP_CANDIDATES = {
    'Gajuwaka Assembly': [('Tippala Nagi Reddy', 'YSRCP'), ('Panchakarla Ramesh', 'TDP'), ('Vasupalli Ganesh', 'BJP'), ('Palla Srinivas', 'JSP')],
    'Bheemunipatnam Assembly': [('Ganta Srinivasa Rao', 'TDP'), ('Muttamsetti Srinivas', 'YSRCP'), ('Adari Anand Kumar', 'BJP'), ('Kolagatla Vamsi', 'JSP')],
    'Vijayawada Central Assembly': [('Malladi Vishnu', 'TDP'), ('Bode Prasad', 'YSRCP'), ('Vangalapudi Anitha', 'BJP'), ('Velampalli Srinivas', 'JSP')],
    'Gannavaram Assembly': [('Vallabhaneni Vamsi', 'TDP'), ('Devineni Avinash', 'YSRCP'), ('Konakalla Narayana', 'BJP'), ('Grandhi Srinivas', 'JSP')],
    'Guntur Urban Assembly': [('Nara Lokesh', 'TDP'), ('Pinnelli Ramakrishna', 'YSRCP'), ('Srinivasa Varma', 'BJP'), ('Gottipati Ravi Kumar', 'JSP')],
    'Tenali Assembly': [('Annabathula Siva Kumar', 'TDP'), ('Vasantha Krishna Prasad', 'YSRCP'), ('Yarlagadda Venkata Rao', 'BJP'), ('Bolla Brahmanandam', 'JSP')],
    'Tirupati Urban Assembly': [('Arani Srinivasulu', 'TDP'), ('Bhumana Karunakar Reddy', 'YSRCP'), ('Veera Raghava Reddy', 'BJP'), ('Panabaka Lakshmi', 'JSP')],
    'Srikalahasti Assembly': [('Bojjala Gopal Krishna Reddy', 'TDP'), ('Kishore Kumar Reddy', 'YSRCP'), ('Vakati Narayana Reddy', 'BJP'), ('Gudivada Amarnath', 'JSP')],
    'Kurnool Urban Assembly': [('Kotla Surya Prakash Reddy', 'TDP'), ('Hafeez Khan', 'YSRCP'), ('Nandyala Krishnaiah', 'BJP'), ('Banaganapalli Nagendra', 'JSP')],
    'Adoni Assembly': [('Paritala Sunitha', 'TDP'), ('Byreddy Shabari', 'YSRCP'), ('Gonela Madhava Reddy', 'BJP'), ('Katasani Rambhupal Reddy', 'JSP')]
}

for const, clist in AP_CANDIDATES.items():
    for name, party in clist:
        c_hash = hashlib.sha256((name + party).encode()).hexdigest()
        c.execute("""
            INSERT INTO candidates (candidate_id_hash, candidate_name_hash, party_hash, display_name, party_name, constituency, mandal_code, election_id)
            VALUES (?, 'HASH', 'HASH', ?, ?, ?, 'AP-MULTI', ?)
        """, (c_hash, name, party, const, election_id))

conn.commit()
conn.close()
print('Andhra Pradesh 2026 Simulation Deployed Successfully with Blockchain Sync.')
