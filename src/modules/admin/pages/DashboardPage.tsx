import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, Activity, Shield, Clock, ArrowRight } from 'lucide-react'
import { getUsers } from '@/api/users'
import { getAllLogs } from '@/api/activityLogs'
import { getAuditLogs } from '@/api/auditLog'
import { StatCard } from '../components/StatCard'
import { Table } from '@/components/ui/Table'
import type { Column } from '@/components/ui/Table'
import { QueryErrorMessage } from '@/components/common/QueryErrorMessage'
import type { ActivityLog } from '@/types/api'
import { formatDate } from '@/utils/format'

const TOOL_COLORS: Record<string, string> = {
  crop: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  resize: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'remove-background': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  'change-background': 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  reformat: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  upscale: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  downscale: 'bg-gray-600/40 text-gray-400',
}

function ToolBadge({ tool }: { tool: string }) {
  const cls = TOOL_COLORS[tool] ?? 'bg-gray-700 text-gray-300'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>
      {tool}
    </span>
  )
}

const recentLogColumns: Column<ActivityLog>[] = [
  {
    key: 'user',
    header: 'User',
    render: (row) =>
      row.user ? (
        <div>
          <p className="text-sm font-medium text-gray-200">{row.user.name}</p>
          <p className="text-xs text-gray-500">{row.user.email}</p>
        </div>
      ) : (
        <span className="text-gray-600 text-sm">—</span>
      ),
  },
  {
    key: 'toolName',
    header: 'Tool',
    render: (row) => <ToolBadge tool={row.toolName} />,
  },
  {
    key: 'createdAt',
    header: 'Waktu',
    render: (row) => (
      <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(row.createdAt)}</span>
    ),
  },
]

function TopToolsChart({ data }: { data: ActivityLog[] }) {
  const counts = data.reduce<Record<string, number>>((acc, log) => {
    acc[log.toolName] = (acc[log.toolName] || 0) + 1
    return acc
  }, {})

  const total = data.length || 1
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (sorted.length === 0) return null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Tool Terpopuler (dari data terbaru)</h3>
      <div className="space-y-3">
        {sorted.map(([tool, count]) => (
          <div key={tool} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-32 truncate">{tool}</span>
            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-6 text-right">{count}x</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const totalUsersQ = useQuery({
    queryKey: ['admin', 'users', 'count'],
    queryFn: () => getUsers({ limit: 1 }),
  })
  const totalAdminQ = useQuery({
    queryKey: ['admin', 'users', 'admin-count'],
    queryFn: () => getUsers({ limit: 1, roleId: 2 }),
  })
  const totalLogsQ = useQuery({
    queryKey: ['admin', 'logs', 'count'],
    queryFn: () => getAllLogs({ limit: 1 }),
  })
  const totalAuditQ = useQuery({
    queryKey: ['admin', 'audit', 'count'],
    queryFn: () => getAuditLogs({ limit: 1 }),
  })
  const recentLogsQ = useQuery({
    queryKey: ['admin', 'logs', 'recent'],
    queryFn: () => getAllLogs({ limit: 10, sortBy: 'createdAt', sortOrder: 'DESC' }),
    refetchInterval: 60_000,
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ringkasan aktivitas platform</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users} label="Total User" href="/admin/users"
          value={totalUsersQ.data?.meta.total} isLoading={totalUsersQ.isLoading}
          iconColor="text-indigo-400" iconBg="bg-indigo-600/15"
        />
        <StatCard
          icon={Shield} label="Total Admin" href="/admin/users"
          value={totalAdminQ.data?.meta.total} isLoading={totalAdminQ.isLoading}
          iconColor="text-amber-400" iconBg="bg-amber-500/15"
        />
        <StatCard
          icon={Activity} label="Total Activity" href="/admin/logs"
          value={totalLogsQ.data?.meta.total} isLoading={totalLogsQ.isLoading}
          iconColor="text-emerald-400" iconBg="bg-emerald-500/15"
        />
        <StatCard
          icon={Clock} label="Audit Trail" href="/admin/audit"
          value={totalAuditQ.data?.meta.total} isLoading={totalAuditQ.isLoading}
          iconColor="text-purple-400" iconBg="bg-purple-500/15"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity (2/3) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-200">Aktivitas Terbaru</h2>
            <Link
              to="/admin/logs"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>
          {recentLogsQ.isError ? (
            <QueryErrorMessage error={recentLogsQ.error} onRetry={() => recentLogsQ.refetch()} />
          ) : (
            <Table<ActivityLog>
              columns={recentLogColumns}
              data={recentLogsQ.data?.data ?? []}
              keyExtractor={(r) => r.id}
              isLoading={recentLogsQ.isLoading}
              skeletonRows={5}
              emptyMessage="Belum ada aktivitas"
            />
          )}
        </div>

        {/* Top Tools (1/3) */}
        <div className="space-y-4">
          {recentLogsQ.data && (
            <TopToolsChart data={recentLogsQ.data.data} />
          )}

          {/* Quick links */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Akses Cepat</h3>
            <div className="space-y-1">
              {[
                { to: '/admin/users', label: 'Kelola Users', icon: Users },
                { to: '/admin/logs', label: 'Activity Logs', icon: Activity },
                { to: '/admin/audit', label: 'Audit Trail', icon: Shield },
              ].map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
