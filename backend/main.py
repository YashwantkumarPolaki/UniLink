from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import db
from backend.routes import auth, events, doubts, opportunities, ai

# Create FastAPI app
app = FastAPI(
    title="UniLink API",
    description="Centralized platform for college students",
    version="1.0.0"
)

# Allow frontend to call our backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(doubts.router)
app.include_router(opportunities.router)
app.include_router(ai.router)

# Root route
@app.get("/")
async def root():
    return {"message": "Welcome to UniLink API"}