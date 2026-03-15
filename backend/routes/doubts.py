from fastapi import APIRouter, HTTPException, Depends
from backend.models.doubt import CreateDoubtRequest, CreateAnswerRequest, UpdateDoubtRequest
from backend.middleware.auth_middleware import get_current_user
from backend.database import db

# All routes here start with /doubts
router = APIRouter(prefix="/doubts", tags=["Doubts"])

# ASK A DOUBT - any logged in student can ask
@router.post("/")
async def create_doubt(
    doubt: CreateDoubtRequest,
    current_user: dict = Depends(get_current_user)
):
    # Prepare doubt data
    doubt_data = {
        "title": doubt.title,
        "description": doubt.description,
        "subject": doubt.subject,
        "college": doubt.college,
        "asked_by": current_user["user_id"],
        "asked_by_email": current_user["email"],
        "answers": [],           # empty list initially
        "is_resolved": False,    # not resolved yet
    }

    # Save to Firestore
    doc_ref = db.collection("doubts").add(doubt_data)

    return {
        "message": "Doubt posted successfully!",
        "doubt_id": doc_ref[1].id
    }

# GET ALL DOUBTS - any logged in user can view
@router.get("/")
async def get_doubts(current_user: dict = Depends(get_current_user)):
    # Get all doubts from Firestore
    doubts = db.collection("doubts").get()

    doubt_list = []
    for doubt in doubts:
        doubt_data = doubt.to_dict()
        doubt_data["id"] = doubt.id
        doubt_list.append(doubt_data)

    return {
        "total": len(doubt_list),
        "doubts": doubt_list
    }

# GET SINGLE DOUBT - any logged in user can view
@router.get("/{doubt_id}")
async def get_doubt(
    doubt_id: str,
    current_user: dict = Depends(get_current_user)
):
    doubt_doc = db.collection("doubts").document(doubt_id).get()

    if not doubt_doc.exists:
        raise HTTPException(status_code=404, detail="Doubt not found")

    doubt_data = doubt_doc.to_dict()
    doubt_data["id"] = doubt_doc.id

    return doubt_data

# ANSWER A DOUBT - any logged in user can answer
@router.post("/{doubt_id}/answers")
async def answer_doubt(
    doubt_id: str,
    answer: CreateAnswerRequest,
    current_user: dict = Depends(get_current_user)
):
    # Find the doubt
    doubt_doc = db.collection("doubts").document(doubt_id).get()

    if not doubt_doc.exists:
        raise HTTPException(status_code=404, detail="Doubt not found")

    # Prepare answer data
    answer_data = {
        "answer": answer.answer,
        "answered_by": current_user["user_id"],
        "answered_by_email": current_user["email"],
    }

    # Add answer to the answers array in Firestore
    doubt_data = doubt_doc.to_dict()
    answers = doubt_data.get("answers", [])
    answers.append(answer_data)

    # Update the doubt with new answer
    db.collection("doubts").document(doubt_id).update({"answers": answers})

    return {"message": "Answer posted successfully!"}

# MARK AS RESOLVED - only the person who asked can resolve
@router.put("/{doubt_id}/resolve")
async def resolve_doubt(
    doubt_id: str,
    current_user: dict = Depends(get_current_user)
):
    doubt_doc = db.collection("doubts").document(doubt_id).get()

    if not doubt_doc.exists:
        raise HTTPException(status_code=404, detail="Doubt not found")

    # Check if this user asked the doubt
    doubt_data = doubt_doc.to_dict()
    if doubt_data["asked_by"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Only the person who asked can resolve this doubt")

    # Mark as resolved
    db.collection("doubts").document(doubt_id).update({"is_resolved": True})

    return {"message": "Doubt marked as resolved!"}

# DELETE DOUBT - only the person who asked can delete
@router.delete("/{doubt_id}")
async def delete_doubt(
    doubt_id: str,
    current_user: dict = Depends(get_current_user)
):
    doubt_doc = db.collection("doubts").document(doubt_id).get()

    if not doubt_doc.exists:
        raise HTTPException(status_code=404, detail="Doubt not found")

    # Check ownership
    doubt_data = doubt_doc.to_dict()
    if doubt_data["asked_by"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own doubts")

    db.collection("doubts").document(doubt_id).delete()

    return {"message": "Doubt deleted successfully!"}
