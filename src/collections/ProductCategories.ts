import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { seoFields, slugField, workflowFields } from '@/lib/payload/fields'

/**
 * Flat product taxonomy — catalogue ownership only (§12 of the brief).
 * Every category is a top-level family; there is no sub-category layer.
 * A Product belongs to exactly one category via `Products.primaryCategory`.
 * Cross-cutting/transversal groupings (seasonal campaigns, merchandising
 * themes) belong in `product-collections`, not here — see ProductCollections.ts.
 * No "Réalisations" term may ever be seeded under this collection.
 */
export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status'],
    description: 'Familles de produits (section 12).',
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
