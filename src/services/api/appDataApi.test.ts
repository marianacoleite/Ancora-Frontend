import { describe, it, expect } from 'vitest'
import type { Workspace } from '../../types/models'
import { normalizeAppData } from './appDataApi'

describe('normalizeAppData', () => {
  it('preenche arrays vazios quando o payload vem incompleto', () => {
    expect(normalizeAppData({})).toEqual({
      workspaces: [],
      subspaces: [],
      sections: [],
      tasks: [],
    })
  })

  it('preserva workspaces quando o array existe', () => {
    const workspaces: Workspace[] = [
      { id: '1', name: 'W', userId: 'u', order: 0, createdAt: 1 },
    ]
    expect(normalizeAppData({ workspaces }).workspaces).toEqual(workspaces)
  })

  it('ignora campos que não são array', () => {
    expect(normalizeAppData({ workspaces: 'não-array' }).workspaces).toEqual([])
  })
})
