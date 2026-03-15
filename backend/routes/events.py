from fastapi import APIRouter, HTTPException, Depends, Query
from backend.models.event import EventCreate, EventUpdate
from backend.middleware.auth_middleware import get_current_user, require_role
from backend.database import db
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("/")
async def create_event(event: EventCreate, current_user: dict = Depends(require_role("club"))):
    event_data = {
        **event.dict(),
        "posted_by": current_user["user_id"],
        "posted_by_email": current_user["email"],
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
        "registered_users": []
    }
    doc_ref = db.collection("events").add(event_data)
    return {"message": "Event created! Waiting for admin approval.", "event_id": doc_ref[1].id}

@router.get("/")
async def get_events(
    category: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    events_ref = db.collection("events").where("status", "==", "approved").get()
    events = []
    for doc in events_ref:
        data = doc.to_dict()
        data["id"] = doc.id

        # Filter by category
        if category and data.get("category") != category:
            continue

        # Filter by branch
        if branch:
            eligible = data.get("eligible_branches", [])
            if eligible and branch.lower() not in [b.lower() for b in eligible]:
                continue

        events.append(data)

    return events

@router.get("/recommended")
async def get_recommended_events(current_user: dict = Depends(get_current_user)):
    # Get user profile
    user_doc = db.collection("users").document(current_user["user_id"]).get()
    user_data = user_doc.to_dict()
    user_branch = user_data.get("branch", "").lower().strip()
    user_dept = user_data.get("department", "").lower().strip()

    events_ref = db.collection("events").where("status", "==", "approved").get()
    recommended = []
    others = []

    for doc in events_ref:
        data = doc.to_dict()
        data["id"] = doc.id
        raw_eligible = data.get("eligible_branches", [])
        eligible = [b.lower().strip() for b in raw_eligible]

        if not eligible:
            # Open to all — show in others
            others.append(data)
            continue

        # Check "All Branches" open invitation
        is_open = any("all" in b for b in eligible)

        # Exact branch match
        exact_branch = user_branch in eligible

        # Partial branch match (e.g. user "cse - ai & ml" matches eligible "ai & ml" or "aiml")
        partial_branch = any(
            user_branch in b or b in user_branch
            for b in eligible
        ) if user_branch else False

        # Department/domain keyword match (e.g. user dept "machine learning" in eligible branch text)
        dept_match = any(
            user_dept in b or b in user_dept
            for b in eligible
        ) if user_dept else False

        if is_open or exact_branch or partial_branch or dept_match:
            data["recommended"] = True
            recommended.append(data)
        else:
            others.append(data)

    return {"recommended": recommended, "others": others}

@router.get("/{event_id}")
async def get_event(event_id: str, current_user: dict = Depends(get_current_user)):
    doc = db.collection("events").document(event_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Event not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return data

@router.put("/{event_id}")
async def update_event(event_id: str, event: EventUpdate, current_user: dict = Depends(require_role("club"))):
    doc = db.collection("events").document(event_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Event not found")
    if doc.to_dict()["posted_by"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not your event")
    update_data = {k: v for k, v in event.dict().items() if v is not None}
    db.collection("events").document(event_id).update(update_data)
    return {"message": "Event updated!"}

@router.delete("/{event_id}")
async def delete_event(event_id: str, current_user: dict = Depends(get_current_user)):
    doc = db.collection("events").document(event_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Event not found")
    if doc.to_dict()["posted_by"] != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    db.collection("events").document(event_id).delete()
    return {"message": "Event deleted!"}

@router.put("/{event_id}/approve")
async def approve_event(event_id: str, current_user: dict = Depends(require_role("admin"))):
    doc = db.collection("events").document(event_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Event not found")
    db.collection("events").document(event_id).update({"status": "approved"})
    return {"message": "Event approved!"}

@router.post("/{event_id}/register")
async def register_for_event(event_id: str, current_user: dict = Depends(get_current_user)):
    doc = db.collection("events").document(event_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Event not found")
    data = doc.to_dict()
    registered = data.get("registered_users", [])
    if current_user["user_id"] in registered:
        raise HTTPException(status_code=400, detail="Already registered!")
    registered.append(current_user["user_id"])
    db.collection("events").document(event_id).update({"registered_users": registered})
    return {"message": "Registered successfully!", "registration_link": data.get("registration_link", "")}
