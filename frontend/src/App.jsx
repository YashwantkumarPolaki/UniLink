import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
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
      </Routes>
    </BrowserRouter>
  )
}

export default App