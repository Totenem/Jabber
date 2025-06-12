from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class InstructorRegister(BaseModel):
    name: str
    username: str
    password: str
    email: str

class InstructorLogin(BaseModel):
    username: str
    password: str

class CreateBooking(BaseModel):
    classroom_id: int
    course_id: Optional[int] = None
    purpose: Optional[str] = None
    start_time: datetime
    end_time: datetime

class UsageLog(BaseModel):
    classroom_id: int
    date: date
    total_hours_used: float