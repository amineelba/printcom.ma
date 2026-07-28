import type { GlobalConfig } from 'payload'
import { isAdminOrContentManager } from '@/lib/payload/access'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: isAdminOrContentManager,
  },
  admin: { group: 'Configuration' },
  fields: [
    {
      name: 'columns',
      type: 'array',
      labels: { singular: 'Colonne', plural: 'Colonnes' },
      fields: [
        { name: 'heading', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'legalLinks',
      type: 'array',
      labels: { singular: 'Lien légal', plural: 'Liens légaux' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    { name: 'copyrightNotice', type: 'text', defaultValue: '© Printcom. Tous droits réservés.' },
  ],
}
