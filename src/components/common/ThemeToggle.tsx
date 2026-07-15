import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Aktifkan dark mode' : 'Aktifkan light mode'}
      title={theme === 'light' ? 'Dark mode' : 'Light mode'}
      className={cn(
        'inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors',
        'border-gray-300 text-gray-500 hover:text-gray-900 hover:bg-gray-100',
        'dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800',
        className,
      )}
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  )
}
