import { useQuery } from '@tanstack/react-query'
import { Shield, Activity, Calendar, Mail, Pencil } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { getAllLogs } from '@/api/activityLogs'
import type { User } from '@/types/api'
import { formatDate } from '@/utils/format'
import { useNavigate } from 'react-router-dom'

const TOOL_COLORS: Record<string, string> = {
  crop: 'text-purple-400',
  resize: 'text-blue-400',
  'remove-background': 'text-emerald-400',
  'change-background': 'text-cyan-400',
  reformat: 'text-amber-400',
  upscale: 'text-indigo-400',
  downscale: 'text-gray-400',
}

interface UserDetailModalProps {
  user: User | null
  onClose: () => void
  onEdit: (user: User) => void
}

export function UserDetailModal({ user, onClose, onEdit }: UserDetailModalProps) {
  const navigate = useNavigate()

  const logsQ = useQuery({
    queryKey: ['admin', 'user-detail-logs', user?.id],
    queryFn: () =>
      getAllLogs({ userId: user!.id, limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' }),
    enabled: !!user,
  })

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?'
  const totalLogs = logsQ.data?.meta.total ?? 0

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title="Detail User"
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Tutup
          </Button>
          {user && (
            <Button
              size="sm"
              leftIcon={<Pencil size={13} />}
              onClick={() => { onEdit(user); onClose() }}
            >
              Edit User
            </Button>
          )}
        </>
      }
    >
      {user && (
        <div className="space-y-5">
          {/* Avatar + Info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-600/20 border-2 border-indigo-600/30 flex items-center justify-center text-2xl font-bold text-indigo-400 shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-100 truncate">{user.name}</h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                <Mail size={13} />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={user.roleId === 2 ? 'purple' : 'default'}>
              <Shield size={11} className="mr-1" />
              {user.roleId === 2 ? 'Admin' : 'User'}
            </Badge>
            <Badge variant={user.active ? 'success' : 'danger'}>
              {user.active ? 'Aktif' : 'Nonaktif'}
            </Badge>
            {user.createdAt && (
              <Badge variant="default">
                <Calendar size={11} className="mr-1" />
                Bergabung {formatDate(user.createdAt)}
              </Badge>
            )}
          </div>

          {/* Activity Stats */}
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
            <Activity size={16} className="text-indigo-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-200">{totalLogs} aktivitas edit</p>
              <p className="text-xs text-gray-500">Total riwayat semua tool</p>
            </div>
            {totalLogs > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  navigate(`/admin/logs?userId=${user.id}`)
                  onClose()
                }}
              >
                Lihat →
              </Button>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Aktivitas Terbaru
            </p>
            {logsQ.isLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : logsQ.data?.data.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-4">Belum ada aktivitas</p>
            ) : (
              <div className="space-y-2">
                {logsQ.data?.data.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2 px-3 bg-gray-950 rounded-lg border border-gray-800"
                  >
                    <span
                      className={`text-sm font-medium ${TOOL_COLORS[log.toolName] ?? 'text-gray-400'}`}
                    >
                      {log.toolName}
                    </span>
                    <span className="text-xs text-gray-600">{formatDate(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
