import Link from 'next/link'
import type { Sector } from '@/payload-types'

export function SectorCard({ sector }: { sector: Sector }) {
  return (
    <Link
      href={`/solutions/par-secteur/${sector.slug}`}
      className="group flex flex-col justify-between rounded-card border border-border-subtle bg-elevated p-[var(--pc-card-padding-small)] transition-colors hover:border-border-default"
    >
      <div>
        <p className="text-[1.0625rem] font-semibold text-primary group-hover:text-link">{sector.title}</p>
        {sector.shortDescription ? (
          <p className="pc-text-body-small mt-2 line-clamp-3 text-secondary">{sector.shortDescription}</p>
        ) : null}
      </div>
      <span className="mt-4 text-[0.9375rem] font-medium text-link">Explorer le secteur ›</span>
    </Link>
  )
}
