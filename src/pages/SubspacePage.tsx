import {
  DndContext,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { Kanban, LayoutList, Layers, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useParams, NavLink } from 'react-router-dom'
import { toast } from 'sonner'
import { SectionCard } from '../components/sections/SectionCard'
import type { AppShellOutletContext } from '../components/layout/AppShell'
import { TopNavbar } from '../components/layout/TopNavbar'
import { TaskRow } from '../components/tasks/TaskRow'
import { TasksTableShell } from '../components/tasks/TasksTableShell'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { TaskStatusSelect } from '../components/ui/TaskStatusSelect'
import { useAppData } from '../contexts/AppDataContext'
import type { TaskStatus } from '../types/models'
import { cn } from '../lib/utils'

type ViewMode = 'grouped' | 'table'

const emptyIllustration = (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-subtle bg-[var(--surface-muted)]/40 px-8 py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <Sparkles className="h-7 w-7" />
    </div>
    <h3 className="text-lg font-semibold text-primary-ink">Nenhuma tarefa ainda</h3>
    <p className="mt-2 max-w-sm text-sm text-secondary-ink">
      Crie sua primeira tarefa ou organize por seções — tudo fica visível aqui.
    </p>
  </div>
)

export function SubspacePage() {
  const { workspaceId, subspaceId } = useParams()
  const navigate = useNavigate()
  const ctx = useOutletContext<AppShellOutletContext>()
  const {
    data,
    loading,
    addSection,
    renameSection,
    deleteSection,
    addTask,
    updateTask,
    deleteTask,
    moveTaskToSection,
    addSubspace,
    deleteSubspace,
    renameWorkspace,
  } = useAppData()

  const [search, setSearch] = useState('')
  const [view, setView] = useState<ViewMode>('grouped')

  const [taskModal, setTaskModal] = useState(false)
  const [sectionModal, setSectionModal] = useState(false)
  const [subModal, setSubModal] = useState(false)
  const [deleteSubModal, setDeleteSubModal] = useState(false)

  const [taskTitle, setTaskTitle] = useState('')
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('pending')
  const [taskTags, setTaskTags] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskDue, setTaskDue] = useState('')
  const [taskSectionId, setTaskSectionId] = useState<string>('')

  const [sectionName, setSectionName] = useState('')
  const [subName, setSubName] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const workspace = useMemo(
    () => data?.workspaces.find((w) => w.id === workspaceId),
    [data?.workspaces, workspaceId],
  )
  const subspace = useMemo(
    () => data?.subspaces.find((s) => s.id === subspaceId),
    [data?.subspaces, subspaceId],
  )

  const sections = useMemo(() => {
    if (!data || !subspaceId) return []
    return data.sections
      .filter((s) => s.subspaceId === subspaceId)
      .sort((a, b) => a.order - b.order)
  }, [data, subspaceId])

  const sectionMap = useMemo(() => {
    const m = new Map<string, string>()
    sections.forEach((s) => m.set(s.id, s.name))
    return m
  }, [sections])

  const tasks = useMemo(() => {
    if (!data || !subspaceId) return []
    return data.tasks
      .filter((t) => t.subspaceId === subspaceId)
      .sort((a, b) => {
        if (a.sectionId !== b.sectionId) return a.sectionId.localeCompare(b.sectionId)
        return a.order - b.order
      })
  }, [data, subspaceId])

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tasks
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags.some((x) => x.toLowerCase().includes(q)) ||
        (t.assigneeName && t.assigneeName.toLowerCase().includes(q)),
    )
  }, [tasks, search])

  useEffect(() => {
    if (sections[0] && !taskSectionId) setTaskSectionId(sections[0].id)
  }, [sections, taskSectionId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setTaskModal(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return
      const aid = String(active.id)
      const oid = String(over.id)
      if (!aid.startsWith('task-') || !oid.startsWith('section-')) return
      const taskId = aid.replace('task-', '')
      const newSectionId = oid.replace('section-', '')
      const task = tasks.find((t) => t.id === taskId)
      if (!task || task.sectionId === newSectionId) return
      const inTarget = tasks.filter((t) => t.sectionId === newSectionId && t.id !== taskId)
      const nextOrder =
        inTarget.length === 0 ? Date.now() : Math.max(...inTarget.map((t) => t.order)) + 1
      try {
        await moveTaskToSection(taskId, newSectionId, nextOrder)
        toast.success('Tarefa movida')
      } catch {
        toast.error('Não foi possível mover')
      }
    },
    [moveTaskToSection, tasks],
  )

  if (loading || !data) {
    return (
      <div className="surface-page px-4 py-8 md:px-10">
        <Skeleton className="mb-6 h-12 w-full max-w-xl rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (!workspaceId || !subspaceId || !workspace || !subspace) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center text-secondary-ink">
        Subespaço não encontrado.
      </div>
    )
  }

  const subsInWs = data.subspaces
    .filter((s) => s.workspaceId === workspaceId)
    .sort((a, b) => a.order - b.order)

  const handleDeleteSubspace = async () => {
    if (!subspaceId || !workspaceId) return
    const others = subsInWs.filter((s) => s.id !== subspaceId)
    try {
      await deleteSubspace(subspaceId)
      setDeleteSubModal(false)
      if (others.length > 0) {
        navigate(`/w/${workspaceId}/s/${others[0].id}`, { replace: true })
      } else {
        navigate(`/w/${workspaceId}`, { replace: true })
      }
    } catch {
      toast.error('Não foi possível excluir o subespaço')
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-h-dvh w-full min-w-0 surface-page">
        <TopNavbar
          workspaceName={workspace.name}
          subspaceName={subspace.name}
          onOpenMobileSidebar={ctx?.openMobileSidebar}
          searchQuery={search}
          onSearchChange={setSearch}
          onRenameWorkspace={(name) => renameWorkspace(workspaceId, name)}
        />

        <div className="px-4 pt-2 md:px-10">
          <div className="flex min-w-0 items-center gap-2 pb-3.5">
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {subsInWs.map((s) => (
                <NavLink
                  key={s.id}
                  to={`/w/${workspaceId}/s/${s.id}`}
                  onClick={() => ctx?.closeMobileSidebar?.()}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex shrink-0 items-center whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/12 text-primary'
                        : 'text-secondary-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                    )
                  }
                >
                  {s.name}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => setSubModal(true)}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" />
                Subespaço
              </button>
            </div>
            <button
              type="button"
              onClick={() => setDeleteSubModal(true)}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-red-500/25 bg-red-500/[0.06] px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400',
              )}
              title="Excluir este subespaço"
              aria-label="Excluir subespaço"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Excluir</span>
            </button>
          </div>
          <div className="border-t border-subtle" aria-hidden />
        </div>

        <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="min-w-0 shrink">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary-ink">
                Subespaço
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-primary-ink">
                {subspace.name}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-secondary-ink">
                Visualize e organize tarefas por seção. Arraste linhas entre blocos para repriorizar.
              </p>
            </div>
            <div className="flex min-w-0 max-w-full flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-color:var(--border-subtle)_transparent] [scrollbar-width:thin]">
              <Button type="button" variant="secondary" className="shrink-0" onClick={() => setSectionModal(true)}>
                <Layers className="h-4 w-4" />
                Nova seção
              </Button>
              <Button type="button" className="shrink-0" onClick={() => setTaskModal(true)}>
                <Plus className="h-4 w-4" />
                Nova tarefa
              </Button>
              <div className="flex shrink-0 rounded-2xl border border-subtle bg-[var(--surface-muted)]/50 p-1">
                <button
                  type="button"
                  title="Agrupado por seção"
                  onClick={() => setView('grouped')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    view === 'grouped'
                      ? 'surface-card shadow-soft text-primary-ink'
                      : 'text-secondary-ink hover:text-primary-ink',
                  )}
                >
                  <Kanban className="h-4 w-4" />
                  Agrupado
                </button>
                <button
                  type="button"
                  title="Tabela única"
                  onClick={() => setView('table')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    view === 'table'
                      ? 'surface-card shadow-soft text-primary-ink'
                      : 'text-secondary-ink hover:text-primary-ink',
                  )}
                >
                  <LayoutList className="h-4 w-4" />
                  Tabela
                </button>
              </div>
            </div>
          </motion.div>

          {sections.length === 0 ? (
            emptyIllustration
          ) : view === 'grouped' ? (
            <div className="flex flex-col gap-8">
              {sections.map((sec) => {
                const secTasks = filteredTasks.filter((t) => t.sectionId === sec.id)
                return (
                  <SectionCard
                    key={sec.id}
                    section={sec}
                    onRename={(id, name) => void renameSection(id, name)}
                    onDelete={(id) => void deleteSection(id)}
                  >
                    {secTasks.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-secondary-ink">
                        Solte tarefas aqui ou crie uma nova.
                      </p>
                    ) : (
                      <TasksTableShell>
                        {secTasks.map((t) => (
                          <TaskRow
                            key={t.id}
                            task={t}
                            onUpdateTitle={(id, title) => void updateTask(id, { title })}
                            onUpdateStatus={(id, status) => void updateTask(id, { status })}
                            onDelete={(id) => void deleteTask(id)}
                          />
                        ))}
                      </TasksTableShell>
                    )}
                  </SectionCard>
                )
              })}
            </div>
          ) : (
            <TasksTableShell showSectionColumn>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    {emptyIllustration}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    showSection
                    sectionName={sectionMap.get(t.sectionId)}
                    onUpdateTitle={(id, title) => void updateTask(id, { title })}
                    onUpdateStatus={(id, status) => void updateTask(id, { status })}
                    onDelete={(id) => void deleteTask(id)}
                  />
                ))
              )}
            </TasksTableShell>
          )}
        </div>
      </div>

      <Modal
        open={taskModal}
        onClose={() => setTaskModal(false)}
        title="Nova tarefa"
        description="Atalho: tecla N (fora de campos de texto)."
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const sid = taskSectionId || sections[0]?.id
            if (!sid) return
            await addTask(workspaceId, subspaceId, sid, {
              title: taskTitle,
              status: taskStatus,
              tags: taskTags
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean),
              assigneeName: taskAssignee.trim() || null,
              dueDate: taskDue || null,
            })
            setTaskTitle('')
            setTaskTags('')
            setTaskAssignee('')
            setTaskDue('')
            setTaskModal(false)
          }}
        >
          <Input
            placeholder="Título"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />
          {sections.length > 0 && (
            <label className="text-xs font-medium text-secondary-ink">
              Seção
              <select
                className="mt-1 w-full rounded-2xl border border-subtle bg-[var(--surface-card)] px-4 py-3 text-sm"
                value={taskSectionId || sections[0].id}
                onChange={(e) => setTaskSectionId(e.target.value)}
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block text-xs font-medium text-secondary-ink">
            Status
            <div className="mt-1">
              <TaskStatusSelect
                variant="comfortable"
                value={taskStatus}
                onChange={(v) => setTaskStatus(v)}
              />
            </div>
          </label>
          <Input
            placeholder="Tags (separadas por vírgula)"
            value={taskTags}
            onChange={(e) => setTaskTags(e.target.value)}
          />
          <Input
            placeholder="Responsável (nome)"
            value={taskAssignee}
            onChange={(e) => setTaskAssignee(e.target.value)}
          />
          <Input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setTaskModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar tarefa</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={sectionModal}
        onClose={() => setSectionModal(false)}
        title="Nova seção"
        description="Blocos estilo Notion para agrupar trabalho."
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            await addSection(workspaceId, subspaceId, sectionName)
            setSectionName('')
            setSectionModal(false)
          }}
        >
          <Input
            autoFocus
            placeholder="Nome da seção"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setSectionModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar seção</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteSubModal}
        onClose={() => setDeleteSubModal(false)}
        title="Excluir subespaço"
        description={
          subsInWs.length === 1
            ? 'Este é o único subespaço deste espaço. Todas as seções e tarefas serão removidas permanentemente.'
            : 'Todas as seções e tarefas deste subespaço serão removidas permanentemente. Esta ação não pode ser desfeita.'
        }
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setDeleteSubModal(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" onClick={() => void handleDeleteSubspace()}>
            Excluir
          </Button>
        </div>
      </Modal>

      <Modal open={subModal} onClose={() => setSubModal(false)} title="Novo subespaço">
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const sid = await addSubspace(workspaceId, subName)
            setSubName('')
            setSubModal(false)
            if (sid) navigate(`/w/${workspaceId}/s/${sid}`)
          }}
        >
          <Input
            autoFocus
            placeholder="Nome"
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setSubModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar</Button>
          </div>
        </form>
      </Modal>
    </DndContext>
  )
}
