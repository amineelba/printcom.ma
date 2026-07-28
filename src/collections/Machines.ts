import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { verificationField, workflowFields } from '@/lib/payload/fields'

/**
 * Machine park — the public /parc-machines route stays hidden until at
 * least one machine here is both status=published and verificationStatus=confirmed.
 */
export const Machines: CollectionConfig = {
  slug: 'machines',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'technology', 'status', 'verificationStatus'],
    description: 'Parc machines. Aucune capacité ne doit être publiée sans confirmation métier.',
  },
  access: {
    read: publicReadPublished,
    create: isAdminOrContentManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'technology', type: 'relationship', relationTo: 'technologies' },
    { name: 'maxFormat', type: 'text', admin: { description: 'Format maximal — ne renseigner que si confirmé.' } },
    { name: 'productionSite', type: 'relationship', relationTo: 'production-sites' },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    verificationField,
    ...workflowFields,
  ],
}
