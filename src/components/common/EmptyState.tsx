import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  message?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Tidak ada data',
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <Icon className="text-gray-700 mb-4" size={48} strokeWidth={1.5} />
      <h3 className="text-base font-medium text-gray-400 mb-1">{title}</h3>
      {message && <p className="text-sm text-gray-600 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
