import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks'

export const PrivateRoute = () => {
  const { state } = useAuth()
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
