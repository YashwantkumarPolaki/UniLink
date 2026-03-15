import axios from 'axios'

// Base URL of our FastAPI backend
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000'
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