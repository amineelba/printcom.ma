import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { getPayload } from '@/lib/payload/client'

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
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
