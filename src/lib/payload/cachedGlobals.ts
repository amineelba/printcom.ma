import { unstable_cache } from 'next/cache'
import { getPayload } from './client'
import type { SiteSetting, SeoDefault, DesignSetting, Header, Footer, Homepage } from '@/payload-types'

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
 * Plain `depth: 2`, deliberately with NO `select`/`populate`.
 *
 * This previously used `select` + `populate` to shape the response (only
 * the fields each card component reads). That broke images in production:
 * `populate` on a nested relation silently returns `url: null` (and every
 * `sizes.*.url: null`) for the populated Media doc, even when the
 * document has a real, correctly uploaded file — `url` is computed by a
 * read hook that `populate`'s field-selection path doesn't run, unlike a
 * plain/`select`-only query. Confirmed directly: with a real image
 * uploaded via the Local API (not a raw SQL row) and linked through
 * featuredCategories[].image and hero.media, `findGlobal` with plain
 * `depth: 2` (or `select` alone, no `populate`) returns the real `url`;
 * adding `populate` — with or without `select` alongside it — turns that
 * same field to `null`. ResponsiveImage then has nothing to render
 * (`media.sizes?.[size]?.url || media.url` both null) and silently shows
 * nothing, which is exactly what broke on / (Hero + every CategoryCard)
 * after the select/populate change shipped.
 *
 * `depth: 2` alone is still required (not 1): 3 of the 6 featured
 * relations (featuredCategories, featuredServices, featuredResources)
 * render a thumbnail from a relationship field nested inside the
 * populated doc (image/coverImage), which needs a 2nd population level to
 * resolve to a Media object at all — depth: 1 leaves those as raw IDs.
 *
 * If the response weight here needs cutting again later, `select` alone
 * (no `populate`) verified fine above and is worth revisiting — the
 * `populate` bug is specific to shaping fields on populated relations.
 */
export function getHomepageGlobal(): Promise<Homepage> {
  return unstable_cache(
    async () => {
      const payload = await getPayload()
      return payload.findGlobal({ slug: 'homepage', depth: 2 })
    },
    ['global-homepage'],
    { revalidate: REVALIDATE_SECONDS, tags: ['global-homepage'] },
  )()
}
