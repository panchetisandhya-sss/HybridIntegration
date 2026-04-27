from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer
from database import Base
import datetime

class Voter(Base):
    __tablename__ = "voters"

    voter_id = Column(String, primary_key=True, index=True)
    full_name = Column(String)
    date_of_birth = Column(Date)
    state = Column(String)
    constituency = Column(String)
    password_hash = Column(String)
    has_voted = Column(Boolean, default=False)
    registered_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
