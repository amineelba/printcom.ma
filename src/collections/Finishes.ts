import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { seoFields, slugField, workflowFields } from '@/lib/payload/fields'

/** Finitions (section 18) — relations structurées, jamais des tags libres. */
export const Finishes: CollectionConfig = {
  slug: 'finishes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'group', 'status'],
    description: 'Finitions (section 18).',
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
        { label: 'Pelliculage', value: 'pelliculage' },
        { label: 'Vernis', value: 'vernis' },
        { label: 'Ennoblissement', value: 'ennoblissement' },
        { label: 'Découpe', value: 'decoupe' },
        { label: 'Reliure', value: 'reliure' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'shortDescription', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    seoFields,
    ...workflowFields,
  ],
}
