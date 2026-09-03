import Link from 'next/link'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import type { Product, ProductCategory } from '@/payload-types'

/**
 * ProductCards never show price, stock, promotions, or a rating — this is
 * a B2B quote catalogue, not an e-commerce listing (section 20.14).
 */
export function ProductCard({ product }: { product: Product }) {
  const category = product.primaryCategory as ProductCategory | number | null | undefined
  const categoryLabel = category && typeof category === 'object' ? category.title : null
  const keyFormats = product.availableFormats?.slice(0, 2).map((f) => f.label).filter(Boolean)

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-card bg-elevated shadow-[var(--pc-card-shadow)] transition-shadow hover:shadow-[var(--pc-card-shadow-hover)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-card bg-alternate">
        {product.primaryImage ? (
          <ResponsiveImage media={product.primaryImage} sizes="(min-width: 1069px) 363px, 50vw" fill />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-[var(--pc-card-padding-small)]">
        {categoryLabel ? <p className="pc-text-footnote uppercase tracking-wide text-tertiary">{categoryLabel}</p> : null}
        <p className="mt-1 text-[1.0625rem] font-semibold text-primary group-hover:text-link">{product.title}</p>
        <p className="pc-text-body-small mt-2 line-clamp-2 text-secondary">{product.shortDescription}</p>
        {keyFormats?.length ? (
          <p className="pc-text-footnote mt-3 text-tertiary">{keyFormats.join(' · ')}</p>
        ) : null}
        <span className="mt-4 text-[0.9375rem] font-medium text-link">Demander un devis ›</span>
      </div>
    </Link>
  )
}
