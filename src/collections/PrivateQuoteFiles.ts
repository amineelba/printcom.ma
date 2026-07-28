import type { CollectionConfig } from 'payload'
import { internalOnly, isSalesTeam } from '@/lib/payload/access'

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/webp',
  'application/postscript', // .ai / .eps
  'application/illustrator',
  'application/x-indesign',
  'application/zip',
]

/**
 * Files attached to quote requests. Never exposed publicly — read access
 * requires an authenticated sales/admin session. Uploaded via the public
 * quote form using a scoped server action, never a public create grant.
 */
export const PrivateQuoteFiles: CollectionConfig = {
  slug: 'private-quote-files',
  admin: {
    description: 'Fichiers clients joints aux demandes de devis. Stockage privé.',
    hidden: ({ user }) => !user || !['admin', 'sales-manager', 'sales-agent'].includes(user.role),
  },
  access: {
    read: internalOnly,
    create: isSalesTeam,
    update: isSalesTeam,
    delete: internalOnly,
  },
  fields: [
    {
      name: 'originalFilename',
      type: 'text',
      required: true,
    },
    {
      name: 'quoteRequest',
      type: 'relationship',
      relationTo: 'quote-requests',
      index: true,
    },
  ],
  upload: {
    mimeTypes: ACCEPTED_MIME_TYPES,
    disableLocalStorage: false,
  },
}
