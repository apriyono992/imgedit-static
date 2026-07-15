import { Link, Outlet } from 'react-router-dom'
import { ImageIcon, Home } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-300 dark:border-gray-800 shadow-sm dark:shadow-none">
        <Link to="/" className="flex items-center gap-2">
          <ImageIcon className="text-indigo-500" size={22} />
          <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">Imegedit</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Home size={14} />
            Beranda
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
