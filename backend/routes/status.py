from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Literal
from middleware.auth_middleware import get_current_user
from database import db
from datetime import datetime, timedelta

router = APIRouter(prefix="/status", tags=["Campus Status"])

# Fixed list of campus services
SERVICES = [
    {"id": "university_building", "name": "University Building", "icon": "🏫"},
    {"id": "tech_park1",         "name": "Tech Park 1",         "icon": "🏢"},
    {"id": "tech_park2",         "name": "Tech Park 2",         "icon": "🏗️"},
    {"id": "girls_hostel",       "name": "Girls Hostels",       "icon": "🏠"},
    {"id": "boys_hostel",        "name": "Boys Hostels",        "icon": "🏠"},
    {"id": "wifi",               "name": "Campus Wi-Fi",        "icon": "📶"},
    {"id": "portal",             "name": "College Portal",      "icon": "🌐"},
    {"id": "canteen",            "name": "Canteen",             "icon": "🍽️"},
]


WINDOW_HOURS = 2  # Only count reports from last 2 hours


class StatusReport(BaseModel):
    status: Literal["operational", "degraded", "down"]


def get_aggregated_status(service_id: str, reports: list) -> dict:
    """Aggregate votes → majority wins. Default is operational if no votes."""
    now = datetime.utcnow()
    cutoff = now - timedelta(hours=WINDOW_HOURS)

    recent = [
        r for r in reports
        if r.get("service_id") == service_id
        and datetime.fromisoformat(r["timestamp"]) > cutoff
    ]

    counts = {"operational": 0, "degraded": 0, "down": 0}
    for r in recent:
        s = r.get("status")
        if s in counts:
            counts[s] += 1

    total = sum(counts.values())
    if total == 0:
        return {"status": "operational", "votes": counts, "total_reports": 0}

    winner = max(counts, key=counts.get)
    return {"status": winner, "votes": counts, "total_reports": total}


@router.get("/")
async def get_all_status(current_user: dict = Depends(get_current_user)):
    """Return current status for all campus services."""
    now = datetime.utcnow()
    cutoff = (now - timedelta(hours=WINDOW_HOURS)).isoformat()

    # Fetch recent reports from Firestore
    docs = db.collection("campus_status_reports") \
              .where("timestamp", ">=", cutoff) \
              .get()

    reports = [doc.to_dict() for doc in docs]

    result = []
    for svc in SERVICES:
        agg = get_aggregated_status(svc["id"], reports)
        result.append({
            **svc,
            **agg,
            "last_updated": now.isoformat(),
        })

    # Check if current user voted in the last window
    user_id = current_user["user_id"]
    user_votes = {
        r["service_id"]: r["status"]
        for r in reports
        if r.get("user_id") == user_id
    }

    return {"services": result, "user_votes": user_votes}


@router.post("/{service_id}/report")
async def report_status(
    service_id: str,
    body: StatusReport,
    current_user: dict = Depends(get_current_user)
):
    """Submit a crowd-sourced status report for a service."""
    # Validate service
    if service_id not in [s["id"] for s in SERVICES]:
        raise HTTPException(status_code=404, detail="Unknown service")

    user_id = current_user["user_id"]
    now = datetime.utcnow()
    cutoff = (now - timedelta(hours=WINDOW_HOURS)).isoformat()

    # Check if already voted in current window (filter timestamp in Python, no composite index needed)
    existing_docs = db.collection("campus_status_reports") \
                      .where("service_id", "==", service_id) \
                      .where("user_id", "==", user_id) \
                      .get()

    cutoff_dt = now - timedelta(hours=WINDOW_HOURS)
    recent_vote = [
        d for d in existing_docs
        if datetime.fromisoformat(d.to_dict().get("timestamp", "2000-01-01")) > cutoff_dt
    ]

    if recent_vote:
        # Update existing vote instead of blocking
        recent_vote[0].reference.update({
            "status": body.status,
            "timestamp": now.isoformat(),
        })
        return {"message": "Vote updated!", "status": body.status}

    # Save new report
    db.collection("campus_status_reports").add({
        "service_id": service_id,
        "user_id": user_id,
        "status": body.status,
        "timestamp": now.isoformat(),
        "college": current_user.get("college", ""),
    })

    return {"message": "Status reported!", "status": body.status}
