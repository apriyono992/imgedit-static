import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { getAuditLogs } from '@/api/auditLog'
import { Table } from '@/components/ui/Table'
import type { Column } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import type { BadgeVariant } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/common/SearchInput'
import { QueryErrorMessage } from '@/components/common/QueryErrorMessage'
import type { AuditLog } from '@/types/api'
import { formatDate } from '@/utils/format'
import { useTableState } from '@/hooks/useTableState'
import { downloadCSV } from '@/utils/csv'
import { cn } from '@/utils/cn'

const LIMIT = 20

function getMethodVariant(method: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    GET: 'info', POST: 'success', PATCH: 'warning', DELETE: 'danger',
  }
  return map[method] ?? 'default'
}

function getStatusVariant(code: number): BadgeVariant {
  if (code >= 500) return 'danger'
  if (code >= 400) return 'warning'
  if (code >= 200 && code < 300) return 'success'
  return 'default'
}

const METHOD_FILTERS = ['', 'GET', 'POST', 'PATCH', 'DELETE']
const STATUS_RANGES = [
  { label: 'Semua', value: '' },
  { label: '2xx', value: '2' },
  { label: '4xx', value: '4' },
  { label: '5xx', value: '5' },
]

const METHOD_COLORS: Record<string, string> = {
  '': 'text-gray-400 hover:text-gray-200 border-gray-700',
  GET: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
  POST: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  PATCH: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  DELETE: 'text-red-400 border-red-500/40 bg-red-500/10',
}

export function AuditLogPage() {
  const { page, setPage, sortBy, sortOrder, search, handleSearch, handleSort } = useTableState({
    defaultSortBy: 'createdAt',
  })
  const [methodFilter, setMethodFilter] = useState('')
  const [statusRange, setStatusRange] = useState('')

  const query = useQuery({
    queryKey: ['admin', 'audit', { page, sortBy, sortOrder, search, methodFilter, statusRange }],
    queryFn: () =>
      getAuditLogs({
        page,
        limit: LIMIT,
        sortBy,
        sortOrder,
        search: search || undefined,
        method: methodFilter || undefined,
      }),
  })

  // Client-side filter by status range (API only supports exact match)
  const filteredData = (query.data?.data ?? []).filter((log) => {
    if (!statusRange) return true
    return String(log.statusCode).startsWith(statusRange)
  })

  const handleExport = () => {
    const rows = filteredData.map((log) => ({
      method: log.method,
      path: log.path,
      status: log.statusCode,
      action: log.action,
      user_name: log.user?.name ?? '',
      user_email: log.user?.email ?? '',
      ip: log.ipAddress,
      agent: log.userAgent,
      time: log.createdAt,
    }))
    downloadCSV(
      rows,
      [
        { key: 'method', label: 'Method' },
        { key: 'path', label: 'Path' },
        { key: 'status', label: 'Status Code' },
        { key: 'action', label: 'Action' },
        { key: 'user_name', label: 'Nama User' },
        { key: 'user_email', label: 'Email User' },
        { key: 'ip', label: 'IP Address' },
        { key: 'time', label: 'Waktu' },
      ],
      `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`,
    )
  }

  const columns: Column<AuditLog>[] = [
    {
      key: 'method',
      header: 'Method',
      sortable: true,
      render: (row) => <Badge variant={getMethodVariant(row.method)}>{row.method}</Badge>,
    },
    {
      key: 'path',
      header: 'Path',
      render: (row) => (
        <code className="text-xs text-gray-400 font-mono max-w-[200px] truncate block" title={row.path}>
          {row.path}
        </code>
      ),
    },
    {
      key: 'statusCode',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <Badge variant={getStatusVariant(row.statusCode)}>{row.statusCode}</Badge>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (row) =>
        row.user ? (
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-300 truncate">{row.user.name}</p>
            <p className="text-xs text-gray-600 truncate">{row.user.email}</p>
          </div>
        ) : (
          <span className="text-gray-700 text-xs">—</span>
        ),
    },
    {
      key: 'ipAddress',
      header: 'IP',
      render: (row) => (
        <code className="text-xs text-gray-500 font-mono whitespace-nowrap">{row.ipAddress}</code>
      ),
    },
    {
      key: 'createdAt',
      header: 'Waktu',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(row.createdAt)}</span>
      ),
    },
  ]

  const meta = query.data?.meta

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Audit Trail</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Log semua request HTTP ke backend
            {meta && <span className="ml-2 text-gray-600">({meta.total.toLocaleString()} total)</span>}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download size={14} />}
          onClick={handleExport}
          disabled={!filteredData.length}
        >
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-4">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Cari path, IP, nama user..."
        />

        <div className="flex flex-wrap gap-2 items-center">
          {/* Method filter — pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 mr-1">Method:</span>
            {METHOD_FILTERS.map((m) => (
              <button
                key={m || 'all'}
                onClick={() => { setMethodFilter(m); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
                  methodFilter === m
                    ? m ? METHOD_COLORS[m] : 'bg-gray-700 text-gray-100 border-gray-600'
                    : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300',
                )}
              >
                {m || 'Semua'}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-gray-800 mx-1 hidden sm:block" />

          {/* Status range filter — pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 mr-1">Status:</span>
            {STATUS_RANGES.map((s) => (
              <button
                key={s.value || 'all'}
                onClick={() => setStatusRange(s.value)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
                  statusRange === s.value
                    ? s.value === '5' ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : s.value === '4' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : s.value === '2' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-gray-700 text-gray-100 border-gray-600'
                    : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {query.isError ? (
        <QueryErrorMessage error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <Table<AuditLog>
          columns={columns}
          data={filteredData}
          keyExtractor={(r) => r.id}
          isLoading={query.isLoading}
          skeletonRows={LIMIT}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          emptyMessage="Tidak ada audit log yang cocok"
        />
      )}

      {meta && meta.totalPages > 1 && !statusRange && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          hasNextPage={meta.hasNextPage}
          hasPrevPage={meta.hasPrevPage}
          onPageChange={setPage}
          className="mt-4"
        />
      )}
    </div>
  )
}
