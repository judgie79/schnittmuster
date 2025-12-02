import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks'

export const AdminRoute = () => {
  const { state } = useAuth()
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!state.user?.adminRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
