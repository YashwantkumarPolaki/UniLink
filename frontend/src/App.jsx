import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import './index.css'

import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Doubts from './pages/Doubts'
import Opportunities from './pages/Opportunities'
import PostEvent from './pages/PostEvent'
import Admin from './pages/Admin'
import PostOpportunity from './pages/PostOpportunity'
import Settings from './pages/Settings'
import MockInterview from './pages/MockInterview'
import LostFound from './pages/LostFound'
import JoinCommunity from './pages/JoinCommunity'
import AIBot from './components/AIBot'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    // Wake up Render backend on app load so login is fast
    fetch((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/').catch(() => {})
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no auth guard */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/join-community" element={<JoinCommunity />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/events/post" element={<ProtectedRoute><PostEvent /></ProtectedRoute>} />
        <Route path="/doubts" element={<ProtectedRoute><Doubts /></ProtectedRoute>} />
        <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
        <Route path="/opportunities/post" element={<ProtectedRoute><PostOpportunity /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
        <Route path="/lost-found" element={<ProtectedRoute><LostFound /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
      <AIBot />
    </BrowserRouter>
  )
}

export default App
