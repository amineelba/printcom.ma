import type { GlobalConfig } from 'payload'
import { isAdminOrContentManager } from '@/lib/payload/access'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: () => true,
    update: isAdminOrContentManager,
  },
  admin: { group: 'Configuration', description: 'Contenu de la page d’accueil (section 21.1).' },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Vos supports imprimés, structurés autour de vos objectifs commerciaux.',
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue:
            'Printcom accompagne les entreprises dans la préparation, la production et le déploiement de leurs supports imprimés.',
        },
        { name: 'primaryCtaLabel', type: 'text', defaultValue: 'Demander un devis' },
        { name: 'primaryCtaHref', type: 'text', defaultValue: '/demande-de-devis' },
        { name: 'secondaryCtaLabel', type: 'text', defaultValue: 'Explorer les produits' },
        { name: 'secondaryCtaHref', type: 'text', defaultValue: '/produits' },
        { name: 'media', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'valueProposition',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        {
          name: 'points',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
          ],
        },
      ],
    },
    {
      name: 'featuredCategories',
      type: 'relationship',
      relationTo: 'product-categories',
      hasMany: true,
      admin: { description: 'Familles de produits mises en avant.' },
    },
    {
      name: 'featuredSolutions',
      type: 'relationship',
      relationTo: 'solutions',
      hasMany: true,
    },
    {
      name: 'featuredServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
    },
    {
      name: 'featuredSectors',
      type: 'relationship',
      relationTo: 'sectors',
      hasMany: true,
    },
    {
      name: 'process',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Le processus Printcom' },
        {
          name: 'steps',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
          ],
        },
      ],
    },
    {
      name: 'featuredResources',
      type: 'relationship',
      relationTo: 'resources',
      hasMany: true,
    },
    {
      name: 'featuredFAQs',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
    },
    {
      name: 'finalCTA',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Prêt à démarrer votre projet ?' },
        { name: 'description', type: 'textarea' },
        { name: 'ctaLabel', type: 'text', defaultValue: 'Demander un devis' },
        { name: 'ctaHref', type: 'text', defaultValue: '/demande-de-devis' },
      ],
    },
  ],
}
