import Link from 'next/link'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import type { ProductCategory } from '@/payload-types'

export function CategoryCard({ category }: { category: ProductCategory }) {
  return (
    <Link
      href={`/produits/${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-card bg-elevated shadow-[var(--pc-card-shadow)] transition-shadow hover:shadow-[var(--pc-card-shadow-hover)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-card bg-alternate">
        {category.image ? (
          <ResponsiveImage media={category.image} sizes="(min-width: 1069px) 363px, 50vw" fill />
        ) : null}
      </div>
      <div className="p-[var(--pc-card-padding-small)]">
        <p className="text-[1.0625rem] font-semibold text-primary group-hover:text-link">{category.title}</p>
        {category.shortDescription ? (
          <p className="pc-text-body-small mt-2 line-clamp-2 text-secondary">{category.shortDescription}</p>
        ) : null}
      </div>
    </Link>
  )
}
