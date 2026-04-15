import { apiRequest } from './client'
import { paths } from './routes'
import type { ApiAuthResponse, ApiAuthUser } from './types'

export async function apiLogin(email: string, password: string): Promise<ApiAuthResponse> {
  return apiRequest<ApiAuthResponse>('POST', paths.auth.login, {
    json: { email, password },
    auth: false,
  })
}

export async function apiRegister(email: string, password: string): Promise<ApiAuthResponse> {
  return apiRequest<ApiAuthResponse>('POST', paths.auth.register, {
    json: { email, password },
    auth: false,
  })
}

export async function apiMe(): Promise<{ user: ApiAuthUser }> {
  return apiRequest<{ user: ApiAuthUser }>('GET', paths.auth.me)
}

export async function apiLogout(): Promise<void> {
  await apiRequest<void>('POST', paths.auth.logout)
}
