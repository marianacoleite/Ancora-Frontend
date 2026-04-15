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
import {
  createSectionApi,
  createSubspaceApi,
  createTaskApi,
  createWorkspaceApi,
  deleteSectionApi,
  deleteSubspaceApi,
  deleteTaskApi,
  deleteWorkspaceApi,
  fetchAppData,
  patchSectionApi,
  patchSubspaceApi,
  patchTaskApi,
  patchWorkspaceApi,
} from '../services/api/appDataApi'
import { getAccessToken } from '../services/api/token'
import { newId } from '../services/data/id'
import { createSeedData } from '../services/local/demoData'
import { loadLocalData, saveLocalData } from '../services/local/storage'

type AppDataContextValue = {
  data: AppData | null
  loading: boolean
  /** true = localStorage; false = API + servidor */
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
      Pick<
        Task,
        | 'title'
        | 'status'
        | 'tags'
        | 'assigneeName'
        | 'dueDate'
        | 'sectionId'
        | 'subspaceId'
        | 'workspaceId'
        | 'order'
      >
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
  const { user, loading: authLoading, mode } = useAuth()
  const isLocal = mode === 'local'
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshRemote = useCallback(async () => {
    const d = await fetchAppData()
    setData(d)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setData(null)
      setLoading(false)
      return
    }

    if (isLocal) {
      let loaded = loadLocalData()
      if (!loaded || loaded.workspaces.length === 0) {
        loaded = createSeedData(user.uid)
        saveLocalData(loaded)
      }
      setData(loaded)
      setLoading(false)
      return
    }

    if (!getAccessToken()) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    fetchAppData()
      .then(setData)
      .catch((e: unknown) => {
        toast.error(e instanceof Error ? e.message : String(e))
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [user, authLoading, isLocal])

  useEffect(() => {
    if (isLocal && data && user) {
      saveLocalData(data)
    }
  }, [data, isLocal, user])

  const withLocal = useCallback((fn: (prev: AppData) => AppData) => {
    setData((prev) => {
      if (!prev) return prev
      return fn(prev)
    })
  }, [])

  const addWorkspace = useCallback(
    async (name: string): Promise<string | null> => {
      if (!user) return null
      const trimmed = name.trim()
      if (!trimmed) return null

      if (isLocal) {
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
      }

      try {
        const order = data ? nextOrder(data.workspaces) : 0
        const w = await createWorkspaceApi({ name: trimmed, order })
        await refreshRemote()
        toast.success('Espaço criado')
        return w.id
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
        return null
      }
    },
    [user, isLocal, withLocal, data, refreshRemote],
  )

  const renameWorkspace = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed || !user) return
      if (isLocal) {
        withLocal((prev) => ({
          ...prev,
          workspaces: prev.workspaces.map((w) => (w.id === id ? { ...w, name: trimmed } : w)),
        }))
        toast.success('Espaço renomeado')
        return
      }
      try {
        await patchWorkspaceApi(id, { name: trimmed })
        await refreshRemote()
        toast.success('Espaço renomeado')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
      }
    },
    [user, isLocal, withLocal, refreshRemote],
  )

  const deleteWorkspace = useCallback(
    async (id: string) => {
      if (!user) return
      if (isLocal) {
        withLocal((prev) => cascadeDeleteWorkspace(prev, id))
        toast.success('Espaço removido')
        return
      }
      try {
        await deleteWorkspaceApi(id)
        await refreshRemote()
        toast.success('Espaço removido')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
      }
    },
    [user, isLocal, withLocal, refreshRemote],
  )

  const addSubspace = useCallback(
    async (workspaceId: string, name: string): Promise<string | null> => {
      if (!user) return null
      const trimmed = name.trim()
      if (!trimmed) return null
      if (isLocal) {
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
      }
      try {
        const subs = data?.subspaces.filter((s) => s.workspaceId === workspaceId) ?? []
        const order = nextOrder(subs)
        const s = await createSubspaceApi({ workspaceId, name: trimmed, order })
        await refreshRemote()
        toast.success('Subespaço criado')
        return s.id
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
        return null
      }
    },
    [user, isLocal, withLocal, data?.subspaces, refreshRemote],
  )

  const renameSubspace = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed || !user) return
      if (isLocal) {
        withLocal((prev) => ({
          ...prev,
          subspaces: prev.subspaces.map((s) => (s.id === id ? { ...s, name: trimmed } : s)),
        }))
        return
      }
      try {
        await patchSubspaceApi(id, { name: trimmed })
        await refreshRemote()
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
      }
    },
    [user, isLocal, withLocal, refreshRemote],
  )

  const deleteSubspace = useCallback(
    async (id: string) => {
      if (!user) return
      if (isLocal) {
        withLocal((prev) => cascadeDeleteSubspace(prev, id))
        toast.success('Subespaço removido')
        return
      }
      try {
        await deleteSubspaceApi(id)
        await refreshRemote()
        toast.success('Subespaço removido')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
      }
    },
    [user, isLocal, withLocal, refreshRemote],
  )

  const addSection = useCallback(
    async (workspaceId: string, subspaceId: string, name: string) => {
      if (!user) return
      const trimmed = name.trim()
      if (!trimmed) return
      if (isLocal) {
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
        return
      }
      try {
        const secs = data?.sections.filter((s) => s.subspaceId === subspaceId) ?? []
        const order = nextOrder(secs)
        await createSectionApi({ workspaceId, subspaceId, name: trimmed, order })
        await refreshRemote()
        toast.success('Seção criada')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
      }
    },
    [user, isLocal, withLocal, data?.sections, refreshRemote],
  )

  const renameSection = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed || !user) return
      if (isLocal) {
        withLocal((prev) => ({
          ...prev,
          sections: prev.sections.map((s) => (s.id === id ? { ...s, name: trimmed } : s)),
        }))
        return
      }
      try {
        await patchSectionApi(id, { name: trimmed })
        await refreshRemote()
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
      }
    },
    [user, isLocal, withLocal, refreshRemote],
  )

  const deleteSection = useCallback(
    async (id: string) => {
      if (!user) return
      if (isLocal) {
        withLocal((prev) => cascadeDeleteSection(prev, id))
        toast.success('Seção removida')
        return
      }
      try {
        await deleteSectionApi(id)
        await refreshRemote()
        toast.success('Seção removida')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
      }
    },
    [user, isLocal, withLocal, refreshRemote],
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
      if (isLocal) {
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
        return
      }
      try {
        const inSection = data?.tasks.filter((t) => t.sectionId === sectionId) ?? []
        const order = nextOrder(inSection)
        await createTaskApi({
          workspaceId,
          subspaceId,
          sectionId,
          title,
          status: input.status,
          tags: input.tags,
          assigneeName: input.assigneeName,
          dueDate: input.dueDate,
          order,
        })
        await refreshRemote()
        toast.success('Tarefa criada')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
      }
    },
    [user, isLocal, withLocal, data?.tasks, refreshRemote],
  )

  const updateTask = useCallback(
    async (
      id: string,
      patch: Partial<
        Pick<
          Task,
          | 'title'
          | 'status'
          | 'tags'
          | 'assigneeName'
          | 'dueDate'
          | 'sectionId'
          | 'subspaceId'
          | 'workspaceId'
          | 'order'
        >
      >,
    ) => {
      if (!user) return
      if (isLocal) {
        withLocal((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }))
        return
      }
      try {
        await patchTaskApi(id, patch)
        await refreshRemote()
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
      }
    },
    [user, isLocal, withLocal, refreshRemote],
  )

  const deleteTask = useCallback(
    async (id: string) => {
      if (isLocal) {
        withLocal((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }))
        toast.success('Tarefa removida')
        return
      }
      try {
        await deleteTaskApi(id)
        await refreshRemote()
        toast.success('Tarefa removida')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
      }
    },
    [isLocal, withLocal, refreshRemote],
  )

  const moveTaskToSection = useCallback(
    async (taskId: string, newSectionId: string, newOrder: number) => {
      const sec = data?.sections.find((s) => s.id === newSectionId)
      if (isLocal) {
        withLocal((prev) => {
          const s = prev.sections.find((x) => x.id === newSectionId)
          return {
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    sectionId: newSectionId,
                    order: newOrder,
                    ...(s ? { subspaceId: s.subspaceId, workspaceId: s.workspaceId } : {}),
                  }
                : t,
            ),
          }
        })
        return
      }
      try {
        await patchTaskApi(taskId, {
          sectionId: newSectionId,
          order: newOrder,
          ...(sec ? { subspaceId: sec.subspaceId, workspaceId: sec.workspaceId } : {}),
        })
        await refreshRemote()
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : String(e))
      }
    },
    [isLocal, withLocal, data?.sections, refreshRemote],
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
