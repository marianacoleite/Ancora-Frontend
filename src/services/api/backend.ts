/**
 * Chamadas HTTP ao servidor Express (health, rotas futuras).
 */

export type BackendRootResponse = { ok?: boolean; service?: string }
export type BackendHealthResponse = { status?: string }

export function getBackendBaseUrl(): string | null {
  const u = import.meta.env.VITE_BACKEND_URL
  if (!u || typeof u !== 'string' || u.trim() === '') return null
  return u.replace(/\/$/, '')
}

export function isBackendConfigured(): boolean {
  return getBackendBaseUrl() !== null
}

async function fetchJson<T>(path: string): Promise<T> {
  const base = getBackendBaseUrl()
  if (!base) throw new Error('Backend não configurado (defina VITE_BACKEND_URL)')
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Backend respondeu ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function getBackendRoot(): Promise<BackendRootResponse> {
  return fetchJson('/')
}

export function getBackendHealth(): Promise<BackendHealthResponse> {
  return fetchJson('/health')
}

/** `GET /health/supabase` — estado do cliente Supabase (backend). */
export function getBackendHealthSupabase(): Promise<unknown> {
  return fetchJson('/health/supabase')
}

/** `GET /health/db` — leitura de teste no banco (backend). */
export function getBackendHealthDb(): Promise<unknown> {
  return fetchJson('/health/db')
}
