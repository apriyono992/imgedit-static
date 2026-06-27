import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMyLogs } from '@/api/activityLogs'
import { Table } from '@/components/ui/Table'
import type { Column } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { SearchInput } from '@/components/common/SearchInput'
import type { ActivityLog } from '@/types/api'
import { formatDate } from '@/utils/format'
import { useTableState } from '@/hooks/useTableState'

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
  const cls = TOOL_CLASSES[tool] ?? 'bg-gray-700 text-gray-300'
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {tool}
    </span>
  )
}

const columns: Column<ActivityLog>[] = [
  {
    key: 'toolName',
    header: 'Tool',
    sortable: true,
    render: (row) => <ToolBadge tool={row.toolName} />,
  },
  {
    key: 'metadata',
    header: 'Detail',
    render: (row) => {
      if (!row.metadata || Object.keys(row.metadata).length === 0) {
        return <span className="text-gray-700 text-xs">—</span>
      }
      const short = Object.entries(row.metadata)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(', ')
      return (
        <span
          className="text-xs text-gray-500 font-mono max-w-[220px] truncate block"
          title={JSON.stringify(row.metadata, null, 2)}
        >
          {short}
        </span>
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

export function MyLogsPage() {
  const { page, setPage, sortBy, sortOrder, search, handleSearch, handleSort } = useTableState({
    defaultSortBy: 'createdAt',
  })
  const [toolFilter, setToolFilter] = useState('')

  const query = useQuery({
    queryKey: ['my-logs', { page, sortBy, sortOrder, search, toolFilter }],
    queryFn: () =>
      getMyLogs({
        page,
        limit: LIMIT,
        sortBy,
        sortOrder,
        search: search || undefined,
        toolName: toolFilter || undefined,
      }),
  })

  const meta = query.data?.meta

  return (
    <div className="p-5 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Riwayat Aktivitas</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Semua aktivitas edit yang pernah kamu lakukan
          {meta && (
            <span className="ml-2 text-gray-600">({meta.total.toLocaleString()} total)</span>
          )}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Cari tool atau IP..."
          className="flex-1"
        />
        <Select
          value={toolFilter}
          onChange={(e) => {
            setToolFilter(e.target.value)
            setPage(1)
          }}
          options={TOOL_OPTIONS}
          className="sm:w-52"
        />
      </div>

      <Table<ActivityLog>
        columns={columns}
        data={query.data?.data ?? []}
        keyExtractor={(r) => r.id}
        isLoading={query.isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="Belum ada riwayat aktivitas"
      />

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
    </div>
  )
}
