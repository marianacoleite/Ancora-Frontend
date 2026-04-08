import type { AppData } from '../../types/models'

const KEY = 'ancora-app-data-v1'

export function loadLocalData(): AppData | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as AppData
  } catch {
    return null
  }
}

export function saveLocalData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function clearLocalData(): void {
  localStorage.removeItem(KEY)
}
