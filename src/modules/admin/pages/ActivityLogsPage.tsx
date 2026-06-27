import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { getAllLogs } from '@/api/activityLogs'
import { Table } from '@/components/ui/Table'
import type { Column } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/common/SearchInput'
import { QueryErrorMessage } from '@/components/common/QueryErrorMessage'
import { MetadataModal } from '../components/MetadataModal'
import type { ActivityLog } from '@/types/api'
import { formatDate } from '@/utils/format'
import { useTableState } from '@/hooks/useTableState'
import { downloadCSV } from '@/utils/csv'

const LIMIT = 20

const TOOL_OPTIONS = [
  { value: '', label: 'Semua Tool' },
  { value: 'crop', label: 'Crop' },
  { value: 'resize', label: 'Resize' },
  { value: 'remove-background', label: 'Remove Background' },
  { value: 'change-background', label: 'Change Background' },
  { value: 'reformat', label: 'Reformat' },
  { value: 'upscale', label: 'Upscale' },
  { value: 'downscale', label: 'Downscale' },
]

const TOOL_CLASSES: Record<string, string> = {
  crop: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  resize: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'remove-background': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  'change-background': 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  reformat: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  upscale: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  downscale: 'bg-gray-600/40 text-gray-400',
}

function ToolBadge({ tool }: { tool: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${TOOL_CLASSES[tool] ?? 'bg-gray-700 text-gray-300'}`}>
      {tool}
    </span>
  )
}

export function ActivityLogsPage() {
  const { page, setPage, sortBy, sortOrder, search, handleSearch, handleSort } = useTableState({
    defaultSortBy: 'createdAt',
  })
  const [toolFilter, setToolFilter] = useState('')
  const [metadataTarget, setMetadataTarget] = useState<ActivityLog | null>(null)

  const query = useQuery({
    queryKey: ['admin', 'logs', 'all', { page, sortBy, sortOrder, search, toolFilter }],
    queryFn: () =>
      getAllLogs({
        page,
        limit: LIMIT,
        sortBy,
        sortOrder,
        search: search || undefined,
        toolName: toolFilter || undefined,
      }),
  })

  const handleExport = () => {
    const rows = (query.data?.data ?? []).map((log) => ({
      user_name: log.user?.name ?? '',
      user_email: log.user?.email ?? '',
      tool: log.toolName,
      metadata: log.metadata ? JSON.stringify(log.metadata) : '',
      ip: log.ipAddress,
      time: log.createdAt,
    }))
    downloadCSV(
      rows,
      [
        { key: 'user_name', label: 'Nama User' },
        { key: 'user_email', label: 'Email User' },
        { key: 'tool', label: 'Tool' },
        { key: 'metadata', label: 'Metadata' },
        { key: 'ip', label: 'IP Address' },
        { key: 'time', label: 'Waktu' },
      ],
      `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`,
    )
  }

  const columns: Column<ActivityLog>[] = [
    {
      key: 'user',
      header: 'User',
      render: (row) =>
        row.user ? (
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{row.user.name}</p>
            <p className="text-xs text-gray-500 truncate">{row.user.email}</p>
          </div>
        ) : (
          <span className="text-gray-600 text-xs">—</span>
        ),
    },
    {
      key: 'toolName',
      header: 'Tool',
      sortable: true,
      render: (row) => <ToolBadge tool={row.toolName} />,
    },
    {
      key: 'metadata',
      header: 'Metadata',
      render: (row) => {
        if (!row.metadata || Object.keys(row.metadata).length === 0) {
          return <span className="text-gray-700 text-xs">—</span>
        }
        const short = Object.entries(row.metadata)
          .map(([k, v]) => `${k}: ${String(v)}`)
          .join(', ')
        return (
          <button
            onClick={(e) => { e.stopPropagation(); setMetadataTarget(row) }}
            className="text-xs text-gray-500 font-mono max-w-[180px] truncate block hover:text-indigo-400 transition-colors text-left"
            title="Klik untuk lihat detail"
          >
            {short}
          </button>
        )
      },
    },
    {
      key: 'ipAddress',
      header: 'IP',
      render: (row) => <code className="text-xs text-gray-500 font-mono">{row.ipAddress}</code>,
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
          <h1 className="text-2xl font-bold text-gray-100">Activity Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Log aktivitas edit dari semua user
            {meta && <span className="ml-2 text-gray-600">({meta.total.toLocaleString()} total)</span>}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download size={14} />}
          onClick={handleExport}
          disabled={!query.data?.data.length}
        >
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Cari nama, email, atau tool..."
          className="flex-1"
        />
        <Select
          value={toolFilter}
          onChange={(e) => { setToolFilter(e.target.value); setPage(1) }}
          options={TOOL_OPTIONS}
          className="sm:w-52"
        />
      </div>

      {query.isError ? (
        <QueryErrorMessage error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          <p className="text-xs text-gray-600 mb-2">Klik kolom Metadata untuk melihat detail JSON</p>
          <Table<ActivityLog>
            columns={columns}
            data={query.data?.data ?? []}
            keyExtractor={(r) => r.id}
            isLoading={query.isLoading}
            skeletonRows={LIMIT}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyMessage="Tidak ada activity log yang cocok"
          />
        </>
      )}

      {meta && meta.totalPages > 1 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          hasNextPage={meta.hasNextPage}
          hasPrevPage={meta.hasPrevPage}
          onPageChange={setPage}
          className="mt-4"
        />
      )}

      <MetadataModal
        metadata={metadataTarget?.metadata ?? null}
        toolName={metadataTarget?.toolName}
        onClose={() => setMetadataTarget(null)}
      />
    </div>
  )
}
