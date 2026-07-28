import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { getPayload } from '@/lib/payload/client'

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
