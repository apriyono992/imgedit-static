import { useEffect, Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { router } from '@/router'
import { Spinner } from '@/components/ui/Spinner'

function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <Spinner size="lg" />
    </div>
  )
}

export function App() {
  const { isInitializing, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isInitializing) {
    return <FullPageSpinner />
  }

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
