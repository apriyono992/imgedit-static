import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function AdminRoute() {
  const user = useAuthStore((s) => s.user)

  if (user?.roleId !== 2) {
    return <Navigate to="/app/editor" replace />
  }

  return <Outlet />
}
