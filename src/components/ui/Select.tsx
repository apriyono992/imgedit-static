import type { ComponentProps } from 'react'
import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps extends ComponentProps<'select'> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none rounded-lg border bg-gray-900 text-gray-100',
              'px-3 py-2 pr-8 text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-red-500' : 'border-gray-700',
              className,
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'
