import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!user.whatsapp_verified) {
    return <Navigate to="/join-community" replace />
  }

  return children
}
