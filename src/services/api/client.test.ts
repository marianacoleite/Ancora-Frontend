import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./backend', () => ({
  getBackendBaseUrl: () => 'http://localhost:3000',
}))

vi.mock('./token', () => ({
  getAccessToken: () => null,
}))

import { apiRequest } from './client'

describe('apiRequest', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '{"ok":true}',
      }),
    )
  })

  it('devolve JSON em 200', async () => {
    const r = await apiRequest<{ ok: boolean }>('GET', '/test', { auth: false })
    expect(r).toEqual({ ok: true })
  })

  it('devolve undefined em 204', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        text: async () => '',
      }),
    )
    const r = await apiRequest<void>('DELETE', '/x', { auth: false })
    expect(r).toBeUndefined()
  })

  it('usa message do corpo de erro JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: 'validação falhou' }),
      }),
    )
    await expect(apiRequest('GET', '/x', { auth: false })).rejects.toThrow('validação falhou')
  })

  it('usa error quando message não existe', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ error: 'ops' }),
      }),
    )
    await expect(apiRequest('GET', '/x', { auth: false })).rejects.toThrow('ops')
  })
})
