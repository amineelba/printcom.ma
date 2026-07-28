import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { seoFields, slugField, workflowFields } from '@/lib/payload/fields'

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status'],
    description: 'Ressources éditoriales (guides, articles, fiches pratiques).',
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
      name: 'category',
      type: 'select',
      options: [
        { label: 'Guide pratique', value: 'guide' },
        { label: 'Préparation de fichiers', value: 'file-prep' },
        { label: 'Choix de supports', value: 'materials' },
        { label: 'Tendances', value: 'trends' },
        { label: 'Cas d’usage', value: 'use-case' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'introduction', type: 'textarea', required: true },
    { name: 'body', type: 'richText', required: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'downloadFile',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Document téléchargeable (PDF public uniquement).' },
    },
    { name: 'relatedProducts', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'relatedServices', type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'relatedResources', type: 'relationship', relationTo: 'resources', hasMany: true },
    { name: 'publishDate', type: 'date', admin: { position: 'sidebar' } },
    seoFields,
    ...workflowFields,
  ],
}
