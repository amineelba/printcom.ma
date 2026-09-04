import Link from 'next/link'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import type { NavCategory } from '@/lib/payload/cachedCategories'

/**
 * Full-width mega menu panel for one product category (brief §2, level 3).
 * Direct list of the category's products — there is no sub-category level.
 */
export function MegaMenu({ category }: { category: NavCategory }) {
  return (
    <div
      role="menu"
      aria-label={`Produits — ${category.title}`}
      className="absolute inset-x-0 top-full z-(--pc-nav-z) border-b border-(--pc-color-border-subtle) bg-elevated shadow-floating"
    >
      <div className="mx-auto grid max-w-(--pc-width-content-wide) grid-cols-1 gap-10 px-(--pc-page-gutter-small) py-10 md:px-(--pc-page-gutter-medium) lg:grid-cols-[1fr_320px]">
        <div>
          {category.products.length ? (
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 lg:grid-cols-3">
              {category.products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/produits/${product.slug}`}
                    role="menuitem"
                    className="text-[0.9375rem] text-secondary transition-colors hover:text-primary"
                  >
                    {product.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="pc-text-body-small text-tertiary">
              Catalogue en cours de préparation pour cette famille.
            </p>
          )}
          <Link
            href={`/produits?categorie=${category.slug}`}
            role="menuitem"
            className="mt-8 inline-flex text-[0.9375rem] font-medium text-link"
          >
            Voir tous les produits {category.title} ›
          </Link>
        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden rounded-card bg-alternate lg:block">
          {category.image ? (
            <ResponsiveImage media={category.image} payloadSize="card" sizes="320px" fill />
          ) : null}
        </div>
      </div>
    </div>
  )
}
