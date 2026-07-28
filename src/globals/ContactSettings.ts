import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/lib/payload/access'

export const ContactSettings: GlobalConfig = {
  slug: 'contact-settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: { group: 'Configuration' },
  fields: [
    { name: 'contactIntro', type: 'textarea' },
    { name: 'notificationRecipients', type: 'text', admin: { description: 'Liste d’e-mails séparés par des virgules (PRINTCOM_CONTACT_RECIPIENTS par défaut).' } },
    { name: 'autoReplySubject', type: 'text', defaultValue: 'Votre message a bien été reçu — Printcom' },
    { name: 'autoReplyBody', type: 'richText' },
  ],
}
