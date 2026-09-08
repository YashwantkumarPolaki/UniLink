import os
import httpx

def ask_ai(prompt: str) -> str:
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_key:
        return "AI is temporarily unavailable."
    
    models = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-3.5-flash"]
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
        res = httpx.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=30)
        data = res.json()
        if res.status_code == 200:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        if data.get("error", {}).get("code") != 404:
            return "AI error: " + data.get("error", {}).get("message", "Unknown error")
    return "AI error: No available Gemini model endpoint found."