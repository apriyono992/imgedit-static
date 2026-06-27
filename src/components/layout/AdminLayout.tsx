import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  ImageIcon,
  LayoutDashboard,
  Users,
  Activity,
  Shield,
  LogOut,
  Menu,
  X,
  MonitorSmartphone,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/logs', icon: Activity, label: 'Activity Logs' },
  { to: '/admin/audit', icon: Shield, label: 'Audit Trail' },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    toast.success('Berhasil logout')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-800">
        <ImageIcon className="text-indigo-500 shrink-0" size={22} />
        <div>
          <span className="font-bold text-gray-100 text-base">Imegedit</span>
          <span className="ml-2 text-xs text-indigo-400 font-medium">Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/25'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800',
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
        <div className="pt-2 border-t border-gray-800 mt-2">
          <NavLink
            to="/app/editor"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <MonitorSmartphone size={17} />
            User Area
          </NavLink>
        </div>
      </nav>

      <div className="px-3 pb-4 border-t border-gray-800 pt-3">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-gray-300 truncate">{user?.name}</p>
          <p className="text-xs text-gray-600 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-gray-900 border-r border-gray-800 shrink-0">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-60 bg-gray-900 border-r border-gray-800 z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3.5 right-3.5 text-gray-500 hover:text-gray-200 p-1 rounded-md hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
            <SidebarNav onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <ImageIcon className="text-indigo-500" size={20} />
            <span className="font-bold text-gray-100">Imegedit Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-5 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
