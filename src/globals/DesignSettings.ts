import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/lib/payload/access'

/**
 * Brand accent override. Ships empty: no verified Printcom brand color was
 * available at build time (see docs/assumptions.md). When Printcom confirms
 * an official color, set it here — src/lib/design-system reads it to
 * override --pc-color-brand-600 without a code deploy.
 */
export const DesignSettings: GlobalConfig = {
  slug: 'design-settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: { group: 'Configuration', description: 'Substitution de la couleur de marque, une fois confirmée.' },
  fields: [
    {
      name: 'brandColorConfirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Cocher uniquement après validation officielle par Printcom.' },
    },
    {
      name: 'brandColorHex',
      type: 'text',
      admin: {
        description: 'Ex : #0071E3. Ignoré tant que "brandColorConfirmed" n’est pas coché.',
        condition: (data) => Boolean(data?.brandColorConfirmed),
      },
    },
  ],
}
