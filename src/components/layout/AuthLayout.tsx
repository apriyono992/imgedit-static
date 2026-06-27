import { Outlet, Link } from 'react-router-dom'
import { ImageIcon } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <ImageIcon
              className="text-indigo-500 group-hover:text-indigo-400 transition-colors"
              size={32}
            />
            <span className="text-2xl font-bold text-gray-100">Imegedit</span>
          </Link>
          <p className="mt-2 text-sm text-gray-600">Edit gambar langsung di browser</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
