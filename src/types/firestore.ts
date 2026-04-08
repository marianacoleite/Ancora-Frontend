/**
 * Contrato Firestore para o backend: coleções, campos gravados por documento
 * (o id da entidade é sempre o document id; não há campo `id` no payload).
 */
import type { AppData, Section, Subspace, Task, TaskStatus, Workspace } from './models'

export { type AppData, type Section, type Subspace, type Task, type TaskStatus, type Workspace }

/** Nomes das coleções (mesmos usados no cliente). */
export const FIRESTORE_COLLECTIONS = {
  workspaces: 'ancora_workspaces',
  subspaces: 'ancora_subspaces',
  sections: 'ancora_sections',
  tasks: 'ancora_tasks',
} as const

export type FirestoreCollectionName = (typeof FIRESTORE_COLLECTIONS)[keyof typeof FIRESTORE_COLLECTIONS]

/** Payload em `ancora_workspaces/{workspaceId}` */
export interface FirestoreWorkspaceData {
  name: string
  userId: string
  order: number
  createdAt: number
}

/** Payload em `ancora_subspaces/{subspaceId}` */
export interface FirestoreSubspaceData {
  workspaceId: string
  userId: string
  name: string
  order: number
  createdAt: number
}

/** Payload em `ancora_sections/{sectionId}` */
export interface FirestoreSectionData {
  subspaceId: string
  workspaceId: string
  userId: string
  name: string
  order: number
  createdAt: number
}

/** Payload em `ancora_tasks/{taskId}` */
export interface FirestoreTaskData {
  sectionId: string
  subspaceId: string
  workspaceId: string
  userId: string
  title: string
  status: TaskStatus
  tags: string[]
  assigneeName: string | null
  dueDate: string | null
  order: number
  createdAt: number
}

/** Campos que podem ser atualizados parcialmente em tasks (updateDoc). */
export type FirestoreTaskUpdateFields = Partial<
  Pick<FirestoreTaskData, 'title' | 'status' | 'tags' | 'assigneeName' | 'dueDate' | 'order' | 'sectionId'>
>

/** Queries usadas no cliente: todas filtram por `userId`. */
export const FIRESTORE_USER_ID_FIELD = 'userId' as const
