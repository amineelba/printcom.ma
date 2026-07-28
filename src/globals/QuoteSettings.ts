import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/lib/payload/access'

export const QuoteSettings: GlobalConfig = {
  slug: 'quote-settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: { group: 'Configuration' },
  fields: [
    { name: 'referencePrefix', type: 'text', defaultValue: 'PC-DEVIS' },
    { name: 'notificationRecipients', type: 'text', admin: { description: 'Liste d’e-mails séparés par des virgules (PRINTCOM_QUOTE_RECIPIENTS par défaut).' } },
    { name: 'confirmationSubject', type: 'text', defaultValue: 'Votre demande de devis Printcom a bien été reçue' },
    { name: 'confirmationBody', type: 'richText' },
    {
      name: 'maxFileSizeMB',
      type: 'number',
      defaultValue: 15,
    },
    {
      name: 'acceptedFileExtensions',
      type: 'array',
      fields: [{ name: 'extension', type: 'text', required: true }],
    },
    {
      name: 'dateDisclaimerNote',
      type: 'text',
      defaultValue: 'La date demandée sera étudiée et confirmée par l’équipe Printcom.',
    },
  ],
}
