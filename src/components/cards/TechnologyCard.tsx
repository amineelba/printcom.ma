import type { Technology } from '@/payload-types'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'

export function TechnologyCard({ technology }: { technology: Technology }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-elevated shadow-[var(--pc-card-shadow)]">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-card bg-alternate">
        {technology.image ? <ResponsiveImage media={technology.image} sizes="(min-width: 1069px) 33vw, 50vw" fill /> : null}
      </div>
      <div className="p-[var(--pc-card-padding-small)]">
        <p className="text-[1.0625rem] font-semibold text-primary">{technology.title}</p>
        {technology.shortDescription ? (
          <p className="pc-text-body-small mt-2 text-secondary">{technology.shortDescription}</p>
        ) : null}
      </div>
    </div>
  )
}
