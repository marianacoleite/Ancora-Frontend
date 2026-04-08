import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import type { AppData, Section, Subspace, Task, TaskStatus, Workspace } from '../types/models'
import { useAuth } from './AuthContext'
import { isFirebaseConfigured } from '../services/firebase/config'
import {
  createSectionRecord,
  createSubspaceRecord,
  createTaskRecord,
  createWorkspaceRecord,
  fsDeleteSection,
  fsDeleteSubspace,
  fsDeleteTask,
  fsDeleteWorkspace,
  fsUpdateTask,
  fsUpsertSection,
  fsUpsertSubspace,
  fsUpsertTask,
  fsUpsertWorkspace,
  subscribeAppData,
} from '../services/data/firestoreApi'
import { newId } from '../services/data/id'
import { createSeedData } from '../services/local/demoData'
import { loadLocalData, saveLocalData } from '../services/local/storage'

type AppDataContextValue = {
  data: AppData | null
  loading: boolean
  /** Modo offline/local (sem Firebase configurado) */
  isLocal: boolean
  addWorkspace: (name: string) => Promise<string | null>
  renameWorkspace: (id: string, name: string) => Promise<void>
  deleteWorkspace: (id: string) => Promise<void>
  addSubspace: (workspaceId: string, name: string) => Promise<string | null>
  renameSubspace: (id: string, name: string) => Promise<void>
  deleteSubspace: (id: string) => Promise<void>
  addSection: (workspaceId: string, subspaceId: string, name: string) => Promise<void>
  renameSection: (id: string, name: string) => Promise<void>
  deleteSection: (id: string) => Promise<void>
  addTask: (
    workspaceId: string,
    subspaceId: string,
    sectionId: string,
    input: {
      title: string
      status: TaskStatus
      tags: string[]
      assigneeName: string | null
      dueDate: string | null
    },
  ) => Promise<void>
  updateTask: (
    id: string,
    patch: Partial<
      Pick<Task, 'title' | 'status' | 'tags' | 'assigneeName' | 'dueDate' | 'sectionId' | 'order'>
    >,
  ) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTaskToSection: (taskId: string, newSectionId: string, newOrder: number) => Promise<void>
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

function nextOrder(items: { order: number }[]): number {
  if (items.length === 0) return 0
  return Math.max(...items.map((i) => i.order)) + 1
}

function cascadeDeleteWorkspace(data: AppData, wid: string): AppData {
  const subIds = new Set(data.subspaces.filter((s) => s.workspaceId === wid).map((s) => s.id))
  const secIds = new Set(
    data.sections.filter((s) => subIds.has(s.subspaceId)).map((s) => s.id),
  )
  return {
    workspaces: data.workspaces.filter((w) => w.id !== wid),
    subspaces: data.subspaces.filter((s) => s.workspaceId !== wid),
    sections: data.sections.filter((s) => !subIds.has(s.subspaceId)),
    tasks: data.tasks.filter((t) => !secIds.has(t.sectionId) && t.workspaceId !== wid),
  }
}

function cascadeDeleteSubspace(data: AppData, sid: string): AppData {
  const secIds = new Set(data.sections.filter((s) => s.subspaceId === sid).map((s) => s.id))
  return {
    ...data,
    subspaces: data.subspaces.filter((s) => s.id !== sid),
    sections: data.sections.filter((s) => s.subspaceId !== sid),
    tasks: data.tasks.filter((t) => !secIds.has(t.sectionId)),
  }
}

function cascadeDeleteSection(data: AppData, secId: string): AppData {
  return {
    ...data,
    sections: data.sections.filter((s) => s.id !== secId),
    tasks: data.tasks.filter((t) => t.sectionId !== secId),
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const isCloud = isFirebaseConfigured()
  const isLocal = !isCloud

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setData(null)
      setLoading(false)
      return
    }

    if (!isCloud) {
      let loaded = loadLocalData()
      if (!loaded || loaded.workspaces.length === 0) {
        loaded = createSeedData(user.uid)
        saveLocalData(loaded)
      }
      setData(loaded)
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = subscribeAppData(
      user.uid,
      (d) => {
        setData(d)
        setLoading(false)
      },
      (e) => {
        toast.error(e.message)
        setLoading(false)
      },
    )
    return () => unsub()
  }, [user, authLoading, isCloud])

  useEffect(() => {
    if (isLocal && data && user) {
      saveLocalData(data)
    }
  }, [data, isLocal, user])

  const withLocal = useCallback(
    (fn: (prev: AppData) => AppData) => {
      setData((prev) => {
        if (!prev) return prev
        return fn(prev)
      })
    },
    [],
  )

  const addWorkspace = useCallback(
    async (name: string): Promise<string | null> => {
      if (!user) return null
      const trimmed = name.trim()
      if (!trimmed) return null
      if (isCloud) {
        const order = data ? nextOrder(data.workspaces) : 0
        const ws = createWorkspaceRecord(user.uid, trimmed, order)
        try {
          await fsUpsertWorkspace(ws)
          toast.success('Espaço criado')
          return ws.id
        } catch (e) {
          toast.error(String(e))
          return null
        }
      }
      const wid = newId()
      withLocal((prev) => {
        const order = nextOrder(prev.workspaces)
        const w: Workspace = {
          id: wid,
          name: trimmed,
          userId: user.uid,
          order,
          createdAt: Date.now(),
        }
        return { ...prev, workspaces: [...prev.workspaces, w] }
      })
      toast.success('Espaço criado')
      return wid
    },
    [user, isCloud, withLocal, data],
  )

  const renameWorkspace = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed || !user) return
      if (isCloud) {
        const w = data?.workspaces.find((x) => x.id === id)
        if (!w) return
        await fsUpsertWorkspace({ ...w, name: trimmed })
        toast.success('Espaço renomeado')
        return
      }
      withLocal((prev) => ({
        ...prev,
        workspaces: prev.workspaces.map((w) => (w.id === id ? { ...w, name: trimmed } : w)),
      }))
      toast.success('Espaço renomeado')
    },
    [user, isCloud, data?.workspaces, withLocal],
  )

  const deleteWorkspace = useCallback(
    async (id: string) => {
      if (!user) return
      if (isCloud) {
        const ws = data?.workspaces.find((w) => w.id === id)
        if (!ws) return
        const subs = data?.subspaces.filter((s) => s.workspaceId === id) ?? []
        const secs =
          data?.sections.filter((s) => subs.some((sub) => sub.id === s.subspaceId)) ?? []
        const tasks = data?.tasks.filter((t) => t.workspaceId === id) ?? []
        await Promise.all([
          ...tasks.map((t) => fsDeleteTask(t.id)),
          ...secs.map((s) => fsDeleteSection(s.id)),
          ...subs.map((s) => fsDeleteSubspace(s.id)),
          fsDeleteWorkspace(id),
        ])
        return
      }
      withLocal((prev) => cascadeDeleteWorkspace(prev, id))
      toast.success('Espaço removido')
    },
    [user, isCloud, data, withLocal],
  )

  const addSubspace = useCallback(
    async (workspaceId: string, name: string): Promise<string | null> => {
      if (!user) return null
      const trimmed = name.trim()
      if (!trimmed) return null
      if (isCloud) {
        const subs = data?.subspaces.filter((s) => s.workspaceId === workspaceId) ?? []
        const order = nextOrder(subs)
        const s = createSubspaceRecord(user.uid, workspaceId, trimmed)
        const row: Subspace = { ...s, order }
        await fsUpsertSubspace(row)
        toast.success('Subespaço criado')
        return row.id
      }
      const sid = newId()
      withLocal((prev) => {
        const subs = prev.subspaces.filter((s) => s.workspaceId === workspaceId)
        const order = nextOrder(subs)
        const row: Subspace = {
          id: sid,
          workspaceId,
          userId: user.uid,
          name: trimmed,
          order,
          createdAt: Date.now(),
        }
        return { ...prev, subspaces: [...prev.subspaces, row] }
      })
      toast.success('Subespaço criado')
      return sid
    },
    [user, isCloud, data?.subspaces, withLocal],
  )

  const renameSubspace = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed || !user) return
      if (isCloud) {
        const s = data?.subspaces.find((x) => x.id === id)
        if (!s) return
        await fsUpsertSubspace({ ...s, name: trimmed })
        return
      }
      withLocal((prev) => ({
        ...prev,
        subspaces: prev.subspaces.map((s) => (s.id === id ? { ...s, name: trimmed } : s)),
      }))
    },
    [user, isCloud, data?.subspaces, withLocal],
  )

  const deleteSubspace = useCallback(
    async (id: string) => {
      if (!user) return
      if (isCloud) {
        const secs = data?.sections.filter((s) => s.subspaceId === id) ?? []
        const tasks = data?.tasks.filter((t) => t.subspaceId === id) ?? []
        await Promise.all([
          ...tasks.map((t) => fsDeleteTask(t.id)),
          ...secs.map((s) => fsDeleteSection(s.id)),
          fsDeleteSubspace(id),
        ])
        toast.success('Subespaço removido')
        return
      }
      withLocal((prev) => cascadeDeleteSubspace(prev, id))
      toast.success('Subespaço removido')
    },
    [user, isCloud, data, withLocal],
  )

  const addSection = useCallback(
    async (workspaceId: string, subspaceId: string, name: string) => {
      if (!user) return
      const trimmed = name.trim()
      if (!trimmed) return
      if (isCloud) {
        const secs = data?.sections.filter((s) => s.subspaceId === subspaceId) ?? []
        const order = nextOrder(secs)
        const s = createSectionRecord(user.uid, workspaceId, subspaceId, trimmed)
        const row: Section = { ...s, order }
        await fsUpsertSection(row)
        return
      }
      withLocal((prev) => {
        const secs = prev.sections.filter((s) => s.subspaceId === subspaceId)
        const order = nextOrder(secs)
        const row: Section = {
          id: newId(),
          subspaceId,
          workspaceId,
          userId: user.uid,
          name: trimmed,
          order,
          createdAt: Date.now(),
        }
        return { ...prev, sections: [...prev.sections, row] }
      })
      toast.success('Seção criada')
    },
    [user, isCloud, data?.sections, withLocal],
  )

  const renameSection = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed || !user) return
      if (isCloud) {
        const s = data?.sections.find((x) => x.id === id)
        if (!s) return
        await fsUpsertSection({ ...s, name: trimmed })
        return
      }
      withLocal((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => (s.id === id ? { ...s, name: trimmed } : s)),
      }))
    },
    [user, isCloud, data?.sections, withLocal],
  )

  const deleteSection = useCallback(
    async (id: string) => {
      if (!user) return
      if (isCloud) {
        const tasks = data?.tasks.filter((t) => t.sectionId === id) ?? []
        await Promise.all([...tasks.map((t) => fsDeleteTask(t.id)), fsDeleteSection(id)])
        return
      }
      withLocal((prev) => cascadeDeleteSection(prev, id))
      toast.success('Seção removida')
    },
    [user, isCloud, data?.tasks, withLocal],
  )

  const addTask = useCallback(
    async (
      workspaceId: string,
      subspaceId: string,
      sectionId: string,
      input: {
        title: string
        status: TaskStatus
        tags: string[]
        assigneeName: string | null
        dueDate: string | null
      },
    ) => {
      if (!user) return
      const title = input.title.trim()
      if (!title) return
      if (isCloud) {
        const inSection = data?.tasks.filter((t) => t.sectionId === sectionId) ?? []
        const order = nextOrder(inSection)
        const t = createTaskRecord(
          user.uid,
          workspaceId,
          subspaceId,
          sectionId,
          title,
          input.status,
          input.tags,
          input.assigneeName,
          input.dueDate,
        )
        const row: Task = { ...t, order }
        await fsUpsertTask(row)
        return
      }
      withLocal((prev) => {
        const inSection = prev.tasks.filter((t) => t.sectionId === sectionId)
        const order = nextOrder(inSection)
        const row: Task = {
          id: newId(),
          sectionId,
          subspaceId,
          workspaceId,
          userId: user.uid,
          title,
          status: input.status,
          tags: input.tags,
          assigneeName: input.assigneeName,
          dueDate: input.dueDate,
          order,
          createdAt: Date.now(),
        }
        return { ...prev, tasks: [...prev.tasks, row] }
      })
      toast.success('Tarefa criada')
    },
    [user, isCloud, data?.tasks, withLocal],
  )

  const updateTask = useCallback(
    async (
      id: string,
      patch: Partial<
        Pick<Task, 'title' | 'status' | 'tags' | 'assigneeName' | 'dueDate' | 'sectionId' | 'order'>
      >,
    ) => {
      if (!user) return
      if (isCloud) {
        await fsUpdateTask(id, patch)
        return
      }
      withLocal((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }))
    },
    [user, isCloud, withLocal],
  )

  const deleteTask = useCallback(
    async (id: string) => {
      if (isCloud) {
        await fsDeleteTask(id)
        return
      }
      withLocal((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }))
      toast.success('Tarefa removida')
    },
    [isCloud, withLocal],
  )

  const moveTaskToSection = useCallback(
    async (taskId: string, newSectionId: string, newOrder: number) => {
      if (isCloud) {
        await fsUpdateTask(taskId, { sectionId: newSectionId, order: newOrder })
        return
      }
      withLocal((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, sectionId: newSectionId, order: newOrder } : t,
        ),
      }))
    },
    [isCloud, withLocal],
  )

  const value = useMemo(
    (): AppDataContextValue => ({
      data,
      loading: authLoading || loading,
      isLocal,
      addWorkspace,
      renameWorkspace,
      deleteWorkspace,
      addSubspace,
      renameSubspace,
      deleteSubspace,
      addSection,
      renameSection,
      deleteSection,
      addTask,
      updateTask,
      deleteTask,
      moveTaskToSection,
    }),
    [
      data,
      authLoading,
      loading,
      isLocal,
      addWorkspace,
      renameWorkspace,
      deleteWorkspace,
      addSubspace,
      renameSubspace,
      deleteSubspace,
      addSection,
      renameSection,
      deleteSection,
      addTask,
      updateTask,
      deleteTask,
      moveTaskToSection,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
