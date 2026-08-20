import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager } from '@/lib/payload/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    description: 'Médias publics (photos produits, matières, papeterie, finitions, ressources).',
  },
  access: {
    read: () => true,
    create: isAdminOrContentManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      admin: {
        description:
          'Texte alternatif descriptif. Laisser vide uniquement pour un usage décoratif.',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 240, height: 240, fit: 'cover' },
      { name: 'card', width: 640, height: 480, fit: 'cover' },
      { name: 'listing', width: 960, height: 720, fit: 'cover' },
      { name: 'hero', width: 2000, height: 1125, fit: 'cover' },
      { name: 'openGraph', width: 1200, height: 630, fit: 'cover' },
    ],
  },
}
