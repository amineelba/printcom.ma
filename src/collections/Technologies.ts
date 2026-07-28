import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { seoFields, slugField, verificationField, workflowFields } from '@/lib/payload/fields'

/**
 * Confirmed technologies (section 16). Frontend queries must filter on
 * BOTH status=published AND verificationStatus=confirmed.
 */
export const Technologies: CollectionConfig = {
  slug: 'technologies',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'verificationStatus'],
    description: 'Technologies d’impression (section 16). Publication soumise à vérification métier.',
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
    { name: 'description', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    verificationField,
    seoFields,
    ...workflowFields,
  ],
}
