'use client'

import * as React from 'react'

export type ThemeName = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: ThemeName
  setTheme: (theme: ThemeName | ((prev: ThemeName) => ThemeName)) => void
  forcedTheme?: ThemeName
  resolvedTheme: 'light' | 'dark'
  themes: string[]
  systemTheme?: 'light' | 'dark'
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolvePreference(theme: ThemeName, system: 'light' | 'dark'): 'light' | 'dark' {
  if (theme === 'system') return system
  return theme
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  enableSystem = true,
  storageKey = 'theme',
}: {
  children: React.ReactNode
  /** Tailwind: toggle `class="dark"` on `document.documentElement` */
  attribute?: 'class'
  defaultTheme?: ThemeName
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
}) {
  const [theme, setThemeState] = React.useState<ThemeName>(defaultTheme)
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>(() =>
    typeof window === 'undefined' ? 'dark' : getSystemTheme(),
  )

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as ThemeName | null
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored)
      } else if (stored === 'system' && enableSystem) {
        setThemeState('system')
      }
    } catch {
      /* ignore */
    }
  }, [storageKey, enableSystem])

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemTheme(mq.matches ? 'dark' : 'light')
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme = resolvePreference(theme, systemTheme)

  React.useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    try {
      localStorage.setItem(storageKey, theme)
    } catch {
      /* ignore */
    }
  }, [theme, resolvedTheme, storageKey])

  const setTheme = React.useCallback(
    (value: ThemeName | ((prev: ThemeName) => ThemeName)) => {
      setThemeState((prev) => (typeof value === 'function' ? value(prev) : value))
    },
    [],
  )

  const themes = React.useMemo(
    () => (enableSystem ? (['light', 'dark', 'system'] as const) : (['light', 'dark'] as const)),
    [enableSystem],
  )

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      themes: [...themes],
      systemTheme: enableSystem ? systemTheme : undefined,
      forcedTheme: undefined,
    }),
    [theme, setTheme, resolvedTheme, themes, systemTheme, enableSystem],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** Compatible with previous `next-themes` usage in this app */
export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    return {
      theme: 'system',
      setTheme: () => {},
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light',
      forcedTheme: undefined,
    }
  }
  return ctx
}
