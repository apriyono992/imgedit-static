import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuthStore()

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
