import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { ImageIcon, Activity, ChevronDown, LogOut, ShieldCheck, ImagePlus } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

export function AppLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    toast.success('Berhasil logout')
  }

  const closeDropdown = () => setDropdownOpen(false)
  const initial = user?.name?.charAt(0).toUpperCase() ?? '?'
  const isAdmin = user?.roleId === 2

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="flex items-center gap-5">
          <NavLink to="/app/editor" className="flex items-center gap-2">
            <ImageIcon className="text-indigo-500" size={22} />
            <span className="font-bold text-gray-100 text-lg">Imegedit</span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink
              to="/app/editor"
              className={({ isActive }) =>
                cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800',
                )
              }
            >
              Editor
            </NavLink>
            <NavLink
              to="/app/logs"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800',
                )
              }
            >
              <Activity size={13} />
              Riwayat
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                <ShieldCheck size={13} />
                Admin CMS
              </NavLink>
            )}
          </nav>
        </div>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initial}
            </div>
            <span className="hidden sm:block max-w-[120px] truncate">{user?.name}</span>
            <ChevronDown
              size={14}
              className={cn('transition-transform', dropdownOpen && 'rotate-180')}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
                  {isAdmin && (
                    <span className="shrink-0 px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-semibold rounded">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              {/* Navigation links (always visible, even on mobile) */}
              <div className="py-1 border-b border-gray-700">
                <NavLink
                  to="/app/editor"
                  onClick={closeDropdown}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <ImagePlus size={15} className="text-indigo-400" />
                  Editor
                </NavLink>
                <NavLink
                  to="/app/logs"
                  onClick={closeDropdown}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <Activity size={15} className="text-gray-500" />
                  Riwayat Aktivitas
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin/dashboard"
                    onClick={closeDropdown}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors font-medium"
                  >
                    <ShieldCheck size={15} />
                    Admin CMS
                  </NavLink>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
