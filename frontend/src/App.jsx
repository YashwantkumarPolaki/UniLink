import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Doubts from './pages/Doubts'
import Opportunities from './pages/Opportunities'
import './index.css'
import PostEvent from './pages/PostEvent'
import Admin from './pages/Admin'
import PostOpportunity from './pages/PostOpportunity'
import Settings from './pages/Settings'
import MockInterview from './pages/MockInterview'
import LostFound from './pages/LostFound'
import AIBot from './components/AIBot'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/post" element={<PostEvent />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/doubts" element={<Doubts />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunities/post" element={<PostOpportunity />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/mock-interview" element={<MockInterview />} />
          <Route path="/lost-found" element={<LostFound />} />
        </Routes>
      </BrowserRouter>
      <AIBot />
    </>
  )
}

export default App