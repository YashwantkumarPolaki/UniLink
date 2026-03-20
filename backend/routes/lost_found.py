from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
from middleware.auth_middleware import get_current_user
from database import db
from datetime import datetime

router = APIRouter(prefix="/lost-found", tags=["Lost & Found"])


class LostFoundCreate(BaseModel):
    title: str
    description: str
    category: str          # "lost" or "found"
    location: str
    contact: str
    image_base64: Optional[str] = None  # base64 encoded image string


@router.post("/")
async def create_post(
    post: LostFoundCreate,
    current_user: dict = Depends(get_current_user)
):
    if post.category not in ("lost", "found"):
        raise HTTPException(status_code=400, detail="category must be 'lost' or 'found'")

    data = {
        **post.dict(),
        "posted_by": current_user["user_id"],
        "posted_by_email": current_user["email"],
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
    }
    doc_ref = db.collection("lost_found").add(data)
    return {"message": "Post created!", "id": doc_ref[1].id}


@router.get("/")
async def get_posts(
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    ref = db.collection("lost_found").order_by("created_at", direction="DESCENDING").get()
    posts = []
    for doc in ref:
        d = doc.to_dict()
        d["id"] = doc.id
        if category and d.get("category") != category:
            continue
        posts.append(d)
    return posts


@router.put("/{post_id}/resolve")
async def resolve_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    doc = db.collection("lost_found").document(post_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Post not found")
    if doc.to_dict()["posted_by"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not your post")
    db.collection("lost_found").document(post_id).update({"status": "resolved"})
    return {"message": "Marked as resolved!"}


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    doc = db.collection("lost_found").document(post_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Post not found")
    data = doc.to_dict()
    if data["posted_by"] != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    db.collection("lost_found").document(post_id).delete()
    return {"message": "Post deleted!"}
