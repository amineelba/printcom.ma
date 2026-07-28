import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { getPayload } from '@/lib/payload/client'
import { StructuredData } from '@/components/seo/StructuredData'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonLd'

/**
 * Default ISR window for statically-shaped pages under this layout (about,
 * services archive, legal pages, etc.). Routes that read searchParams or
 * call cookies()/headers() (e.g. /produits, /recherche) are automatically
 * rendered per-request by Next regardless of this value, so CMS edits to
 * filtered/interactive routes are always immediate; this setting only
 * controls how quickly edits to otherwise-static editorial pages surface
 * without a full redeploy.
 */
export const revalidate = 300

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
