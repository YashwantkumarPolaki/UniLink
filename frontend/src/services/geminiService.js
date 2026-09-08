export async function askGemini(prompt, history = []) {
  const key = import.meta.env.VITE_GEMINI_KEY
  if (!key) throw new Error('VITE_GEMINI_KEY is missing in frontend/.env — restart Vite after adding it.')

  const contents = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] },
  ]

  const models = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-3.5-flash"]
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30000)

  try {
    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
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
      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text
      }
      if (data.error || !response.ok) {
        console.warn(`Gemini ${model} failed:`, data.error?.message || response.statusText);
        continue;
      }
    }
    
    // Fallback to Groq if all Gemini models fail or face high demand
    const { askGroq } = await import('./groqService.js');
    return await askGroq(prompt, '', history);
    
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('AI timed out (30s). Please try again.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}
