import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks'

export const AdminRoute = () => {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user?.adminRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
