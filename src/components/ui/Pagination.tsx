import { Fragment } from 'react'
import { cn } from '@/utils/cn'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNextPage: boolean
  hasPrevPage: boolean
  className?: string
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const allPages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visible = allPages.filter(
    (p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages,
  )

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <p className="text-sm text-gray-500">
        Halaman {page} dari {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="px-3 py-1.5 rounded-md text-sm text-gray-400 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        {visible.map((p, i) => {
          const prev = visible[i - 1]
          const gap = prev !== undefined && p - prev > 1
          return (
            <Fragment key={p}>
              {gap && <span className="px-1.5 text-gray-600 text-sm">…</span>}
              <button
                onClick={() => onPageChange(p)}
                className={cn(
                  'min-w-[32px] px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800',
                )}
              >
                {p}
              </button>
            </Fragment>
          )
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="px-3 py-1.5 rounded-md text-sm text-gray-400 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
