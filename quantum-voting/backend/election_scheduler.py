import datetime
import pytz

IST = pytz.timezone('Asia/Kolkata')

def is_election_active(election_schedule: dict) -> bool:
    now_ist = datetime.datetime.now(IST)
    # Parse block timeframe logic vs now_ist
    # E.g. "08:00:00 IST" checks
    return True
