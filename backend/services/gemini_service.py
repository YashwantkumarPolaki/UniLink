import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")

model = genai.GenerativeModel("gemini-1.5-flash")

def ask_ai(prompt):
    response = model.generate_content(prompt)
    return response.text