import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import type { AppData, Section, Subspace, Task, Workspace } from '../../types/models'
import { getFirebaseDb } from '../firebase/config'
import { newId } from './id'

const CW = 'lampiao_workspaces'
const CS = 'lampiao_subspaces'
const CSEC = 'lampiao_sections'
const CT = 'lampiao_tasks'

function mapWorkspace(id: string, d: Record<string, unknown>): Workspace {
  return {
    id,
    name: String(d.name ?? ''),
    userId: String(d.userId ?? ''),
    order: Number(d.order ?? 0),
    createdAt: Number(d.createdAt ?? Date.now()),
  }
}

function mapSubspace(id: string, d: Record<string, unknown>): Subspace {
  return {
    id,
    workspaceId: String(d.workspaceId ?? ''),
    userId: String(d.userId ?? ''),
    name: String(d.name ?? ''),
    order: Number(d.order ?? 0),
    createdAt: Number(d.createdAt ?? Date.now()),
  }
}

function mapSection(id: string, d: Record<string, unknown>): Section {
  return {
    id,
    subspaceId: String(d.subspaceId ?? ''),
    workspaceId: String(d.workspaceId ?? ''),
    userId: String(d.userId ?? ''),
    name: String(d.name ?? ''),
    order: Number(d.order ?? 0),
    createdAt: Number(d.createdAt ?? Date.now()),
  }
}

function mapTask(id: string, d: Record<string, unknown>): Task {
  return {
    id,
    sectionId: String(d.sectionId ?? ''),
    subspaceId: String(d.subspaceId ?? ''),
    workspaceId: String(d.workspaceId ?? ''),
    userId: String(d.userId ?? ''),
    title: String(d.title ?? ''),
    status: (d.status as Task['status']) ?? 'pending',
    tags: Array.isArray(d.tags) ? (d.tags as string[]) : [],
    assigneeName: d.assigneeName != null ? String(d.assigneeName) : null,
    dueDate: d.dueDate != null ? String(d.dueDate) : null,
    order: Number(d.order ?? 0),
    createdAt: Number(d.createdAt ?? Date.now()),
  }
}

function sortByOrder<T extends { order: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => a.order - b.order)
}

export function subscribeAppData(
  userId: string,
  onData: (data: AppData) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb()
  let workspaces: Workspace[] = []
  let subspaces: Subspace[] = []
  let sections: Section[] = []
  let tasks: Task[] = []

  const emit = () => {
    const bySection = (a: Task, b: Task) => {
      if (a.sectionId !== b.sectionId) return a.sectionId.localeCompare(b.sectionId)
      return a.order - b.order
    }
    onData({
      workspaces: sortByOrder(workspaces),
      subspaces: sortByOrder(subspaces),
      sections: sortByOrder(sections),
      tasks: [...tasks].sort(bySection),
    })
  }

  const unsubs: Unsubscribe[] = []

  unsubs.push(
    onSnapshot(
      query(collection(db, CW), where('userId', '==', userId)),
      (snap) => {
        workspaces = snap.docs.map((d) => mapWorkspace(d.id, d.data() as Record<string, unknown>))
        emit()
      },
      (e) => onError?.(e as Error),
    ),
  )
  unsubs.push(
    onSnapshot(
      query(collection(db, CS), where('userId', '==', userId)),
      (snap) => {
        subspaces = snap.docs.map((d) => mapSubspace(d.id, d.data() as Record<string, unknown>))
        emit()
      },
      (e) => onError?.(e as Error),
    ),
  )
  unsubs.push(
    onSnapshot(
      query(collection(db, CSEC), where('userId', '==', userId)),
      (snap) => {
        sections = snap.docs.map((d) => mapSection(d.id, d.data() as Record<string, unknown>))
        emit()
      },
      (e) => onError?.(e as Error),
    ),
  )
  unsubs.push(
    onSnapshot(
      query(collection(db, CT), where('userId', '==', userId)),
      (snap) => {
        tasks = snap.docs.map((d) => mapTask(d.id, d.data() as Record<string, unknown>))
        emit()
      },
      (e) => onError?.(e as Error),
    ),
  )

  return () => unsubs.forEach((u) => u())
}

const dbRef = () => getFirebaseDb()

export async function fsUpsertWorkspace(w: Workspace): Promise<void> {
  await setDoc(doc(dbRef(), CW, w.id), {
    name: w.name,
    userId: w.userId,
    order: w.order,
    createdAt: w.createdAt,
  })
}

export async function fsDeleteWorkspace(id: string): Promise<void> {
  await deleteDoc(doc(dbRef(), CW, id))
}

export async function fsUpsertSubspace(s: Subspace): Promise<void> {
  await setDoc(doc(dbRef(), CS, s.id), {
    workspaceId: s.workspaceId,
    name: s.name,
    order: s.order,
    createdAt: s.createdAt,
    userId: s.userId,
  })
}

export async function fsDeleteSubspace(id: string): Promise<void> {
  await deleteDoc(doc(dbRef(), CS, id))
}

export async function fsUpsertSection(s: Section): Promise<void> {
  await setDoc(doc(dbRef(), CSEC, s.id), {
    subspaceId: s.subspaceId,
    workspaceId: s.workspaceId,
    name: s.name,
    order: s.order,
    createdAt: s.createdAt,
    userId: s.userId,
  })
}

export async function fsDeleteSection(id: string): Promise<void> {
  await deleteDoc(doc(dbRef(), CSEC, id))
}

export async function fsUpsertTask(t: Task): Promise<void> {
  await setDoc(doc(dbRef(), CT, t.id), {
    sectionId: t.sectionId,
    subspaceId: t.subspaceId,
    workspaceId: t.workspaceId,
    title: t.title,
    status: t.status,
    tags: t.tags,
    assigneeName: t.assigneeName,
    dueDate: t.dueDate,
    order: t.order,
    createdAt: t.createdAt,
    userId: t.userId,
  })
}

export async function fsDeleteTask(id: string): Promise<void> {
  await deleteDoc(doc(dbRef(), CT, id))
}

export async function fsUpdateTask(
  id: string,
  patch: Partial<Pick<Task, 'title' | 'status' | 'tags' | 'assigneeName' | 'dueDate' | 'order' | 'sectionId'>>,
): Promise<void> {
  await updateDoc(doc(dbRef(), CT, id), patch as Record<string, unknown>)
}

export function createWorkspaceRecord(userId: string, name: string, order: number): Workspace {
  const id = newId()
  const t = Date.now()
  return { id, name, userId, order, createdAt: t }
}

export function createSubspaceRecord(userId: string, workspaceId: string, name: string): Subspace {
  const id = newId()
  const t = Date.now()
  return { id, workspaceId, name, order: t, createdAt: t, userId }
}

export function createSectionRecord(
  userId: string,
  workspaceId: string,
  subspaceId: string,
  name: string,
): Section {
  const id = newId()
  const t = Date.now()
  return { id, subspaceId, workspaceId, name, order: t, createdAt: t, userId }
}

export function createTaskRecord(
  userId: string,
  workspaceId: string,
  subspaceId: string,
  sectionId: string,
  title: string,
  status: Task['status'],
  tags: string[],
  assigneeName: string | null,
  dueDate: string | null,
): Task {
  const id = newId()
  const t = Date.now()
  return {
    id,
    sectionId,
    subspaceId,
    workspaceId,
    title,
    status,
    tags,
    assigneeName,
    dueDate,
    order: t,
    createdAt: t,
    userId,
  }
}
