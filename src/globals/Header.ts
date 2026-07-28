import type { GlobalConfig } from 'payload'
import { isAdminOrContentManager } from '@/lib/payload/access'

const navLinkFields = [
  { name: 'label', type: 'text' as const, required: true },
  { name: 'href', type: 'text' as const, required: true },
]

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: isAdminOrContentManager,
  },
  admin: { group: 'Configuration', description: 'Structure de la navigation principale (section 10).' },
  fields: [
    {
      name: 'menus',
      type: 'array',
      labels: { singular: 'Menu', plural: 'Menus' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', admin: { description: 'Lien direct si le menu n’a pas de sous-liens.' } },
        {
          name: 'columns',
          type: 'array',
          labels: { singular: 'Colonne', plural: 'Colonnes' },
          fields: [
            { name: 'heading', type: 'text' },
            {
              name: 'links',
              type: 'array',
              fields: navLinkFields,
            },
          ],
        },
      ],
    },
    {
      name: 'quoteCTA',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Demander un devis' },
        { name: 'href', type: 'text', defaultValue: '/demande-de-devis' },
      ],
    },
  ],
}
