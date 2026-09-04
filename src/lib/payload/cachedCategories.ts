import { unstable_cache } from 'next/cache'
import { getPayload } from './client'
import type { Media } from '@/payload-types'

/**
 * Data for the global 3-level navigation's category bar + mega menu
 * (level 2/3 — see PRINTCOM-HOMEPAGE-UI-UX-BRIEF-UNIQUE.md §2). Not a
 * Payload "global" (it's derived from the product-categories/products
 * collections), so it lives alongside cachedGlobals.ts rather than in it,
 * following the same unstable_cache pattern: 60s revalidate, tagged for a
 * future on-demand revalidateTag() hook.
 *
 * Plain depth-based queries only (no select+populate) — see the documented
 * populate bug in cachedGlobals.ts's getHomepageGlobal().
 */

export interface NavCategoryProduct {
  id: number
  slug: string
  title: string
}

export interface NavCategory {
  id: number
  slug: string
  title: string
  image: Media | number | null | undefined
  products: NavCategoryProduct[]
}

const REVALIDATE_SECONDS = 60

export function getNavCategories(): Promise<NavCategory[]> {
  return unstable_cache(
    async () => {
      const payload = await getPayload()

      const { docs: categories } = await payload.find({
        collection: 'product-categories',
        where: { status: { equals: 'published' } },
        sort: 'order',
        limit: 20,
        depth: 1,
      })

      return Promise.all(
        categories.map(async (category) => {
          const { docs: products } = await payload.find({
            collection: 'products',
            where: {
              and: [{ status: { equals: 'published' } }, { primaryCategory: { equals: category.id } }],
            },
            sort: 'title',
            limit: 100,
            depth: 0,
          })

          return {
            id: category.id,
            slug: category.slug,
            title: category.title,
            image: category.image,
            products: products.map((product) => ({ id: product.id, slug: product.slug, title: product.title })),
          }
        }),
      )
    },
    ['nav-categories'],
    { revalidate: REVALIDATE_SECONDS, tags: ['nav-categories'] },
  )()
}
