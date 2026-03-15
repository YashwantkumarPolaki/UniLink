from pydantic import BaseModel
from typing import Optional

# Data needed to ask a doubt
class CreateDoubtRequest(BaseModel):
    title: str
    description: str
    subject: str
    college: str

# Data needed to answer a doubt
class CreateAnswerRequest(BaseModel):
    answer: str

# Data needed to update a doubt
class UpdateDoubtRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None