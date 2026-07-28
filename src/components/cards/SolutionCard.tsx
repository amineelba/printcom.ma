import Link from 'next/link'
import type { Solution } from '@/payload-types'

export function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <Link
      href={`/solutions/${solution.slug}`}
      className="group flex flex-col justify-between rounded-card border border-border-subtle bg-elevated p-[var(--pc-card-padding-small)] transition-colors hover:border-border-default"
    >
      <div>
        <p className="text-[1.0625rem] font-semibold text-primary group-hover:text-link">{solution.title}</p>
        {solution.shortDescription ? (
          <p className="pc-text-body-small mt-2 line-clamp-3 text-secondary">{solution.shortDescription}</p>
        ) : null}
      </div>
      <span className="mt-4 text-[0.9375rem] font-medium text-link">Découvrir la solution ›</span>
    </Link>
  )
}
