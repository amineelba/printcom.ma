import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { adminOnlyField, seoFields, slugField, workflowFields } from '@/lib/payload/fields'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'primaryCategory', 'status', 'featured'],
    description: 'Catalogue produit (section 19). Devis uniquement — aucun prix ferme, aucun panier.',
  },
  access: {
    read: publicReadPublished,
    create: isAdminOrContentManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    // -----------------------------------------------------------------
    // Identité
    // -----------------------------------------------------------------
    { name: 'title', type: 'text', required: true },
    ...slugField(),
    {
      name: 'internalReference',
      type: 'text',
      admin: { position: 'sidebar', description: 'Référence interne (non publique).' },
    },
    { name: 'shortDescription', type: 'textarea', required: true },
    { name: 'longDescription', type: 'richText' },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'primaryImage', type: 'upload', relationTo: 'media' },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },

    // -----------------------------------------------------------------
    // Classification
    // -----------------------------------------------------------------
    {
      name: 'primaryCategory',
      type: 'relationship',
      relationTo: 'product-categories',
      required: true,
      index: true,
    },
    { name: 'secondaryCategories', type: 'relationship', relationTo: 'product-categories', hasMany: true },
    { name: 'needs', type: 'relationship', relationTo: 'solutions', hasMany: true },
    { name: 'sectors', type: 'relationship', relationTo: 'sectors', hasMany: true },
    { name: 'relatedProducts', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'relatedServices', type: 'relationship', relationTo: 'services', hasMany: true },

    // -----------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------
    {
      type: 'collapsible',
      label: 'Configuration',
      fields: [
        {
          name: 'availableFormats',
          type: 'array',
          labels: { singular: 'Format', plural: 'Formats' },
          fields: [{ name: 'label', type: 'text', required: true }],
        },
        { name: 'customFormatAvailable', type: 'checkbox', defaultValue: false },
        {
          name: 'orientations',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Portrait', value: 'portrait' },
            { label: 'Paysage', value: 'landscape' },
            { label: 'Carré', value: 'square' },
          ],
        },
        { name: 'pageCountOptions', type: 'array', fields: [{ name: 'label', type: 'text', required: true }] },
        {
          name: 'printSides',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Recto', value: 'single' },
            { label: 'Recto-verso', value: 'double' },
          ],
        },
        {
          name: 'colorModes',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Quadrichromie (CMJN)', value: 'cmyk' },
            { label: 'Noir et blanc', value: 'bw' },
            { label: 'Pantone', value: 'pantone' },
          ],
        },
        { name: 'materials', type: 'relationship', relationTo: 'materials', hasMany: true },
        { name: 'grammages', type: 'array', fields: [{ name: 'label', type: 'text', required: true }] },
        { name: 'finishes', type: 'relationship', relationTo: 'finishes', hasMany: true },
        { name: 'quantities', type: 'array', fields: [{ name: 'label', type: 'text', required: true }] },
      ],
    },

    // -----------------------------------------------------------------
    // Production
    // -----------------------------------------------------------------
    {
      type: 'collapsible',
      label: 'Production',
      fields: [
        { name: 'recommendedTechnologies', type: 'relationship', relationTo: 'technologies', hasMany: true },
        { name: 'minimumQuantity', type: 'number', admin: { description: 'Quantité minimale, si applicable.' } },
        { name: 'standardLeadTime', type: 'text', admin: { description: 'Ex : "5 à 7 jours ouvrés" — étudié au cas par cas.' } },
        { name: 'expressAvailable', type: 'checkbox', defaultValue: false },
        { name: 'proofRequired', type: 'checkbox', defaultValue: true, label: 'Bon à tirer requis' },
        { name: 'productionNotes', type: 'textarea', admin: { description: 'Notes internes de production.' } },
      ],
    },

    // -----------------------------------------------------------------
    // Préparation des fichiers
    // -----------------------------------------------------------------
    {
      type: 'collapsible',
      label: 'Préparation des fichiers',
      fields: [
        { name: 'acceptedFileFormats', type: 'array', fields: [{ name: 'label', type: 'text', required: true }] },
        { name: 'bleedRequirements', type: 'text', admin: { description: 'Ex : "3 mm de fond perdu".' } },
        { name: 'recommendedResolution', type: 'text', admin: { description: 'Ex : "300 dpi".' } },
        { name: 'colorProfile', type: 'text', admin: { description: 'Ex : "CMJN — ISO Coated v2".' } },
        { name: 'templateFile', type: 'upload', relationTo: 'media' },
        { name: 'filePreparationInstructions', type: 'richText' },
      ],
    },

    // -----------------------------------------------------------------
    // Commercial
    // -----------------------------------------------------------------
    {
      type: 'collapsible',
      label: 'Commercial',
      fields: [
        { name: 'quoteOnly', type: 'checkbox', defaultValue: true, label: 'Sur devis uniquement' },
        adminOnlyField({
          name: 'indicativePrice',
          type: 'text',
          defaultValue: '',
          admin: {
            description:
              'Désactivé par défaut. Ne jamais afficher un prix non confirmé sur le site public.',
          },
        }),
        { name: 'indicativePriceEnabled', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
        { name: 'deliveryAvailable', type: 'checkbox', defaultValue: true },
        { name: 'installationAvailable', type: 'checkbox', defaultValue: false },
        { name: 'commercialNotes', type: 'textarea', admin: { description: 'Notes internes commerciales.' } },
      ],
    },

    seoFields,
    ...workflowFields,
  ],
}
