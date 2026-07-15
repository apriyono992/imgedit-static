import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

// Layout stays in main bundle (small, always needed)
// All page components are lazy-loaded for code splitting

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: () =>
      import('@/modules/landing/LandingPage').then((m) => ({ Component: m.LandingPage })),
  },
  {
    path: '/editor',
    element: <AppLayout />,
    children: [
      {
        index: true,
        lazy: () =>
          import('@/modules/editor/pages/EditorPage').then((m) => ({ Component: m.EditorPage })),
      },
    ],
  },

  // 404
  {
    path: '*',
    lazy: () =>
      import('@/modules/common/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })),
  },
])
