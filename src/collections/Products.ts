import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { adminOnlyField, seoFields, slugField, visualOptionFields, workflowFields } from '@/lib/payload/fields'
import { DATA_STATUSES, ENUM_OPTION_VALUES, PROVENANCE_TYPES } from '@/lib/configurator-schema/constants'

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
    {
      name: 'collections',
      type: 'relationship',
      relationTo: 'product-collections',
      hasMany: true,
      admin: {
        description:
          'Regroupements transversaux (campagnes, thèmes) dans lesquels ce produit peut être mis en avant — n’affecte pas sa catégorie propriétaire (primaryCategory).',
      },
    },
    { name: 'needs', type: 'relationship', relationTo: 'solutions', hasMany: true },
    { name: 'sectors', type: 'relationship', relationTo: 'sectors', hasMany: true },
    { name: 'relatedProducts', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'relatedServices', type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'relatedFAQs', type: 'relationship', relationTo: 'faqs', hasMany: true },

    // -----------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------
    {
      type: 'collapsible',
      label: 'Configuration technique',
      admin: {
        description:
          'Chaque produit définit ses propres dimensions et options. Les catégories ne transmettent pas automatiquement de valeurs techniques. Une dimension sans option confirmée n’apparaît pas sur la fiche produit.',
      },
      fields: [
        {
          name: 'configurationSchema',
          type: 'array',
          labels: { singular: 'Dimension', plural: 'Dimensions' },
          admin: {
            description:
              'L’ordre des lignes est l’ordre d’affichage dans le configurateur. Si ce tableau ne contient aucune ligne exploitable, le configurateur utilise les champs historiques ci-dessous.',
            initCollapsed: true,
          },
          fields: [
            {
              name: 'dimension',
              type: 'relationship',
              relationTo: 'configurator-dimensions',
              required: true,
              admin: { description: 'Dimension technique concernée (registre).' },
            },
            {
              type: 'row',
              fields: [
                { name: 'labelOverride', type: 'text', admin: { width: '50%', description: 'Libellé propre à ce produit (facultatif).' } },
                { name: 'helpTextOverride', type: 'text', maxLength: 160, admin: { width: '50%', description: 'Aide propre à ce produit (facultatif).' } },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'dataStatus',
                  type: 'select',
                  required: true,
                  defaultValue: 'needs-review',
                  options: [
                    { label: 'Confirmé (affiché)', value: 'confirmed' },
                    { label: 'À vérifier (masqué)', value: 'needs-review' },
                    { label: 'Non pris en charge (masqué)', value: 'unsupported' },
                  ],
                  admin: { width: '34%', description: 'Seul « Confirmé » est visible sur le site.' },
                },
                {
                  name: 'source',
                  type: 'select',
                  options: PROVENANCE_TYPES.map((value) => ({ label: value, value })),
                  admin: { width: '33%', description: 'Origine de la ligne (traçabilité).' },
                },
                {
                  name: 'allowCustomValue',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Saisie libre autorisée',
                  admin: {
                    width: '33%',
                    description: 'Format « Sur mesure », dimensions, nombre ou texte saisis par le client.',
                  },
                },
              ],
            },
            {
              name: 'requiredForConfiguration',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'Information seulement : le client peut toujours demander un devis sans répondre.' },
            },
            {
              name: 'options',
              type: 'array',
              labels: { singular: 'Option du catalogue', plural: 'Options du catalogue' },
              admin: { description: 'Valeurs autorisées pour ce produit uniquement (dimensions de source « catalogue »).' },
              fields: [
                { name: 'option', type: 'relationship', relationTo: 'configurator-options', required: true },
                { name: 'descriptionOverride', type: 'text', maxLength: 120 },
                { name: 'imageOverride', type: 'upload', relationTo: 'media', label: 'Image propre à ce produit' },
                { name: 'previewImage', type: 'upload', relationTo: 'media', label: 'Image d’aperçu produit' },
              ],
            },
            {
              name: 'materialOptions',
              type: 'relationship',
              relationTo: 'materials',
              hasMany: true,
              admin: { description: 'Supports autorisés (dimensions de source « materials »).' },
            },
            {
              name: 'finishOptions',
              type: 'relationship',
              relationTo: 'finishes',
              hasMany: true,
              admin: { description: 'Finitions autorisées (dimensions de source « finishes »).' },
            },
            {
              name: 'enumOptions',
              type: 'select',
              hasMany: true,
              options: ENUM_OPTION_VALUES.map(({ label, value }) => ({ label, value })),
              admin: { description: 'Valeurs fixes autorisées (orientation, recto-verso, couleur).' },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Configuration (modèle historique — repli)',
      admin: {
        description:
          'Champs génériques d’origine. Ils restent lisibles et servent de repli tant que la configuration technique ci-dessus n’a pas de ligne exploitable.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'availableFormats',
          type: 'array',
          labels: { singular: 'Format', plural: 'Formats' },
          fields: visualOptionFields,
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
        {
          name: 'pageCountOptions',
          type: 'array',
          labels: { singular: 'Nombre de pages', plural: 'Nombres de pages' },
          fields: visualOptionFields,
        },
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
        {
          name: 'grammages',
          type: 'array',
          labels: { singular: 'Grammage', plural: 'Grammages' },
          fields: visualOptionFields,
        },
        { name: 'finishes', type: 'relationship', relationTo: 'finishes', hasMany: true },
        {
          name: 'quantities',
          type: 'array',
          labels: { singular: 'Quantité', plural: 'Quantités' },
          fields: visualOptionFields,
        },
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
