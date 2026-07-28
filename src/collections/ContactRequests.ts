import type { CollectionConfig } from 'payload'
import { isAdminOrSalesManager, salesRecordAccess } from '@/lib/payload/access'

export const ContactRequests: CollectionConfig = {
  slug: 'contact-requests',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'company', 'subject', 'status', 'createdAt'],
    description: 'Demandes de contact générales. Données personnelles — jamais publiques.',
  },
  access: {
    read: salesRecordAccess,
    create: isAdminOrSalesManager,
    update: salesRecordAccess,
    delete: isAdminOrSalesManager,
  },
  fields: [
    { name: 'fullName', type: 'text', required: true },
    { name: 'company', type: 'text' },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'subject', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    { name: 'consentConfirmed', type: 'checkbox', required: true, defaultValue: false },
    { name: 'consentTimestamp', type: 'date' },
    { name: 'source', type: 'text' },
    {
      type: 'group',
      name: 'workflow',
      label: 'Suivi',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'status',
          type: 'select',
          defaultValue: 'new',
          options: [
            { label: 'Nouveau', value: 'new' },
            { label: 'En cours', value: 'in-progress' },
            { label: 'Traité', value: 'resolved' },
            { label: 'Spam', value: 'spam' },
          ],
        },
        { name: 'assignedTo', type: 'relationship', relationTo: 'users' },
        { name: 'internalNotes', type: 'textarea' },
      ],
    },
  ],
  timestamps: true,
}
