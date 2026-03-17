from fastapi import APIRouter, HTTPException, Depends
from models.opportunity import CreateOpportunityRequest, UpdateOpportunityRequest
from middleware.auth_middleware import get_current_user, require_role
from database import db

# All routes here start with /opportunities
router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

# POST OPPORTUNITY - admin or company/recruiter can post
@router.post("/")
async def create_opportunity(
    opportunity: CreateOpportunityRequest,
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") not in ("admin", "company"):
        raise HTTPException(status_code=403, detail="Only admins or company recruiters can post opportunities")

    # Prepare opportunity data
    opportunity_data = {
        "title": opportunity.title,
        "description": opportunity.description,
        "type": opportunity.type,
        "company": opportunity.company,
        "deadline": opportunity.deadline,
        "link": opportunity.link,
        "college": opportunity.college,
        "recruiter_name": opportunity.recruiter_name,
        "hiring_process": opportunity.hiring_process,
        "stipend": opportunity.stipend,
        "eligibility": opportunity.eligibility,
        "location": opportunity.location,
        "duration": opportunity.duration,
        "posted_by": current_user["user_id"],
        "posted_by_email": current_user["email"],
    }

    # Save to Firestore
    doc_ref = db.collection("opportunities").add(opportunity_data)

    return {
        "message": "Opportunity posted successfully!",
        "opportunity_id": doc_ref[1].id
    }

# GET ALL OPPORTUNITIES - any logged in user can view
@router.get("/")
async def get_opportunities(current_user: dict = Depends(get_current_user)):
    opportunities = db.collection("opportunities").get()

    opportunity_list = []
    for opportunity in opportunities:
        opportunity_data = opportunity.to_dict()
        opportunity_data["id"] = opportunity.id
        opportunity_list.append(opportunity_data)

    return {
        "total": len(opportunity_list),
        "opportunities": opportunity_list
    }

# GET BY TYPE - filter by internship, hackathon etc
@router.get("/type/{opportunity_type}")
async def get_opportunities_by_type(
    opportunity_type: str,
    current_user: dict = Depends(get_current_user)
):
    opportunities = db.collection("opportunities").where("type", "==", opportunity_type).get()

    opportunity_list = []
    for opportunity in opportunities:
        opportunity_data = opportunity.to_dict()
        opportunity_data["id"] = opportunity.id
        opportunity_list.append(opportunity_data)

    return {
        "type": opportunity_type,
        "total": len(opportunity_list),
        "opportunities": opportunity_list
    }

# GET SINGLE OPPORTUNITY
@router.get("/{opportunity_id}")
async def get_opportunity(
    opportunity_id: str,
    current_user: dict = Depends(get_current_user)
):
    opportunity_doc = db.collection("opportunities").document(opportunity_id).get()

    if not opportunity_doc.exists:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    opportunity_data = opportunity_doc.to_dict()
    opportunity_data["id"] = opportunity_doc.id

    return opportunity_data

# UPDATE OPPORTUNITY - only admin can update
@router.put("/{opportunity_id}")
async def update_opportunity(
    opportunity_id: str,
    opportunity: UpdateOpportunityRequest,
    current_user: dict = Depends(require_role("admin"))
):
    opportunity_doc = db.collection("opportunities").document(opportunity_id).get()

    if not opportunity_doc.exists:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Only update fields that were provided
    update_data = {k: v for k, v in opportunity.dict().items() if v is not None}

    db.collection("opportunities").document(opportunity_id).update(update_data)

    return {"message": "Opportunity updated successfully!"}

# DELETE OPPORTUNITY - only admin can delete
@router.delete("/{opportunity_id}")
async def delete_opportunity(
    opportunity_id: str,
    current_user: dict = Depends(require_role("admin"))
):
    opportunity_doc = db.collection("opportunities").document(opportunity_id).get()

    if not opportunity_doc.exists:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    db.collection("opportunities").document(opportunity_id).delete()

    return {"message": "Opportunity deleted successfully!"}