import Link from 'next/link'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import type { Resource } from '@/payload-types'

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link
      href={`/ressources/${resource.slug}`}
      className="group flex flex-col overflow-hidden rounded-card bg-elevated shadow-[var(--pc-card-shadow)] transition-shadow hover:shadow-[var(--pc-card-shadow-hover)]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-card bg-alternate">
        {resource.coverImage ? (
          <ResponsiveImage media={resource.coverImage} sizes="(min-width: 1069px) 363px, 50vw" fill />
        ) : null}
      </div>
      <div className="p-[var(--pc-card-padding-small)]">
        <p className="text-[1.0625rem] font-semibold text-primary group-hover:text-link">{resource.title}</p>
        <p className="pc-text-body-small mt-2 line-clamp-2 text-secondary">{resource.introduction}</p>
      </div>
    </Link>
  )
}
