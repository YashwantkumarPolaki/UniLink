export async function askGroq(prompt, systemPrompt = '', history = []) {
  const key = import.meta.env.VITE_GROQ_KEY
  if (!key) throw new Error('VITE_GROQ_KEY is missing in frontend/.env')

  const messages = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push(...history)
  if (prompt) messages.push({ role: 'user', content: prompt })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })
    const data = await response.json()
    if (data.error) throw new Error(data.error.message)
    return data.choices[0].message.content
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('AI timed out (30s). Please try again.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}
