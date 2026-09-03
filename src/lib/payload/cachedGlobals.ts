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
