import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { seoFields, slugField, workflowFields } from '@/lib/payload/fields'

/**
 * Two-level product taxonomy (family -> sub-category) per section 12 of the
 * brief. No "Réalisations" term may ever be seeded under this collection.
 */
export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'status'],
    description: 'Familles et sous-catégories de produits (section 12).',
  },
  access: {
    read: publicReadPublished,
    create: isAdminOrContentManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    ...slugField(),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'product-categories',
      admin: {
        description: 'Laisser vide pour une famille de premier niveau.',
      },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: 'shortDescription',
      type: 'textarea',
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    seoFields,
    ...workflowFields,
  ],
}
