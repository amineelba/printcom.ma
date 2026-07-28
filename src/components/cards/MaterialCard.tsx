import type { Material } from '@/payload-types'

export function MaterialCard({ material }: { material: Material }) {
  return (
    <div className="rounded-card-small border border-border-subtle bg-elevated p-5">
      <p className="text-[0.9375rem] font-semibold text-primary">{material.title}</p>
      {material.shortDescription ? (
        <p className="pc-text-footnote mt-1 text-secondary">{material.shortDescription}</p>
      ) : null}
    </div>
  )
}
