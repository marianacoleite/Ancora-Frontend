import type { ReactNode } from 'react'

export function TasksTableShell({
  children,
  showSectionColumn,
}: {
  children: ReactNode
  showSectionColumn?: boolean
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-subtle surface-card shadow-soft">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-subtle bg-[var(--surface-muted)]/60 text-xs font-semibold uppercase tracking-wide text-secondary-ink">
            <th className="w-10 px-3 py-3" aria-hidden />
            <th className="px-2 py-3">Tarefa</th>
            {showSectionColumn && (
              <th className="hidden px-3 py-3 lg:table-cell">Seção</th>
            )}
            <th className="px-3 py-3">Status</th>
            <th className="hidden px-3 py-3 md:table-cell">Tags</th>
            <th className="hidden px-3 py-3 sm:table-cell">Resp.</th>
            <th className="hidden px-3 py-3 md:table-cell">Data</th>
            <th className="w-12 px-2 py-3" aria-hidden />
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
