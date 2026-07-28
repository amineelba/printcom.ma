import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { verificationField, workflowFields } from '@/lib/payload/fields'

/** Production/implantation sites — feeds /parc-machines and /qualite-et-engagements once confirmed. */
export const ProductionSites: CollectionConfig = {
  slug: 'production-sites',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'status', 'verificationStatus'],
    description: 'Sites de production Printcom.',
  },
  access: {
    read: publicReadPublished,
    create: isAdminOrContentManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'city', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'description', type: 'textarea' },
    verificationField,
    ...workflowFields,
  ],
}
