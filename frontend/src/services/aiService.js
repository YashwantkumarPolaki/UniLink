export async function askAI(prompt, systemPrompt = "") {
  const key = import.meta.env.VITE_GEMINI_KEY
  if (!key) throw new Error('AI is temporarily unavailable. Please try again later.')

  const fullPrompt = systemPrompt
    ? `${systemPrompt}\n\n${prompt}`
    : prompt;

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      }
    )
    const data = await response.json()
    if (data.error) throw new Error(data.error.message)
    return data.candidates[0].content.parts[0].text
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('AI timed out (30s). Please try again.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}
