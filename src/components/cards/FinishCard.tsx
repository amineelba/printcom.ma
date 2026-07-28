import type { Finish } from '@/payload-types'

export function FinishCard({ finish }: { finish: Finish }) {
  return (
    <div className="rounded-card-small border border-border-subtle bg-elevated p-5">
      <p className="text-[0.9375rem] font-semibold text-primary">{finish.title}</p>
      {finish.shortDescription ? (
        <p className="pc-text-footnote mt-1 text-secondary">{finish.shortDescription}</p>
      ) : null}
    </div>
  )
}
