import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { verificationField, workflowFields } from '@/lib/payload/fields'

/** Client logos/names for public display — requires explicit written authorization. */
export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'verificationStatus'],
    description: 'Clients autorisés à être cités publiquement. Autorisation écrite requise.',
  },
  access: {
    read: publicReadPublished,
    create: isAdminOrContentManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'website', type: 'text' },
    {
      name: 'authorizationConfirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Autorisation écrite obtenue pour affichage public du logo/nom.',
      },
    },
    verificationField,
    ...workflowFields,
  ],
}
