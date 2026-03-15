const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`

export async function askGemini(prompt, history = []) {
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] },
  ]

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
      }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'Gemini API error')
    return data.candidates[0].content.parts[0].text
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('AI timed out (30s). Please try again.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}
