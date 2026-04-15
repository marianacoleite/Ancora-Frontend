import { getBackendBaseUrl } from './backend'
import { getAccessToken } from './token'

const API_PREFIX = '/api/v1'

function buildUrl(path: string): string {
  const base = getBackendBaseUrl()
  if (!base) throw new Error('Backend não configurado (defina VITE_BACKEND_URL)')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${API_PREFIX}${p}`
}

export type ApiRequestOptions = {
  json?: unknown
  /** Se false, não envia Authorization (login/registo). Predefinição: true. */
  auth?: boolean
}

export async function apiRequest<T>(method: string, path: string, options?: ApiRequestOptions): Promise<T> {
  const { json, auth = true } = options ?? {}
  const url = buildUrl(path)
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(url, {
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : undefined,
  })
  if (res.status === 204) {
    return undefined as T
  }
  const text = await res.text()
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const j = JSON.parse(text) as { error?: string; message?: string }
      msg = j.message ?? j.error ?? msg
    } catch {
      /* ignore */
    }
    const err = new Error(msg)
    ;(err as Error & { status?: number }).status = res.status
    throw err
  }
  if (!text) return undefined as T
  return JSON.parse(text) as T
}
