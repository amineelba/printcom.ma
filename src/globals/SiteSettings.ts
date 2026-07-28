import type { GlobalConfig } from 'payload'
import { isAdmin, isAdminOrContentManagerFieldLevel } from '@/lib/payload/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: { group: 'Configuration' },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'Printcom' },
    { name: 'tagline', type: 'text', admin: { description: '[À confirmer] tant que non validé par Printcom.' } },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'logoMark', type: 'upload', relationTo: 'media', admin: { description: 'Version compacte / favicon.' } },
    { name: 'legalCompanyName', type: 'text' },
    { name: 'foundingYear', type: 'text', admin: { description: 'Laisser vide tant que non confirmé.' } },
    { name: 'address', type: 'textarea' },
    { name: 'city', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    {
      name: 'businessHours',
      type: 'array',
      fields: [
        { name: 'label', type: 'text' },
      ],
    },
    {
      name: 'featureFlags',
      type: 'group',
      label: 'Visibilité de pages conditionnelles',
      access: { update: isAdminOrContentManagerFieldLevel },
      fields: [
        {
          name: 'showParcMachines',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'Passe automatiquement à vrai uniquement quand au moins une machine confirmée est publiée (voir scripts/verify-content.ts).',
          },
        },
      ],
    },
  ],
}
