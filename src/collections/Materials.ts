import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { seoFields, slugField, workflowFields } from '@/lib/payload/fields'

/** Supports et matériaux (section 17), grouped by family. */
export const Materials: CollectionConfig = {
  slug: 'materials',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'group', 'status'],
    description: 'Supports et matériaux (section 17).',
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
      name: 'group',
      type: 'select',
      required: true,
      options: [
        { label: 'Papier', value: 'papier' },
        { label: 'Carton', value: 'carton' },
        { label: 'Supports souples', value: 'supports-souples' },
        { label: 'Supports rigides', value: 'supports-rigides' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'shortDescription', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'indoorOutdoor', type: 'select', options: [
      { label: 'Intérieur', value: 'indoor' },
      { label: 'Extérieur', value: 'outdoor' },
      { label: 'Intérieur et extérieur', value: 'both' },
    ] },
    seoFields,
    ...workflowFields,
  ],
}
