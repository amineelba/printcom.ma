import { unstable_cache } from 'next/cache'
import { getPayload } from './client'
import type { SiteSetting, SeoDefault, DesignSetting, Header, Footer } from '@/payload-types'

/**
 * Cached readers for the Payload globals read on (almost) every frontend
 * page — layout.tsx, SiteHeader, SiteFooter and several page-level
 * generateMetadata calls each independently read site-settings/seo-defaults,
 * turning one page load into 6+ uncached Postgres round trips. `unstable_cache`
 * gives each global its own Data Cache entry, time-revalidated at 60s and
 * tagged so a future Payload afterChange hook can call revalidateTag() for
 * on-demand invalidation without touching call sites.
 *
 * This is independent of route-level rendering mode: the root layout keeps
 * `export const dynamic = 'force-dynamic'` (see its comment) so `next build`
 * never needs DB access — unstable_cache only caches the fetched data across
 * requests once the app is running, it does not make the route static.
 */

const REVALIDATE_SECONDS = 60

export function getSiteSettings(depth: 0 | 1 = 0): Promise<SiteSetting> {
  return unstable_cache(
    async () => {
      const payload = await getPayload()
      return payload.findGlobal({ slug: 'site-settings', depth })
    },
    ['global-site-settings', String(depth)],
    { revalidate: REVALIDATE_SECONDS, tags: ['global-site-settings'] },
  )()
}

export function getSeoDefaults(): Promise<SeoDefault> {
  return unstable_cache(
    async () => {
      const payload = await getPayload()
      return payload.findGlobal({ slug: 'seo-defaults', depth: 0 })
    },
    ['global-seo-defaults'],
    { revalidate: REVALIDATE_SECONDS, tags: ['global-seo-defaults'] },
  )()
}

export function getDesignSettings(): Promise<DesignSetting> {
  return unstable_cache(
    async () => {
      const payload = await getPayload()
      return payload.findGlobal({ slug: 'design-settings', depth: 0 })
    },
    ['global-design-settings'],
    { revalidate: REVALIDATE_SECONDS, tags: ['global-design-settings'] },
  )()
}

export function getHeaderGlobal(): Promise<Header> {
  return unstable_cache(
    async () => {
      const payload = await getPayload()
      return payload.findGlobal({ slug: 'header', depth: 0 })
    },
    ['global-header'],
    { revalidate: REVALIDATE_SECONDS, tags: ['global-header'] },
  )()
}

export function getFooterGlobal(): Promise<Footer> {
  return unstable_cache(
    async () => {
      const payload = await getPayload()
      return payload.findGlobal({ slug: 'footer', depth: 0 })
    },
    ['global-footer'],
    { revalidate: REVALIDATE_SECONDS, tags: ['global-footer'] },
  )()
}

/**
 * `depth: 2` is kept deliberately: 3 of the 6 featured relations
 * (featuredCategories, featuredServices, featuredResources) render a
 * thumbnail from a relationship field nested inside the populated doc
 * (image/coverImage), which needs a 2nd population level to resolve to a
 * real Media object at all — depth: 1 would leave those as raw IDs and
 * ResponsiveImage would silently render nothing. Verified with a real
 * query against local Postgres (a temporary media row linked through
 * featuredCategories[].image) that Payload 3.88.0 correctly resolves
 * `populate` two levels deep and returns exactly the selected keys
 * (`{id, alt, url}`), not the full Media document.
 *
 * `select` + `populate` together are the actual weight reduction here:
 * every populated doc (category/service/solution/sector/resource/faq)
 * otherwise comes back with its full SEO group, workflow/timestamp
 * fields and every other relation, none of which this page reads.
 */
export function getHomepageGlobal() {
  return unstable_cache(
    async () => {
      const payload = await getPayload()
      return payload.findGlobal({
        slug: 'homepage',
        depth: 2,
        select: {
          hero: true,
          valueProposition: true,
          featuredCategories: true,
          featuredSolutions: true,
          featuredServices: true,
          featuredSectors: true,
          process: true,
          featuredResources: true,
          featuredFAQs: true,
          finalCTA: true,
        },
        populate: {
          // `sizes.card` matches the `payloadSize="card"` passed to
          // ResponsiveImage by CategoryCard/ServiceCard/ResourceCard —
          // without it, those homepage-fed cards would fall back to the
          // full original `url` (still correct, just not the intended
          // optimization; ResponsiveImage never breaks on a missing size).
          media: { url: true, alt: true, sizes: { card: { url: true } } },
          'product-categories': { title: true, slug: true, shortDescription: true, image: true },
          services: { title: true, slug: true, shortDescription: true, image: true },
          solutions: { title: true, slug: true, shortDescription: true },
          sectors: { title: true, slug: true, shortDescription: true },
          resources: { title: true, slug: true, introduction: true, coverImage: true },
          faqs: { question: true, answer: true },
        },
      })
    },
    ['global-homepage'],
    { revalidate: REVALIDATE_SECONDS, tags: ['global-homepage'] },
  )()
}
