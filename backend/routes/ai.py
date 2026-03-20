import os
import json
import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Literal, List, Optional
from middleware.auth_middleware import get_current_user
from fastapi import APIRouter
from services.gemini_service import ask_ai

router = APIRouter()

@router.post("/ask")
async def ask(question: dict):
    answer = ask_ai(question["question"])
    return {"answer": answer}

router = APIRouter(prefix="/ai", tags=["AI"])

OPENAI_KEY    = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GEMINI_KEY    = os.getenv("GEMINI_API_KEY", "")


class AskRequest(BaseModel):
    prompt: str
    model: Literal["gpt", "gemini", "claude"] = "claude"


class ConversationMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str


class InterviewRequest(BaseModel):
    company: str
    role: str
    round: str
    difficulty: str
    conversation_history: List[ConversationMessage] = []
    user_answer: str = ""


# ─── MODEL CALLERS ────────────────────────────────────────────────────────────

async def call_openai(prompt: str) -> str:
    if not OPENAI_KEY:
        raise HTTPException(400, "OPENAI_API_KEY not set in .env")
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"},
            json={
                "model": "gpt-4o",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 800,
                "temperature": 0.7,
            }
        )
    data = res.json()
    if res.status_code != 200:
        raise HTTPException(502, data.get("error", {}).get("message", "OpenAI error"))
    return data["choices"][0]["message"]["content"]


async def call_claude(prompt: str, max_tokens: int = 800, system: str = None,
                      messages: list = None) -> str:
    if not ANTHROPIC_KEY:
        raise HTTPException(400, "ANTHROPIC_API_KEY not set in backend .env")
    body = {
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": max_tokens,
        "messages": messages or [{"role": "user", "content": prompt}],
    }
    if system:
        body["system"] = system
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_KEY,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json=body,
        )
    data = res.json()
    if res.status_code != 200:
        raise HTTPException(502, data.get("error", {}).get("message", "Claude error"))
    return data["content"][0]["text"]


async def call_gemini(prompt: str) -> str:
    if not GEMINI_KEY:
        raise HTTPException(400, "GEMINI_API_KEY not set in .env")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}"
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
    data = res.json()
    if res.status_code != 200:
        raise HTTPException(502, data.get("error", {}).get("message", "Gemini error"))
    return data["candidates"][0]["content"]["parts"][0]["text"]


# ─── /ai/ask — general purpose AI call ───────────────────────────────────────

@router.post("/ask")
async def ask_ai(body: AskRequest, current_user: dict = Depends(get_current_user)):
    """Proxy AI calls to backend. Supports claude (default), gpt, gemini."""
    if body.model == "gpt":
        answer = await call_openai(body.prompt)
    elif body.model == "gemini":
        answer = await call_gemini(body.prompt)
    else:
        answer = await call_claude(body.prompt)
    return {"answer": answer, "model": body.model}


# ─── /ai/interview/message — mock interview conversation ──────────────────────

INTERVIEW_SYSTEM = """You are a strict technical interviewer at {company} for the role of {role}.
Round: {round}. Difficulty: {difficulty}.

Rules:
1. Ask ONE question at a time.
2. After the student answers, respond with EXACTLY this format:
   Score: X/10
   Feedback: [1-2 sentence feedback]

   [Next question here]
3. After the student answers the 5th question, output ONLY this JSON (no other text):
{{
  "overall_score": <sum of 5 scores>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area 1", "area 2"],
  "per_question": [
    {{"question": "...", "answer": "...", "score": X, "feedback": "..."}}
  ]
}}
Start by asking the first question immediately."""


@router.post("/interview/message")
async def interview_message(
    body: InterviewRequest,
    current_user: dict = Depends(get_current_user)
):
    system_prompt = INTERVIEW_SYSTEM.format(
        company=body.company,
        role=body.role,
        round=body.round,
        difficulty=body.difficulty,
    )

    # Build message list
    messages = [m.dict() for m in body.conversation_history]

    if not messages:
        # First turn — ask Claude to start
        messages = [{"role": "user", "content": "Start the interview now. Ask question 1."}]
    else:
        # Add student's latest answer
        if body.user_answer.strip():
            messages.append({"role": "user", "content": body.user_answer})

    ai_response = await call_claude(
        prompt="",
        max_tokens=1000,
        system=system_prompt,
        messages=messages,
    )

    # Check if the response is the final JSON report
    is_complete = False
    parsed_report = None
    stripped = ai_response.strip()
    if stripped.startswith("{") and '"overall_score"' in stripped:
        try:
            parsed_report = json.loads(stripped)
            is_complete = True
        except json.JSONDecodeError:
            pass

    # Count how many questions have been asked (assistant turns so far)
    question_count = sum(1 for m in messages if m["role"] == "assistant") + 1

    return {
        "ai_response": ai_response,
        "is_complete": is_complete,
        "parsed_report": parsed_report,
        "question_count": min(question_count, 5),
        "new_message": {"role": "assistant", "content": ai_response},
    }
