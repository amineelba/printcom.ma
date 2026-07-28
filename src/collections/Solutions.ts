import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { seoFields, slugField, workflowFields } from '@/lib/payload/fields'

/** Solutions "par besoin" (section 14 field list). */
export const Solutions: CollectionConfig = {
  slug: 'solutions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status'],
    description: 'Solutions par besoin (section 14).',
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
    { name: 'shortDescription', type: 'textarea' },
    { name: 'problem', type: 'textarea', label: 'Problème' },
    { name: 'desiredOutcome', type: 'textarea', label: 'Objectif recherché' },
    {
      name: 'recommendedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    {
      name: 'recommendedServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
    },
    {
      name: 'recommendedTechnologies',
      type: 'relationship',
      relationTo: 'technologies',
      hasMany: true,
    },
    {
      name: 'recommendedMaterials',
      type: 'relationship',
      relationTo: 'materials',
      hasMany: true,
    },
    {
      name: 'recommendedFinishes',
      type: 'relationship',
      relationTo: 'finishes',
      hasMany: true,
    },
    {
      name: 'process',
      type: 'array',
      labels: { singular: 'Étape', plural: 'Étapes' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'relatedFAQs',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
    },
    {
      name: 'quoteCTA',
      type: 'text',
      defaultValue: 'Demander un devis',
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    seoFields,
    ...workflowFields,
  ],
}
