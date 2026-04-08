import { useDroppable } from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Section } from '../../types/models'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type SectionCardProps = {
  section: Section
  children: ReactNode
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export function SectionCard({ section, children, onRename, onDelete }: SectionCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(section.name)

  const { setNodeRef, isOver } = useDroppable({
    id: `section-${section.id}`,
    data: { sectionId: section.id },
  })

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-subtle/90 bg-[var(--surface-muted)]/50 p-1 shadow-soft dark:bg-slate-800/40"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-2 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          {editing ? (
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                setEditing(false)
                if (name.trim() && name.trim() !== section.name) onRename(section.id, name.trim())
                else setName(section.name)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') {
                  setName(section.name)
                  setEditing(false)
                }
              }}
              className="max-w-md py-2 text-lg font-semibold"
            />
          ) : (
            <>
              <h2 className="truncate text-xl font-semibold tracking-tight text-primary-ink">
                {section.name}
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 rounded-xl p-2"
                onClick={() => setEditing(true)}
                aria-label="Editar nome da seção"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-500/10 dark:text-red-400"
          onClick={() => onDelete(section.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'rounded-xl border border-dashed border-transparent px-2 pb-3 transition-colors',
          isOver && 'border-primary/40 bg-primary/5',
        )}
      >
        <AnimatePresence mode="popLayout">{children}</AnimatePresence>
      </div>
    </motion.section>
  )
}
