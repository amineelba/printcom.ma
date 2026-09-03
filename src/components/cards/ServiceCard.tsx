import Link from 'next/link'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import type { Service } from '@/payload-types'

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col overflow-hidden rounded-card bg-elevated shadow-[var(--pc-card-shadow)] transition-shadow hover:shadow-[var(--pc-card-shadow-hover)]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-card bg-alternate">
        {service.image ? (
          <ResponsiveImage media={service.image} payloadSize="card" sizes="(min-width: 1069px) 363px, 50vw" fill />
        ) : null}
      </div>
      <div className="p-[var(--pc-card-padding-small)]">
        <p className="text-[1.0625rem] font-semibold text-primary group-hover:text-link">{service.title}</p>
        {service.shortDescription ? (
          <p className="pc-text-body-small mt-2 line-clamp-2 text-secondary">{service.shortDescription}</p>
        ) : null}
      </div>
    </Link>
  )
}
