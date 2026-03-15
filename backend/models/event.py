from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class EventCategory(str, Enum):
    workshop = "workshop"
    hackathon = "hackathon"
    fest = "fest"
    seminar = "seminar"
    cultural = "cultural"
    other = "other"

class EventCreate(BaseModel):
    title: str
    description: str
    category: EventCategory
    date: str
    time: str
    venue: str
    college: str
    price: str = "Free"
    registration_link: str = ""
    eligible_branches: List[str] = []
    team_size: str = "Individual"
    prizes: str = ""
    last_date_to_register: str = ""

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    venue: Optional[str] = None
    price: Optional[str] = None
    registration_link: Optional[str] = None
    eligible_branches: Optional[List[str]] = None
    team_size: Optional[str] = None
    prizes: Optional[str] = None
    last_date_to_register: Optional[str] = None
    status: Optional[str] = None