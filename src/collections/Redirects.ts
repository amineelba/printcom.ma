import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager } from '@/lib/payload/access'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'type'],
    description: 'Redirections SEO (301/302).',
  },
  access: {
    read: () => true,
    create: isAdminOrContentManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    { name: 'from', type: 'text', required: true, unique: true, index: true },
    { name: 'to', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      defaultValue: '301',
      options: [
        { label: '301 — Permanente', value: '301' },
        { label: '302 — Temporaire', value: '302' },
      ],
    },
  ],
}
