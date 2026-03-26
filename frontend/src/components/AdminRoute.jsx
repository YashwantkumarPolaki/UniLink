import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />

  return children
}
