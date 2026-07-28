import type { CollectionConfig } from 'payload'
import { isAdmin, publicReadPublished } from '@/lib/payload/access'
import { slugField, workflowFields } from '@/lib/payload/fields'

/** Mentions légales, politique de confidentialité, politique des cookies. */
export const LegalDocuments: CollectionConfig = {
  slug: 'legal-documents',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status'],
  },
  access: {
    read: publicReadPublished,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    ...slugField(),
    { name: 'body', type: 'richText', required: true },
    { name: 'lastUpdated', type: 'date', admin: { position: 'sidebar' } },
    ...workflowFields,
  ],
}
