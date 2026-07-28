import type { ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  action?: ReactNode
}) {
  return (
    <div
      className={`flex flex-col gap-4 ${align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'}`}
    >
      <div className={align === 'center' ? 'max-w-(--container-reading)' : 'max-w-(--container-reading)'}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="pc-text-section-title text-primary">{title}</h2>
        {description ? <p className="pc-text-intro mt-4">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
