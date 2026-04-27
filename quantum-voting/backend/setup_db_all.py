import sqlite3
import hashlib
from datetime import datetime
import os

DATABASE_NAME = 'quantum_voting.db'

def sha256(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def init_db():
    if os.path.exists(DATABASE_NAME):
        pass # Allow overwrite for testing
    
    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()

    # Table 1
    c.execute('''
    CREATE TABLE IF NOT EXISTS geography_states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        state_code TEXT UNIQUE NOT NULL,
        state_name TEXT NOT NULL,
        state_name_hash TEXT NOT NULL,
        total_districts INTEGER DEFAULT 0,
        total_mandals INTEGER DEFAULT 0,
        total_voters INTEGER DEFAULT 0,
        block_hash TEXT NOT NULL,
        previous_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Table 2
    c.execute('''
    CREATE TABLE IF NOT EXISTS geography_districts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        district_code TEXT UNIQUE NOT NULL,
        district_name TEXT NOT NULL,
        district_name_hash TEXT NOT NULL,
        state_code TEXT NOT NULL,
        total_mandals INTEGER DEFAULT 0,
        total_voters INTEGER DEFAULT 0,
        block_hash TEXT NOT NULL,
        previous_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (state_code) REFERENCES geography_states(state_code)
    )''')

    # Table 3
    c.execute('''
    CREATE TABLE IF NOT EXISTS geography_mandals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mandal_code TEXT UNIQUE NOT NULL,
        mandal_name TEXT NOT NULL,
        mandal_name_hash TEXT NOT NULL,
        district_code TEXT NOT NULL,
        state_code TEXT NOT NULL,
        total_voters INTEGER DEFAULT 0,
        votes_cast INTEGER DEFAULT 0,
        merkle_root TEXT DEFAULT NULL,
        block_hash TEXT NOT NULL,
        previous_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (district_code) REFERENCES geography_districts(district_code),
        FOREIGN KEY (state_code) REFERENCES geography_states(state_code)
    )''')

    # Table 4
    c.execute('''
    CREATE TABLE IF NOT EXISTS elections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        election_id TEXT UNIQUE NOT NULL,
        state_code TEXT NOT NULL,
        election_type TEXT NOT NULL,
        status TEXT DEFAULT 'SCHEDULED',
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        result_datetime DATETIME,
        timezone TEXT DEFAULT 'Asia/Kolkata',
        total_registered INTEGER DEFAULT 0,
        total_votes_cast INTEGER DEFAULT 0,
        block_hash TEXT NOT NULL,
        previous_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (state_code) REFERENCES geography_states(state_code)
    )''')

    # Table 5
    c.execute('''
    CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id_hash TEXT UNIQUE NOT NULL,
        candidate_name_hash TEXT NOT NULL,
        party_hash TEXT NOT NULL,
        display_name TEXT NOT NULL,
        party_name TEXT NOT NULL,
        constituency TEXT NOT NULL,
        mandal_code TEXT NOT NULL,
        election_id TEXT NOT NULL,
        vote_count INTEGER DEFAULT 0,
        FOREIGN KEY (election_id) REFERENCES elections(election_id),
        FOREIGN KEY (mandal_code) REFERENCES geography_mandals(mandal_code)
    )''')

    # Table 6
    c.execute('''
    CREATE TABLE IF NOT EXISTS voters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voter_node_id TEXT UNIQUE NOT NULL,
        voter_id_hash TEXT UNIQUE NOT NULL,
        voter_name_hash TEXT NOT NULL,
        dob_hash TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        state_code TEXT NOT NULL,
        district_code TEXT NOT NULL,
        mandal_code TEXT NOT NULL,
        constituency TEXT NOT NULL,
        has_voted BOOLEAN DEFAULT FALSE,
        account_status TEXT DEFAULT 'ACTIVE',
        failed_attempts INTEGER DEFAULT 0,
        locked_until DATETIME DEFAULT NULL,
        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT NULL,
        block_hash TEXT NOT NULL,
        previous_hash TEXT NOT NULL,
        FOREIGN KEY (state_code) REFERENCES geography_states(state_code),
        FOREIGN KEY (district_code) REFERENCES geography_districts(district_code),
        FOREIGN KEY (mandal_code) REFERENCES geography_mandals(mandal_code)
    )''')

    # Table 7
    c.execute('''
    CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vote_id TEXT UNIQUE NOT NULL,
        voter_node_id TEXT NOT NULL,
        election_id TEXT NOT NULL,
        mandal_code TEXT NOT NULL,
        district_code TEXT NOT NULL,
        state_code TEXT NOT NULL,
        encrypted_vote TEXT NOT NULL,
        vote_receipt_hash TEXT NOT NULL,
        candidate_id_hash TEXT NOT NULL,
        qber_value FLOAT NOT NULL,
        s_value FLOAT NOT NULL,
        photon_count INTEGER NOT NULL,
        basis_match_rate FLOAT NOT NULL,
        channel_status TEXT NOT NULL,
        quantum_circuit TEXT NOT NULL,
        voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        block_hash TEXT NOT NULL,
        previous_hash TEXT NOT NULL,
        FOREIGN KEY (voter_node_id) REFERENCES voters(voter_node_id),
        FOREIGN KEY (election_id) REFERENCES elections(election_id),
        FOREIGN KEY (mandal_code) REFERENCES geography_mandals(mandal_code)
    )''')

    # Table 8
    c.execute('''
    CREATE TABLE IF NOT EXISTS blockchain_blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        block_id TEXT UNIQUE NOT NULL,
        block_type TEXT NOT NULL,
        reference_code TEXT NOT NULL,
        block_data_hash TEXT NOT NULL,
        merkle_root TEXT DEFAULT NULL,
        previous_hash TEXT NOT NULL,
        current_hash TEXT NOT NULL,
        is_valid BOOLEAN DEFAULT TRUE,
        tamper_detected BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        verified_at DATETIME DEFAULT NULL
    )''')

    # Table 9
    c.execute('''
    CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        state_code TEXT,
        district_code TEXT,
        mandal_code TEXT,
        voter_hash TEXT,
        election_id TEXT,
        qber_value FLOAT,
        s_value FLOAT,
        status TEXT,
        message TEXT,
        ip_address_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Table 10
    c.execute('''
    CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        failed_attempts INTEGER DEFAULT 0,
        locked_until DATETIME DEFAULT NULL,
        last_login DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Seeding placeholder admin dynamically
    try:
        c.execute("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)", 
                  ('admin', 'Admin@Quantum2026'))
    except sqlite3.IntegrityError:
        pass # Already seeded
        
    conn.commit()
    conn.close()
    print("Database Quantum Voting SQLite successfully migrated & locked down.")

if __name__ == '__main__':
    init_db()
