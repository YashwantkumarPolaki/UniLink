import axios from 'axios'

// Base URL of our FastAPI backend
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 60000
})

// Automatically add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API
export async function askAI(question) {
  try {
    const res = await API.post('/ai/ask', { prompt: question, model: 'gemini' })
    return res.data.answer
  } catch (err) {
    throw new Error(err.response?.data?.detail || err.message || 'AI request failed')
  }
}