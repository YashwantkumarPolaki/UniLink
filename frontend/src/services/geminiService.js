export async function askGemini(prompt, history = []) {
  const key = import.meta.env.VITE_GEMINI_KEY
  if (!key) throw new Error('VITE_GEMINI_KEY is missing in frontend/.env — restart Vite after adding it.')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`

  const contents = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] },
  ]

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(url, {
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
