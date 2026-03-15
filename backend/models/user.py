from pydantic import BaseModel, EmailStr
from enum import Enum

class UserRole(str, Enum):
    student = "student"
    club = "club"
    admin = "admin"
    faculty = "faculty"
    company = "company"

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.student
    college: str
    # Student fields
    branch: str = ""
    department: str = ""
    # Faculty fields
    faculty_department: str = ""
    # Club fields
    club_name: str = ""
    # Company/Recruiter fields
    company_name: str = ""
    recruiter_name: str = ""
    hiring_process: str = ""
    salary_range: str = ""

class LoginRequest(BaseModel):
    email: EmailStr
    password: str