import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { getPayload } from '@/lib/payload/client'
import { StructuredData } from '@/components/seo/StructuredData'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonLd'

/**
 * Force every page under this layout to render per-request rather than
 * being statically generated at build time. This layout (and therefore
 * every frontend page, since Server Component data fetches are not
 * cached across requests without an explicit fetch-cache/unstable_cache
 * wrapper) reads Payload globals, which means "static generation" here
 * would mean "query Postgres during `next build`" — fragile in CI/CD
 * environments where the database may not be reachable or credentials
 * not yet provisioned at build time (this is what broke the first Vercel
 * deploy: build-time `next build` failed with "missing secret key"
 * because PAYLOAD_SECRET/DATABASE_URL weren't set as build-time env vars
 * yet). Forcing dynamic rendering decouples `pnpm build` from needing any
 * database access at all — the build only needs to compile; Payload is
 * only ever contacted at request time, when the deployment's runtime env
 * vars are guaranteed to be present. See docs/deployment.md.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload()
  const seoDefaults = await payload.findGlobal({ slug: 'seo-defaults', depth: 0 })

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    title: {
      default: seoDefaults.defaultMetaTitle || 'Printcom — Impression commerciale B2B au Maroc',
      template: seoDefaults.titleTemplate || '%s — Printcom',
    },
    description: seoDefaults.defaultMetaDescription || undefined,
    robots: seoDefaults.robotsIndexingEnabled === false ? { index: false, follow: false } : { index: true, follow: true },
  }
}

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload()
  const [siteSettings, seoDefaults, designSettings] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
    payload.findGlobal({ slug: 'seo-defaults', depth: 0 }),
    payload.findGlobal({ slug: 'design-settings', depth: 0 }),
  ])
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const siteName = siteSettings.siteName || 'Printcom'

  const brandColor =
    designSettings.brandColorConfirmed && HEX_COLOR_PATTERN.test(designSettings.brandColorHex || '')
      ? designSettings.brandColorHex
      : null

  return (
    <html lang="fr">
      <body>
        {brandColor ? (
          // Overrides the provisional action-blue fallback (see
          // docs/assumptions.md § Brand color) once Printcom confirms an
          // official color in the design-settings global — no deploy
          // needed. Hover/active/link shades are derived via color-mix()
          // so a single confirmed hex is enough.
          <style
            dangerouslySetInnerHTML={{
              __html: `:root{--pc-color-brand-600:${brandColor};--pc-color-brand-650:color-mix(in srgb, ${brandColor} 90%, white);--pc-color-brand-700:color-mix(in srgb, ${brandColor} 80%, black);--pc-color-brand-500:color-mix(in srgb, ${brandColor} 88%, black);}`,
            }}
          />
        ) : null}
        {seoDefaults.organizationJsonLd !== false ? (
          <>
            <StructuredData data={organizationJsonLd({ name: siteName, url: baseUrl })} />
            <StructuredData data={websiteJsonLd({ name: siteName, url: baseUrl })} />
          </>
        ) : null}
        <a href="#main-content" className="pc-skip-link">
          Aller au contenu principal
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
