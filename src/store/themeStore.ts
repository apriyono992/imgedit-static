import { create } from 'zustand'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'imegedit-theme'

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // Default light — index.html sudah menerapkan class 'dark' sebelum paint jika localStorage bilang begitu
  theme: localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light',

  toggleTheme() {
    const next: Theme = get().theme === 'light' ? 'dark' : 'light'
    localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
    set({ theme: next })
  },
}))
