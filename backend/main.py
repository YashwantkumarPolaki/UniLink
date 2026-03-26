import sys
import os
import traceback

# Ensure the backend directory itself is on sys.path so plain imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("[MAIN] Starting imports...", flush=True)
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    print("[MAIN] FastAPI imported OK", flush=True)
    from database import db
    print("[MAIN] database imported OK", flush=True)
    from routes import auth, events, doubts, opportunities, ai, lost_found, notifications, admin
    print("[MAIN] All routes imported OK", flush=True)
except Exception as _e:
    traceback.print_exc()
    print(f"[MAIN] FATAL import error: {_e}", flush=True)
    sys.exit(1)

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
app.include_router(lost_found.router)
app.include_router(notifications.router)
app.include_router(admin.router)

# Root route
@app.get("/")
async def root():
    return {"message": "Welcome to UniLink API"}