import time
import threading
from blockchain_engine import load_json, BLOCKCHAIN_DIR
import blockchain_engine
import os
from blockchain_engine import load_json, BLOCKCHAIN_DIR
import os

def check_integrity():
    print("Running chain validation...")
    dupes = blockchain_engine.check_duplicate_voters()
    if dupes:
        print(f"WARNING: BLOCKCHAIN CORRUPTION! FOUND DUPLICATES: {dupes}")
    else:
        print("Blockchain Integrity Checks Pass! No Duplicates Found.")

def start_integrity_loop():
    def loop():
        while True:
            check_integrity()
            time.sleep(30)
    
    t = threading.Thread(target=loop, daemon=True)
    t.start()
