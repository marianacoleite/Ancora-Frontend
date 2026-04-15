import { useDraggable } from '@dnd-kit/core'
import { Calendar, GripVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Task } from '../../types/models'
import { cn } from '../../lib/utils'
import { Avatar } from '../ui/Avatar'
import { StatusBadge, TagChip } from '../ui/Badge'
import { TaskStatusSelect } from '../ui/TaskStatusSelect'
import { Input } from '../ui/Input'

type TaskRowProps = {
  task: Task
  sectionName?: string
  showSection?: boolean
  onUpdateTitle: (id: string, title: string) => void
  onUpdateStatus?: (id: string, status: Task['status']) => void
  onDelete: (id: string) => void
}

export function TaskRow({
  task,
  sectionName,
  showSection,
  onUpdateTitle,
  onUpdateStatus,
  onDelete,
}: TaskRowProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { task },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'group border-b border-subtle/80 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]',
        isDragging && 'relative z-10 opacity-60',
      )}
    >
      <td className="w-10 px-3 py-3 align-middle">
        <button
          type="button"
          className="cursor-grab rounded-lg p-1 text-secondary-ink opacity-0 transition-opacity hover:bg-black/[0.05] group-hover:opacity-100 active:cursor-grabbing dark:hover:bg-white/[0.08]"
          {...listeners}
          {...attributes}
          aria-label="Arrastar tarefa"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-2 py-3 align-middle">
        {editing ? (
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              setEditing(false)
              if (title.trim() && title.trim() !== task.title) onUpdateTitle(task.id, title.trim())
              else setTitle(task.title)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              if (e.key === 'Escape') {
                setTitle(task.title)
                setEditing(false)
              }
            }}
            className="py-2"
          />
        ) : (
          <button
            type="button"
            className="flex w-full items-start gap-2 text-left text-sm font-medium text-primary-ink"
            onClick={() => setEditing(true)}
          >
            <span className="pt-0.5">{task.title}</span>
            <Pencil className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary-ink opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        )}
      </td>
      {showSection && (
        <td className="hidden px-3 py-3 align-middle lg:table-cell">
          <span className="text-sm text-secondary-ink">{sectionName ?? '—'}</span>
        </td>
      )}
      <td className="px-3 py-3 align-middle">
        {onUpdateStatus ? (
          <TaskStatusSelect
            value={task.status}
            onChange={(status) => onUpdateStatus(task.id, status)}
            variant="compact"
          />
        ) : (
          <StatusBadge status={task.status} />
        )}
      </td>
      <td className="hidden px-3 py-3 align-middle md:table-cell">
        <div className="flex max-w-[200px] flex-wrap gap-1">
          {task.tags.length === 0 ? (
            <span className="text-xs text-secondary-ink/70">—</span>
          ) : (
            task.tags.map((t) => <TagChip key={t} label={t} />)
          )}
        </div>
      </td>
      <td className="hidden max-w-[220px] px-3 py-3 align-middle sm:table-cell">
        {task.assigneeName ? (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={task.assigneeName} className="shrink-0" />
            <span className="min-w-0 break-words text-sm text-secondary-ink">{task.assigneeName}</span>
          </div>
        ) : (
          <span className="text-xs text-secondary-ink">—</span>
        )}
      </td>
      <td className="hidden px-3 py-3 align-middle md:table-cell">
        {task.dueDate ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-secondary-ink">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(task.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
          </span>
        ) : (
          <span className="text-xs text-secondary-ink">—</span>
        )}
      </td>
      <td className="w-12 px-2 py-3 align-middle">
        <button
          type="button"
          className="rounded-lg p-2 text-secondary-ink opacity-0 transition-all hover:bg-red-500/10 hover:text-red-600 group-hover:opacity-100 dark:hover:text-red-400"
          onClick={() => onDelete(task.id)}
          aria-label="Excluir tarefa"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}
