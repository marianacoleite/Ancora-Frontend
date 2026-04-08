import { useLayoutEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'ancora-theme'

function readTheme(): 'light' | 'dark' {
  const v = localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null
  if (v === 'light' || v === 'dark') return v
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Aplica tema antes da primeira pintura para evitar flash. */
export function ThemeBootstrap({ children }: { children: ReactNode }) {
  const [, setTick] = useState(0)
  useLayoutEffect(() => {
    const t = readTheme()
    document.documentElement.classList.toggle('dark', t === 'dark')
    setTick((x) => x + 1)
  }, [])
  return children
}
