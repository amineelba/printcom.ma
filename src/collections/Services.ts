import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { seoFields, slugField, workflowFields } from '@/lib/payload/fields'

/** Services and sub-services (section 13). Draft by default; publish only confirmed offers. */
export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'status'],
    description: 'Services et sous-services Printcom (section 13).',
  },
  access: {
    read: publicReadPublished,
    create: isAdminOrContentManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    ...slugField(),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'services',
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
      admin: { description: 'Laisser vide pour un service de premier niveau.' },
    },
    { name: 'shortDescription', type: 'textarea' },
    { name: 'description', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'steps',
      type: 'array',
      labels: { singular: 'Étape', plural: 'Étapes' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'deliverables',
      type: 'array',
      labels: { singular: 'Livrable', plural: 'Livrables' },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    {
      name: 'relatedFAQs',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    seoFields,
    ...workflowFields,
  ],
}
