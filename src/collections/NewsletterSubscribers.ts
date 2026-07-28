import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, isAdminOrSalesManager } from '@/lib/payload/access'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'consentConfirmed', 'createdAt'],
  },
  access: {
    read: isAdminOrContentManager,
    create: isAdminOrSalesManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'consentConfirmed', type: 'checkbox', required: true, defaultValue: false },
    { name: 'consentTimestamp', type: 'date' },
    { name: 'source', type: 'text' },
  ],
  timestamps: true,
}
