import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
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
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
