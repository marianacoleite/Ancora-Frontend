const KEY = 'ancora_access_token'

export function getAccessToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem(KEY)
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(KEY, token)
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(KEY)
}
