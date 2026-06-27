import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number | string | undefined
  isLoading: boolean
  iconColor?: string
  iconBg?: string
  href?: string
  className?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
  iconColor = 'text-indigo-400',
  iconBg = 'bg-indigo-600/15',
  href,
  className,
}: StatCardProps) {
  const inner = (
    <div className={cn(
      'bg-gray-900 border border-gray-800 rounded-xl p-5 transition-colors',
      href && 'hover:border-indigo-600/40 hover:bg-gray-900',
      className,
    )}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <p className="text-3xl font-bold text-gray-100">{value ?? '—'}</p>
      )}
      {href && (
        <p className="text-xs text-indigo-500 mt-3">Lihat semua →</p>
      )}
    </div>
  )

  return href ? <Link to={href}>{inner}</Link> : inner
}
