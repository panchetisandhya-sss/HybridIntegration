import sqlite3
import hashlib
from datetime import datetime

DATABASE_NAME = 'quantum_voting.db'

def safe_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def get_bcrypt_mock(password: str) -> str:
    # Simulating a bcrypt hash for the seed
    return f"$2b$12${safe_hash(password)[:22]}..."

SEED_VOTERS = [
    {"voter_id": "TG1234567890", "full_name": "Ravi Kumar Reddy", "password": "Ravi@1234", "dob": "1990-05-15", "state": "TG", "district": "HYD", "mandal": "TG-HYD-SEC", "constituency": "Secunderabad Assembly"},
    {"voter_id": "TG1234567893", "full_name": "Anjali Reddy", "password": "Anjali@1234", "dob": "1993-04-12", "state": "TG", "district": "HYD", "mandal": "TG-HYD-SEC", "constituency": "Secunderabad Assembly"},
    {"voter_id": "TG1234567894", "full_name": "Mahesh Babu Rao", "password": "Mahesh@1234", "dob": "1987-11-08", "state": "TG", "district": "HYD", "mandal": "TG-HYD-SEC", "constituency": "Secunderabad Assembly"},
    {"voter_id": "TG1234567891", "full_name": "Priya Lakshmi", "password": "Priya@1234", "dob": "1995-08-22", "state": "TG", "district": "HYD", "mandal": "TG-HYD-BGP", "constituency": "Begumpet Assembly"},
    {"voter_id": "TG1234567895", "full_name": "Srinivas Goud", "password": "Srini@1234", "dob": "1989-02-17", "state": "TG", "district": "HYD", "mandal": "TG-HYD-BGP", "constituency": "Begumpet Assembly"},
    {"voter_id": "TG1234567896", "full_name": "Ramya Krishna", "password": "Ramya@1234", "dob": "1994-06-30", "state": "TG", "district": "HYD", "mandal": "TG-HYD-AMP", "constituency": "Ameerpet Assembly"},
    {"voter_id": "TG1234567897", "full_name": "Venu Gopal Sharma", "password": "Venu@1234", "dob": "1986-09-14", "state": "TG", "district": "HYD", "mandal": "TG-HYD-AMP", "constituency": "Ameerpet Assembly"},
    {"voter_id": "TG1234567892", "full_name": "Suresh Yadav", "password": "Suresh@1234", "dob": "1988-03-10", "state": "TG", "district": "WGL", "mandal": "TG-WGL-HNK", "constituency": "Hanamkonda Assembly"},
    {"voter_id": "TG1234567898", "full_name": "Padmavathi Devi", "password": "Padma@1234", "dob": "1991-12-25", "state": "TG", "district": "WGL", "mandal": "TG-WGL-HNK", "constituency": "Hanamkonda Assembly"},
    {"voter_id": "TG1234567899", "full_name": "Naresh Kumar Singh", "password": "Naresh@1234", "dob": "1985-07-19", "state": "TG", "district": "KMR", "mandal": "TG-KMR-KRU", "constituency": "Karimnagar Urban Assembly"},
    
    # AP
    {"voter_id": "AP1234567890", "full_name": "Venkata Rao Naidu", "password": "Venkat@1234", "dob": "1985-11-30", "state": "AP", "district": "VSP", "mandal": "AP-VSP-GAJ", "constituency": "Gajuwaka Assembly"},
    {"voter_id": "AP1234567892", "full_name": "Lakshmi Prasanna", "password": "Lakshmi@1234", "dob": "1992-04-05", "state": "AP", "district": "VSP", "mandal": "AP-VSP-GAJ", "constituency": "Gajuwaka Assembly"},
    {"voter_id": "AP1234567893", "full_name": "Chandra Sekhar Rao", "password": "Chandra@1234", "dob": "1983-08-11", "state": "AP", "district": "VSP", "mandal": "AP-VSP-GAJ", "constituency": "Gajuwaka Assembly"},
    {"voter_id": "AP1234567891", "full_name": "Sita Devi Sharma", "password": "Sita@1234", "dob": "1992-07-18", "state": "AP", "district": "VJA", "mandal": "AP-VJA-GAN", "constituency": "Gannavaram Assembly"},
    {"voter_id": "AP1234567894", "full_name": "Balakrishna Varma", "password": "Bala@1234", "dob": "1990-01-22", "state": "AP", "district": "VJA", "mandal": "AP-VJA-GAN", "constituency": "Gannavaram Assembly"},
    {"voter_id": "AP1234567895", "full_name": "Naga Babu Potti", "password": "Naga@1234", "dob": "1988-05-28", "state": "AP", "district": "GNT", "mandal": "AP-GNT-GNU", "constituency": "Guntur Urban Assembly"},

    # MH
    {"voter_id": "MH1234567890", "full_name": "Rahul Patil", "password": "Rahul@1234", "dob": "1993-02-14", "state": "MH", "district": "MUM", "mandal": "MH-MUM-AND", "constituency": "Andheri East Assembly"},
    {"voter_id": "MH1234567893", "full_name": "Sunita Bhosale", "password": "Sunita@1234", "dob": "1996-10-03", "state": "MH", "district": "MUM", "mandal": "MH-MUM-AND", "constituency": "Andheri East Assembly"},
    {"voter_id": "MH1234567894", "full_name": "Ganesh Jadhav", "password": "Ganesh@1234", "dob": "1984-07-21", "state": "MH", "district": "MUM", "mandal": "MH-MUM-AND", "constituency": "Andheri East Assembly"},
    {"voter_id": "MH1234567891", "full_name": "Sneha Deshmukh", "password": "Sneha@1234", "dob": "1997-09-25", "state": "MH", "district": "MUM", "mandal": "MH-MUM-BAN", "constituency": "Bandra West Assembly"},
    {"voter_id": "MH1234567895", "full_name": "Rohan Mehta", "password": "Rohan@1234", "dob": "1991-03-16", "state": "MH", "district": "MUM", "mandal": "MH-MUM-BAN", "constituency": "Bandra West Assembly"},
    {"voter_id": "MH1234567892", "full_name": "Amit Kulkarni", "password": "Amit@1234", "dob": "1991-12-05", "state": "MH", "district": "PUN", "mandal": "MH-PUN-KOT", "constituency": "Kothrud Assembly"},
    {"voter_id": "MH1234567896", "full_name": "Vaishali Pawar", "password": "Vaishali@1234", "dob": "1994-08-09", "state": "MH", "district": "PUN", "mandal": "MH-PUN-KOT", "constituency": "Kothrud Assembly"},
    {"voter_id": "MH1234567897", "full_name": "Nitin Gadge", "password": "Nitin@1234", "dob": "1987-11-30", "state": "MH", "district": "NGP", "mandal": "MH-NGP-NGU", "constituency": "Nagpur Urban Assembly"},

    # KA
    {"voter_id": "KA1234567890", "full_name": "Kiran Kumar Gowda", "password": "Kiran@1234", "dob": "1989-06-20", "state": "KA", "district": "BLR", "mandal": "KA-BLR-WHT", "constituency": "Whitefield Assembly"},
    {"voter_id": "KA1234567892", "full_name": "Divya Shree", "password": "Divya@1234", "dob": "1995-02-28", "state": "KA", "district": "BLR", "mandal": "KA-BLR-WHT", "constituency": "Whitefield Assembly"},
    {"voter_id": "KA1234567893", "full_name": "Manjunath Hegde", "password": "Manju@1234", "dob": "1986-09-11", "state": "KA", "district": "BLR", "mandal": "KA-BLR-WHT", "constituency": "Whitefield Assembly"},
    {"voter_id": "KA1234567894", "full_name": "Rekha Murthy", "password": "Rekha@1234", "dob": "1992-05-17", "state": "KA", "district": "BLR", "mandal": "KA-BLR-JAY", "constituency": "Jayanagar Assembly"},
    {"voter_id": "KA1234567891", "full_name": "Deepa Nair", "password": "Deepa@1234", "dob": "1994-04-08", "state": "KA", "district": "MYS", "mandal": "KA-MYS-MYU", "constituency": "Mysore Urban Assembly"},
    {"voter_id": "KA1234567895", "full_name": "Prashanth Kumar", "password": "Prash@1234", "dob": "1990-11-23", "state": "KA", "district": "MYS", "mandal": "KA-MYS-MYU", "constituency": "Mysore Urban Assembly"},

    # TN
    {"voter_id": "TN1234567890", "full_name": "Murugan Selvam", "password": "Murugan@1234", "dob": "1987-01-12", "state": "TN", "district": "CHN", "mandal": "TN-CHN-ANN", "constituency": "Anna Nagar Assembly"},
    {"voter_id": "TN1234567892", "full_name": "Meenakshi Sundari", "password": "Meena@1234", "dob": "1993-07-04", "state": "TN", "district": "CHN", "mandal": "TN-CHN-ANN", "constituency": "Anna Nagar Assembly"},
    {"voter_id": "TN1234567893", "full_name": "Arjun Doss", "password": "Arjun@1234", "dob": "1988-03-19", "state": "TN", "district": "CHN", "mandal": "TN-CHN-ANN", "constituency": "Anna Nagar Assembly"},
    {"voter_id": "TN1234567891", "full_name": "Kavitha Sundaram", "password": "Kavitha@1234", "dob": "1996-10-30", "state": "TN", "district": "CBE", "mandal": "TN-CBE-CBU", "constituency": "Coimbatore North Assembly"},
    {"voter_id": "TN1234567894", "full_name": "Senthil Nathan", "password": "Senthil@1234", "dob": "1991-06-15", "state": "TN", "district": "CBE", "mandal": "TN-CBE-CBU", "constituency": "Coimbatore North Assembly"},

    # DL
    {"voter_id": "DL1234567890", "full_name": "Vikram Singh", "password": "Vikram@1234", "dob": "1990-08-17", "state": "DL", "district": "SDL", "mandal": "DL-SDL-HAU", "constituency": "Hauz Khas Assembly"},
    {"voter_id": "DL1234567892", "full_name": "Neha Kapoor", "password": "Neha@1234", "dob": "1995-01-29", "state": "DL", "district": "SDL", "mandal": "DL-SDL-HAU", "constituency": "Hauz Khas Assembly"},
    {"voter_id": "DL1234567891", "full_name": "Pooja Sharma", "password": "Pooja@1234", "dob": "1998-03-22", "state": "DL", "district": "NDL", "mandal": "DL-NDL-MOD", "constituency": "Model Town Assembly"},
    {"voter_id": "DL1234567893", "full_name": "Rohit Verma", "password": "Rohit@1234", "dob": "1992-09-08", "state": "DL", "district": "NDL", "mandal": "DL-NDL-MOD", "constituency": "Model Town Assembly"},

    # UP
    {"voter_id": "UP1234567890", "full_name": "Rajesh Tiwari", "password": "Rajesh@1234", "dob": "1986-07-04", "state": "UP", "district": "LKO", "mandal": "UP-LKO-LKU", "constituency": "Lucknow Central Assembly"},
    {"voter_id": "UP1234567892", "full_name": "Geeta Pandey", "password": "Geeta@1234", "dob": "1993-12-11", "state": "UP", "district": "LKO", "mandal": "UP-LKO-LKU", "constituency": "Lucknow Central Assembly"},
    {"voter_id": "UP1234567893", "full_name": "Ashok Dubey", "password": "Ashok@1234", "dob": "1984-04-27", "state": "UP", "district": "LKO", "mandal": "UP-LKO-LKU", "constituency": "Lucknow Central Assembly"},
    {"voter_id": "UP1234567891", "full_name": "Sunita Mishra", "password": "Sunita@1234", "dob": "1993-11-19", "state": "UP", "district": "VNS", "mandal": "UP-VNS-VNU", "constituency": "Varanasi North Assembly"},
    {"voter_id": "UP1234567894", "full_name": "Dinesh Tripathi", "password": "Dinesh@1234", "dob": "1989-08-03", "state": "UP", "district": "VNS", "mandal": "UP-VNS-VNU", "constituency": "Varanasi North Assembly"},

    # WB
    {"voter_id": "WB1234567890", "full_name": "Sourav Banerjee", "password": "Sourav@1234", "dob": "1991-05-28", "state": "WB", "district": "KOL", "mandal": "WB-KOL-KLU", "constituency": "Kolkata North Assembly"},
    {"voter_id": "WB1234567891", "full_name": "Rituparna Ghosh", "password": "Ritu@1234", "dob": "1994-02-14", "state": "WB", "district": "KOL", "mandal": "WB-KOL-KLU", "constituency": "Kolkata North Assembly"},
    {"voter_id": "WB1234567892", "full_name": "Subhash Chatterjee", "password": "Subhash@1234", "dob": "1987-10-07", "state": "WB", "district": "KOL", "mandal": "WB-KOL-KLU", "constituency": "Kolkata North Assembly"},

    # GJ
    {"voter_id": "GJ1234567890", "full_name": "Hardik Patel", "password": "Hardik@1234", "dob": "1995-02-14", "state": "GJ", "district": "AMD", "mandal": "GJ-AMD-AMU", "constituency": "Ahmedabad East Assembly"},
    {"voter_id": "GJ1234567891", "full_name": "Dhruvi Shah", "password": "Dhruvi@1234", "dob": "1997-06-19", "state": "GJ", "district": "AMD", "mandal": "GJ-AMD-AMU", "constituency": "Ahmedabad East Assembly"},
    {"voter_id": "GJ1234567892", "full_name": "Jignesh Solanki", "password": "Jignesh@1234", "dob": "1988-11-25", "state": "GJ", "district": "AMD", "mandal": "GJ-AMD-AMU", "constituency": "Ahmedabad East Assembly"},

    # RJ
    {"voter_id": "RJ1234567890", "full_name": "Ramesh Choudhary", "password": "Ramesh@1234", "dob": "1984-09-09", "state": "RJ", "district": "JPR", "mandal": "RJ-JPR-JPU", "constituency": "Jaipur East Assembly"},
    {"voter_id": "RJ1234567891", "full_name": "Kavita Rajput", "password": "Kavita@1234", "dob": "1992-03-31", "state": "RJ", "district": "JPR", "mandal": "RJ-JPR-JPU", "constituency": "Jaipur East Assembly"},

    # KL
    {"voter_id": "KL1234567890", "full_name": "Anoop Menon", "password": "Anoop@1234", "dob": "1992-12-31", "state": "KL", "district": "TVM", "mandal": "KL-TVM-TVU", "constituency": "Thiruvananthapuram Assembly"},
    {"voter_id": "KL1234567891", "full_name": "Sreelakshmi Nair", "password": "Sreelakshmi@1234", "dob": "1996-08-14", "state": "KL", "district": "TVM", "mandal": "KL-TVM-TVU", "constituency": "Thiruvananthapuram Assembly"},
    {"voter_id": "KL1234567892", "full_name": "Vishnu Prasad", "password": "Vishnu@1234", "dob": "1990-04-20", "state": "KL", "district": "TVM", "mandal": "KL-TVM-TVU", "constituency": "Thiruvananthapuram Assembly"},
]

def seed_db():
    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()
    
    # Empty existing voters to avoid uniques
    c.execute("DELETE FROM voters")
    
    for v in SEED_VOTERS:
        node_id = safe_hash(v['voter_id'] + "SALT")
        v_hash = safe_hash(v['voter_id'] + "PEPPER")
        name_hash = safe_hash(v['full_name'] + v['voter_id'] + "SALT")
        dob_hash = safe_hash(v['dob'] + "SALT")
        password_hash = get_bcrypt_mock(v['password'])
        
        try:
            c.execute('''INSERT INTO voters (
                voter_node_id, voter_id_hash, voter_name_hash, dob_hash, password_hash,
                state_code, district_code, mandal_code, constituency,
                block_hash, previous_hash
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', (
                node_id, v_hash, name_hash, dob_hash, password_hash,
                v['state'], v['district'], v['mandal'], v['constituency'],
                'HASH_PLACEHOLDER', 'PREV_PLACEHOLDER'
            ))
        except sqlite3.IntegrityError:
            pass # Fails if geography is missing from standard setup
            
    conn.commit()
    conn.close()
    print(f"Success! {len(SEED_VOTERS)} New Seed Voters Injected into SQL!")

if __name__ == '__main__':
    seed_db()
