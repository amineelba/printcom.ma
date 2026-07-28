import type { GlobalConfig } from 'payload'
import { isAdminOrContentManager } from '@/lib/payload/access'

export const SEODefaults: GlobalConfig = {
  slug: 'seo-defaults',
  access: {
    read: () => true,
    update: isAdminOrContentManager,
  },
  admin: { group: 'Configuration' },
  fields: [
    { name: 'defaultMetaTitle', type: 'text', defaultValue: 'Printcom — Impression commerciale B2B au Maroc' },
    { name: 'defaultMetaDescription', type: 'textarea' },
    { name: 'defaultOpenGraphImage', type: 'upload', relationTo: 'media' },
    { name: 'titleTemplate', type: 'text', defaultValue: '%s — Printcom' },
    { name: 'robotsIndexingEnabled', type: 'checkbox', defaultValue: true },
    { name: 'organizationJsonLd', type: 'checkbox', defaultValue: true },
  ],
}
