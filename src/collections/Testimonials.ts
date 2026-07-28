import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { verificationField, workflowFields } from '@/lib/payload/fields'

/** Client testimonials — must never be fabricated. Requires written consent + verification. */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'company', 'status', 'verificationStatus'],
    description: 'Témoignages clients réels uniquement. Consentement écrit requis avant publication.',
  },
  access: {
    read: publicReadPublished,
    create: isAdminOrContentManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'authorName', type: 'text', required: true },
    { name: 'authorRole', type: 'text' },
    { name: 'company', type: 'text' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'consentConfirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Consentement écrit obtenu pour publication.',
      },
    },
    verificationField,
    ...workflowFields,
  ],
}
