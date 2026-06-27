import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { extractErrorMessage } from '@/utils/format'

interface QueryErrorMessageProps {
  error: unknown
  onRetry?: () => void
  className?: string
}

export function QueryErrorMessage({ error, onRetry, className }: QueryErrorMessageProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className ?? ''}`}>
      <AlertCircle className="text-red-500/70 mb-4" size={44} strokeWidth={1.5} />
      <h3 className="text-base font-medium text-gray-300 mb-1">Gagal memuat data</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-sm">{extractErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Coba lagi
        </Button>
      )}
    </div>
  )
}
