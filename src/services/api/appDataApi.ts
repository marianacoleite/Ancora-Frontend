import type { AppData, Section, Subspace, Task, Workspace } from '../../types/models'
import { apiRequest } from './client'
import { paths } from './routes'
import type {
  CreateSectionBody,
  CreateSubspaceBody,
  CreateTaskBody,
  CreateWorkspaceBody,
  PatchSectionBody,
  PatchSubspaceBody,
  PatchTaskBody,
  PatchWorkspaceBody,
} from './types'

function normalizeAppData(raw: unknown): AppData {
  const o = raw as Record<string, unknown>
  return {
    workspaces: Array.isArray(o.workspaces) ? (o.workspaces as Workspace[]) : [],
    subspaces: Array.isArray(o.subspaces) ? (o.subspaces as Subspace[]) : [],
    sections: Array.isArray(o.sections) ? (o.sections as Section[]) : [],
    tasks: Array.isArray(o.tasks) ? (o.tasks as Task[]) : [],
  }
}

/** GET — snapshot completo do utilizador autenticado (JWT). */
export async function fetchAppData(): Promise<AppData> {
  const raw = await apiRequest<unknown>('GET', paths.appData)
  return normalizeAppData(raw)
}

export async function createWorkspaceApi(body: CreateWorkspaceBody): Promise<Workspace> {
  return apiRequest<Workspace>('POST', paths.workspaces, { json: body })
}

export async function patchWorkspaceApi(id: string, body: PatchWorkspaceBody): Promise<Workspace> {
  return apiRequest<Workspace>('PATCH', `${paths.workspaces}/${encodeURIComponent(id)}`, { json: body })
}

export async function deleteWorkspaceApi(id: string): Promise<void> {
  await apiRequest<void>('DELETE', `${paths.workspaces}/${encodeURIComponent(id)}`)
}

export async function createSubspaceApi(body: CreateSubspaceBody): Promise<Subspace> {
  return apiRequest<Subspace>('POST', paths.subspaces, { json: body })
}

export async function patchSubspaceApi(id: string, body: PatchSubspaceBody): Promise<Subspace> {
  return apiRequest<Subspace>('PATCH', `${paths.subspaces}/${encodeURIComponent(id)}`, { json: body })
}

export async function deleteSubspaceApi(id: string): Promise<void> {
  await apiRequest<void>('DELETE', `${paths.subspaces}/${encodeURIComponent(id)}`)
}

export async function createSectionApi(body: CreateSectionBody): Promise<Section> {
  return apiRequest<Section>('POST', paths.sections, { json: body })
}

export async function patchSectionApi(id: string, body: PatchSectionBody): Promise<Section> {
  return apiRequest<Section>('PATCH', `${paths.sections}/${encodeURIComponent(id)}`, { json: body })
}

export async function deleteSectionApi(id: string): Promise<void> {
  await apiRequest<void>('DELETE', `${paths.sections}/${encodeURIComponent(id)}`)
}

export async function createTaskApi(body: CreateTaskBody): Promise<Task> {
  return apiRequest<Task>('POST', paths.tasks, { json: body })
}

export async function patchTaskApi(id: string, body: PatchTaskBody): Promise<Task> {
  return apiRequest<Task>('PATCH', `${paths.tasks}/${encodeURIComponent(id)}`, { json: body })
}

export async function deleteTaskApi(id: string): Promise<void> {
  await apiRequest<void>('DELETE', `${paths.tasks}/${encodeURIComponent(id)}`)
}
