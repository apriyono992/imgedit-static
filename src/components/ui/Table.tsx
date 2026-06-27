import type { ReactNode } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  sortable?: boolean
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  isLoading?: boolean
  skeletonRows?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  onSort?: (key: string) => void
  onRowClick?: (row: T) => void
  emptyMessage?: string
}

const SKELETON_WIDTHS = ['65%', '80%', '55%', '90%', '70%', '45%', '85%']

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  skeletonRows = 6,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  emptyMessage = 'Tidak ada data',
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-900 border-b border-gray-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap',
                  col.sortable && onSort && 'cursor-pointer select-none hover:text-gray-200',
                  col.className,
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center gap-1.5">
                  {col.header}
                  {col.sortable &&
                    (sortBy === col.key ? (
                      sortOrder === 'ASC' ? (
                        <ChevronUp size={14} className="text-indigo-400" />
                      ) : (
                        <ChevronDown size={14} className="text-indigo-400" />
                      )
                    ) : (
                      <ChevronsUpDown size={14} className="text-gray-600" />
                    ))}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i} className="bg-gray-950">
                {columns.map((col, ci) => (
                  <td key={col.key} className={cn('px-4 py-3.5', col.className)}>
                    <div
                      className="h-3.5 bg-gray-800 rounded-md animate-pulse"
                      style={{ width: SKELETON_WIDTHS[(i * 3 + ci) % SKELETON_WIDTHS.length] }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-14 text-gray-600">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'bg-gray-950 hover:bg-gray-900/80 transition-colors',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-gray-300', col.className)}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
