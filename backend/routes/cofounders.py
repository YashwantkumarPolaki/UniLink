from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from middleware.auth_middleware import get_current_user
from database import db
from datetime import datetime

router = APIRouter(prefix="/cofounders", tags=["Co-Founder Finder"])


class IdeaCreate(BaseModel):
    title: str
    description: str
    domain: str                    # e.g. "EdTech", "FinTech", "HealthTech"
    skills_needed: List[str]       # e.g. ["React", "ML", "UI/UX"]
    team_size: Optional[int] = 2   # how many co-founders needed


class InterestCreate(BaseModel):
    message: str                   # short pitch from interested student


@router.get("/")
async def list_ideas(current_user: dict = Depends(get_current_user)):
    """List all co-founder ideas, newest first."""
    docs = db.collection("cofounder_ideas") \
              .order_by("created_at", direction="DESCENDING") \
              .get()

    ideas = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id

        # Count interests
        interests = db.collection("cofounder_interests") \
                      .where("idea_id", "==", doc.id) \
                      .get()
        d["interest_count"] = len(interests)

        ideas.append(d)

    return {"ideas": ideas, "total": len(ideas)}


@router.post("/")
async def post_idea(
    idea: IdeaCreate,
    current_user: dict = Depends(get_current_user)
):
    """Post a new startup idea. Students only."""
    data = {
        **idea.dict(),
        "posted_by": current_user["user_id"],
        "posted_by_name": current_user.get("name", "Anonymous"),
        "posted_by_email": current_user["email"],
        "college": current_user.get("college", ""),
        "branch": current_user.get("branch", ""),
        "status": "open",          # open | closed
        "created_at": datetime.utcnow().isoformat(),
    }
    ref = db.collection("cofounder_ideas").add(data)
    return {"message": "Idea posted!", "id": ref[1].id}


@router.post("/{idea_id}/interest")
async def express_interest(
    idea_id: str,
    body: InterestCreate,
    current_user: dict = Depends(get_current_user)
):
    """Express interest in someone's co-founder idea."""
    idea_doc = db.collection("cofounder_ideas").document(idea_id).get()
    if not idea_doc.exists:
        raise HTTPException(status_code=404, detail="Idea not found")

    user_id = current_user["user_id"]

    # Can't express interest in your own idea
    if idea_doc.to_dict().get("posted_by") == user_id:
        raise HTTPException(status_code=400, detail="Cannot express interest in your own idea")

    # Check duplicate interest
    existing = db.collection("cofounder_interests") \
                  .where("idea_id", "==", idea_id) \
                  .where("user_id", "==", user_id) \
                  .get()
    if len(existing) > 0:
        raise HTTPException(status_code=400, detail="Already expressed interest")

    db.collection("cofounder_interests").add({
        "idea_id": idea_id,
        "user_id": user_id,
        "name": current_user.get("name", "Anonymous"),
        "email": current_user["email"],
        "branch": current_user.get("branch", ""),
        "message": body.message,
        "created_at": datetime.utcnow().isoformat(),
    })

    return {"message": "Interest expressed!"}


@router.get("/{idea_id}/interests")
async def get_interests(
    idea_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all interested students — only the idea poster can view this."""
    idea_doc = db.collection("cofounder_ideas").document(idea_id).get()
    if not idea_doc.exists:
        raise HTTPException(status_code=404, detail="Idea not found")

    idea = idea_doc.to_dict()
    if idea.get("posted_by") != current_user["user_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only the idea poster can view interests")

    docs = db.collection("cofounder_interests") \
              .where("idea_id", "==", idea_id) \
              .get()

    return {"interests": [{"id": d.id, **d.to_dict()} for d in docs]}


@router.delete("/{idea_id}")
async def delete_idea(
    idea_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete your own idea."""
    idea_doc = db.collection("cofounder_ideas").document(idea_id).get()
    if not idea_doc.exists:
        raise HTTPException(status_code=404, detail="Idea not found")

    idea = idea_doc.to_dict()
    if idea.get("posted_by") != current_user["user_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    db.collection("cofounder_ideas").document(idea_id).delete()
    return {"message": "Idea deleted!"}
