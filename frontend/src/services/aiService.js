export async function askAI(prompt, systemPrompt = "") {
  const key = import.meta.env.VITE_GEMINI_KEY
  if (!key) throw new Error('AI is temporarily unavailable. Please try again later.')

  const fullPrompt = systemPrompt
    ? `${systemPrompt}\n\n${prompt}`
    : prompt;

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30000)

  const models = ["gemini-flash-latest", "gemini-3.6-flash", "gemini-3.5-flash"]

  try {
    for (const model of models) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
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
      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      if (data.error) {
        console.warn(`Gemini ${model} failed:`, data.error.message);
        continue;
      }
    }
    
    // Fallback to Groq if all Gemini models fail or face high demand
    const { askGroq } = await import('./groqService.js');
    return await askGroq(prompt, systemPrompt);
    
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('AI timed out (30s). Please try again.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}
