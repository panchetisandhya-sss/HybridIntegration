import csv
import datetime
from database import SessionLocal, engine
import models
from auth import get_password_hash
import random

models.Base.metadata.create_all(bind=engine)

states = ["Maharashtra", "Tamil Nadu", "Karnataka", "Delhi", "Uttar Pradesh", "Gujarat", "Rajasthan"]
names = [
    "Rahul Sharma", "Priya Patel", "Amit Kumar", "Sunita Reddy", "Ravi Verma", 
    "Neha Singh", "Suresh Joshi", "Geeta Rao", "Manoj Tiwari", "Kavita Desai",
    "Arvind Menon", "Pooja Gupta", "Vikram Rathore", "Anjali Iyer", "Sanjay Das",
    "Ritu Chauhan", "Gaurav Malhotra", "Meera Nanda", "Anil Kapoor", "Kiran Bedi"
]

def generate_voters():
    db = SessionLocal()
    voters_data = []
    
    password_hash = get_password_hash("Voter@123")
    
    with open("voters_sample.csv", "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["voter_id", "full_name", "date_of_birth", "state", "constituency"])
        
        for i in range(20):
            # ABC + 7 digits
            voter_id = f"ABC{random.randint(1000000, 9999999)}"
            name = names[i]
            dob = datetime.date(random.randint(1960, 2004), random.randint(1, 12), random.randint(1, 28))
            state = random.choice(states)
            constituency = f"{state} Center"
            
            # Save to DB if not exists
            if not db.query(models.Voter).filter(models.Voter.voter_id == voter_id).first():
                voter = models.Voter(
                    voter_id=voter_id,
                    full_name=name,
                    date_of_birth=dob,
                    state=state,
                    constituency=constituency,
                    password_hash=password_hash
                )
                db.add(voter)
            
            # Write to CSV
            writer.writerow([voter_id, name, dob.isoformat(), state, constituency])
            voters_data.append(voter_id)
            
    db.commit()
    db.close()
    print("Database seeded completely. 20 realistic voters populated.")
    print("Created voters_sample.csv")

if __name__ == "__main__":
    generate_voters()
