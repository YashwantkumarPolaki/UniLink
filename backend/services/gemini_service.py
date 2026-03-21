import os
import httpx

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")

def ask_ai(prompt: str) -> str:
    if not GEMINI_KEY:
        return "AI is temporarily unavailable."
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}"
    res = httpx.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=30)
    data = res.json()
    if res.status_code != 200:
        return "AI error: " + data.get("error", {}).get("message", "Unknown error")
    return data["candidates"][0]["content"]["parts"][0]["text"]