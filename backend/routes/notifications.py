import os
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Any, Dict
from middleware.auth_middleware import get_current_user, require_role
from database import db

router = APIRouter(prefix="/notifications", tags=["Notifications"])

VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "")
VAPID_CLAIMS_EMAIL = os.getenv("VAPID_CLAIMS_EMAIL", "mailto:admin@unilink.com")


class PushSubscription(BaseModel):
    endpoint: str
    keys: Dict[str, str]   # { auth, p256dh }


class SendNotificationRequest(BaseModel):
    title: str
    body: str
    url: str = "/"
    user_id: str = ""   # empty = send to all


# ─── Save subscription ─────────────────────────────────────
@router.post("/subscribe")
async def subscribe(
    subscription: PushSubscription,
    current_user: dict = Depends(get_current_user)
):
    db.collection("push_subscriptions").document(current_user["user_id"]).set({
        "user_id": current_user["user_id"],
        "endpoint": subscription.endpoint,
        "keys": subscription.keys,
    })
    return {"message": "Subscribed to push notifications!"}


# ─── Unsubscribe ────────────────────────────────────────────
@router.delete("/unsubscribe")
async def unsubscribe(current_user: dict = Depends(get_current_user)):
    db.collection("push_subscriptions").document(current_user["user_id"]).delete()
    return {"message": "Unsubscribed."}


# ─── Send push (admin-only trigger) ────────────────────────
@router.post("/send")
async def send_notification(
    body: SendNotificationRequest,
    current_user: dict = Depends(require_role("admin"))
):
    if not VAPID_PRIVATE_KEY:
        raise HTTPException(400, "VAPID keys not configured in .env")
    count = await _broadcast(body.title, body.body, body.url, body.user_id or None)
    return {"message": f"Sent to {count} subscriber(s)"}


# ─── Internal helper called from other routes ───────────────
async def send_push_to_user(user_id: str, title: str, body_text: str, url: str = "/"):
    """Call this from doubts.py, events.py etc. to send a targeted push."""
    if not VAPID_PRIVATE_KEY:
        return
    await _broadcast(title, body_text, url, user_id)


async def _broadcast(title: str, body_text: str, url: str, user_id = None):
    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        return 0

    if user_id:
        subs_ref = [db.collection("push_subscriptions").document(user_id).get()]
    else:
        subs_ref = db.collection("push_subscriptions").get()

    count = 0
    for doc in subs_ref:
        if not doc.exists:
            continue
        sub = doc.to_dict()
        try:
            webpush(
                subscription_info={
                    "endpoint": sub["endpoint"],
                    "keys": sub["keys"],
                },
                data=json.dumps({"title": title, "body": body_text, "url": url}),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": VAPID_CLAIMS_EMAIL},
            )
            count += 1
        except Exception:
            pass
    return count
