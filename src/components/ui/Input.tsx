import type { ComponentProps, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends ComponentProps<'input'> {
  label?: string
  error?: string
  hint?: string
  leftElement?: ReactNode
  rightElement?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftElement, rightElement, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border bg-gray-900 text-gray-100 placeholder-gray-600',
              'px-3 py-2 text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-red-500' : 'border-gray-700',
              leftElement && 'pl-10',
              rightElement && 'pr-10',
              className,
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
