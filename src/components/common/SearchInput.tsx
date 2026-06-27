import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari...',
  className,
  debounceMs = 300,
}: SearchInputProps) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => {
    const t = setTimeout(() => onChange(local), debounceMs)
    return () => clearTimeout(t)
  }, [local, debounceMs, onChange])

  return (
    <div className={cn('relative', className)}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
      />
      {local && (
        <button
          onClick={() => {
            setLocal('')
            onChange('')
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
