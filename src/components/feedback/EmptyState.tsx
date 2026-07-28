import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border-default px-8 py-16 text-center">
      <p className="text-[1.0625rem] font-medium text-primary">{title}</p>
      {description ? <p className="pc-text-body-small max-w-(--container-reading) text-secondary">{description}</p> : null}
      {action}
    </div>
  )
}
