import { Link, Outlet } from 'react-router-dom'
import { ImageIcon, Home } from 'lucide-react'

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          <ImageIcon className="text-indigo-500" size={22} />
          <span className="font-bold text-gray-100 text-lg">Imegedit</span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
        >
          <Home size={14} />
          Beranda
        </Link>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
