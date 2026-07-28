import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { seoFields, slugField, workflowFields } from '@/lib/payload/fields'

/** Solutions "par secteur" (section 15). Seeded in draft; no client claims without proof. */
export const Sectors: CollectionConfig = {
  slug: 'sectors',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status'],
    description: 'Secteurs d’activité adressés (section 15). Aucune preuve client inventée.',
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
    {
      name: 'challenges',
      type: 'array',
      labels: { singular: 'Enjeu', plural: 'Enjeux' },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'printingNeeds',
      type: 'array',
      labels: { singular: 'Besoin d’impression', plural: 'Besoins d’impression' },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'recommendedCategories',
      type: 'relationship',
      relationTo: 'product-categories',
      hasMany: true,
    },
    {
      name: 'constraints',
      type: 'textarea',
      admin: { description: 'Contraintes propres au secteur (formats, délais, réglementation).' },
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'relatedFAQs',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
    },
    {
      name: 'neutralPositioningNote',
      type: 'text',
      defaultValue: 'Printcom étudie les contraintes d’impression propres à ce secteur.',
      admin: {
        position: 'sidebar',
        description: 'Formulation neutre affichée tant qu’aucune preuve sectorielle n’est confirmée.',
      },
    },
    seoFields,
    ...workflowFields,
  ],
}
