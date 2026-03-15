from pydantic import BaseModel
from typing import Optional
from enum import Enum

# Opportunity types
class OpportunityType(str, Enum):
    internship = "internship"
    hackathon = "hackathon"
    competition = "competition"
    research = "research"
    job = "job"
    other = "other"

# Data needed to create an opportunity
class CreateOpportunityRequest(BaseModel):
    title: str
    description: str
    type: OpportunityType
    company: str
    deadline: str              # format: "2026-04-30"
    link: str                  # apply link
    college: str = ""
    recruiter_name: str = ""   # name of the recruiter/HR
    hiring_process: str = ""   # On-Campus / Off-Campus / Both
    stipend: str = ""          # salary or stipend range
    eligibility: str = ""      # eligible branches
    location: str = ""
    duration: str = ""

# Data needed to update an opportunity
class UpdateOpportunityRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    company: Optional[str] = None
    deadline: Optional[str] = None
    link: Optional[str] = None
    recruiter_name: Optional[str] = None
    hiring_process: Optional[str] = None
    stipend: Optional[str] = None
    eligibility: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None