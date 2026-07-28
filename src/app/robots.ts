import type { MetadataRoute } from 'next'
import { getPayload } from '@/lib/payload/client'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const payload = await getPayload()
  const seoDefaults = await payload.findGlobal({ slug: 'seo-defaults', depth: 0 })

  if (seoDefaults.robotsIndexingEnabled === false) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/recherche'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
