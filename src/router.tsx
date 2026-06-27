import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { AdminRoute } from '@/components/common/AdminRoute'

// Layouts & guards stay in main bundle (small, always needed)
// All page components are lazy-loaded for code splitting

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: () =>
      import('@/modules/landing/LandingPage').then((m) => ({ Component: m.LandingPage })),
  },

  // Auth pages
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        lazy: () =>
          import('@/modules/auth/LoginPage').then((m) => ({ Component: m.LoginPage })),
      },
      {
        path: '/register',
        lazy: () =>
          import('@/modules/auth/RegisterPage').then((m) => ({ Component: m.RegisterPage })),
      },
    ],
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      // User area
      {
        path: '/app',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/app/editor" replace /> },
          {
            path: 'editor',
            lazy: () =>
              import('@/modules/editor/pages/EditorPage').then((m) => ({
                Component: m.EditorPage,
              })),
          },
          {
            path: 'logs',
            lazy: () =>
              import('@/modules/editor/pages/MyLogsPage').then((m) => ({
                Component: m.MyLogsPage,
              })),
          },
        ],
      },

      // Admin area
      {
        element: <AdminRoute />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="/admin/dashboard" replace /> },
              {
                path: 'dashboard',
                lazy: () =>
                  import('@/modules/admin/pages/DashboardPage').then((m) => ({
                    Component: m.DashboardPage,
                  })),
              },
              {
                path: 'users',
                lazy: () =>
                  import('@/modules/admin/pages/UsersPage').then((m) => ({
                    Component: m.UsersPage,
                  })),
              },
              {
                path: 'logs',
                lazy: () =>
                  import('@/modules/admin/pages/ActivityLogsPage').then((m) => ({
                    Component: m.ActivityLogsPage,
                  })),
              },
              {
                path: 'audit',
                lazy: () =>
                  import('@/modules/admin/pages/AuditLogPage').then((m) => ({
                    Component: m.AuditLogPage,
                  })),
              },
            ],
          },
        ],
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
