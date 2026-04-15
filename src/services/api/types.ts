import type { AppData, TaskStatus } from '../../types/models'

/** Resposta típica de login/registo — o backend deve devolver JWT + utilizador. */
export type ApiAuthUser = {
  id: string
  email: string
}

export type ApiAuthResponse = {
  token: string
  user: ApiAuthUser
}

export type ApiAppDataResponse = AppData

export type CreateWorkspaceBody = { name: string; order: number }
export type PatchWorkspaceBody = { name: string }

export type CreateSubspaceBody = { workspaceId: string; name: string; order: number }
export type PatchSubspaceBody = { name: string }

export type CreateSectionBody = {
  workspaceId: string
  subspaceId: string
  name: string
  order: number
}
export type PatchSectionBody = { name: string }

export type CreateTaskBody = {
  workspaceId: string
  subspaceId: string
  sectionId: string
  title: string
  status: TaskStatus
  tags: string[]
  assigneeName: string | null
  dueDate: string | null
  order: number
}

export type PatchTaskBody = Partial<{
  title: string
  status: TaskStatus
  tags: string[]
  assigneeName: string | null
  dueDate: string | null
  order: number
  sectionId: string
  subspaceId: string
  workspaceId: string
}>
