import type { AppData } from '../../types/models'

const now = Date.now()

export function createSeedData(userId: string): AppData {
  const wsId = 'ws_demo'
  const subId = 'sub_backend'
  const sec1 = 'sec_driver'
  const sec2 = 'sec_api'

  return {
    workspaces: [
      {
        id: wsId,
        name: 'Produto Core',
        userId,
        order: 0,
        createdAt: now,
      },
    ],
    subspaces: [
      {
        id: subId,
        workspaceId: wsId,
        userId,
        name: 'Backend',
        order: 0,
        createdAt: now,
      },
      {
        id: 'sub_frontend',
        workspaceId: wsId,
        userId,
        name: 'Frontend',
        order: 1,
        createdAt: now,
      },
    ],
    sections: [
      {
        id: sec1,
        subspaceId: subId,
        workspaceId: wsId,
        userId,
        name: 'Driver',
        order: 0,
        createdAt: now,
      },
      {
        id: sec2,
        subspaceId: subId,
        workspaceId: wsId,
        userId,
        name: 'API REST',
        order: 1,
        createdAt: now,
      },
    ],
    tasks: [
      {
        id: 't1',
        sectionId: sec1,
        subspaceId: subId,
        workspaceId: wsId,
        userId,
        title: 'Migrar autenticação para JWT',
        status: 'in_progress',
        tags: ['auth', 'prioridade'],
        assigneeName: 'Ana',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        order: 0,
        createdAt: now,
      },
      {
        id: 't2',
        sectionId: sec1,
        subspaceId: subId,
        workspaceId: wsId,
        userId,
        title: 'Documentar endpoints internos',
        status: 'pending',
        tags: ['docs'],
        assigneeName: null,
        dueDate: null,
        order: 1,
        createdAt: now,
      },
      {
        id: 't3',
        sectionId: sec2,
        subspaceId: subId,
        workspaceId: wsId,
        userId,
        title: 'Rate limiting no gateway',
        status: 'done',
        tags: ['infra'],
        assigneeName: 'Bruno',
        dueDate: new Date().toISOString().slice(0, 10),
        order: 0,
        createdAt: now,
      },
    ],
  }
}
