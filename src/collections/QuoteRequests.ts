import type { CollectionConfig } from 'payload'
import { isAdminOrSalesManager, salesRecordAccess } from '@/lib/payload/access'

/**
 * Structured quote requests (sections 23-24). Never publicly readable or
 * writable through the API — the public form submits through a Next.js
 * server action using the Payload Local API with overrideAccess, so no
 * public `create` grant is needed here.
 */
export const QuoteRequests: CollectionConfig = {
  slug: 'quote-requests',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'company', 'requestType', 'status', 'priority', 'createdAt'],
    description: 'Demandes de devis structurées. Données commerciales — jamais publiques.',
  },
  access: {
    read: salesRecordAccess,
    create: isAdminOrSalesManager,
    update: salesRecordAccess,
    delete: isAdminOrSalesManager,
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Format PC-DEVIS-AAAA-000001, généré automatiquement.' },
    },

    // Étape 1 — Besoin
    {
      type: 'group',
      name: 'need',
      label: 'Étape 1 — Besoin',
      fields: [
        {
          name: 'requestType',
          type: 'select',
          required: true,
          options: [
            { label: "Impression d'un produit", value: 'product-printing' },
            { label: 'Conseil et accompagnement', value: 'advisory' },
            { label: 'Packaging sur mesure', value: 'custom-packaging' },
            { label: 'Grand format ou signalétique', value: 'large-format' },
            { label: 'Campagne multi-sites', value: 'multi-site-campaign' },
            { label: 'Autre demande', value: 'other' },
          ],
        },
        { name: 'desiredProduct', type: 'relationship', relationTo: 'products' },
        { name: 'category', type: 'relationship', relationTo: 'product-categories' },
        { name: 'description', type: 'textarea' },
        { name: 'usage', type: 'text' },
        { name: 'sector', type: 'relationship', relationTo: 'sectors' },
      ],
    },

    // Étape 2 — Configuration
    {
      type: 'group',
      name: 'configuration',
      label: 'Étape 2 — Configuration',
      fields: [
        { name: 'format', type: 'text' },
        { name: 'customFormatWidth', type: 'number' },
        { name: 'customFormatHeight', type: 'number' },
        {
          name: 'customFormatUnit',
          type: 'select',
          defaultValue: 'mm',
          options: [
            { label: 'mm', value: 'mm' },
            { label: 'cm', value: 'cm' },
          ],
        },
        {
          name: 'orientation',
          type: 'select',
          options: [
            { label: 'Portrait', value: 'portrait' },
            { label: 'Paysage', value: 'landscape' },
          ],
        },
        { name: 'pageCount', type: 'number' },
        {
          name: 'printSides',
          type: 'select',
          options: [
            { label: 'Recto', value: 'single' },
            { label: 'Recto-verso', value: 'double' },
          ],
        },
        { name: 'color', type: 'text' },
        { name: 'material', type: 'relationship', relationTo: 'materials' },
        { name: 'grammage', type: 'text' },
        { name: 'finish', type: 'relationship', relationTo: 'finishes', hasMany: true },
        { name: 'binding', type: 'text' },
        { name: 'quantity', type: 'number' },
        { name: 'versionsCount', type: 'number' },
        { name: 'variablePersonalization', type: 'checkbox', defaultValue: false },
      ],
    },

    // Étape 3 — Production et livraison
    {
      type: 'group',
      name: 'productionAndDelivery',
      label: 'Étape 3 — Production et livraison',
      fields: [
        { name: 'desiredDate', type: 'date' },
        {
          name: 'urgencyLevel',
          type: 'select',
          defaultValue: 'standard',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Urgent', value: 'urgent' },
          ],
        },
        { name: 'city', type: 'text' },
        { name: 'addressOrZone', type: 'textarea' },
        { name: 'multiSiteDelivery', type: 'checkbox', defaultValue: false },
        { name: 'destinationsCount', type: 'number' },
        { name: 'installationRequired', type: 'checkbox', defaultValue: false },
        { name: 'logisticsComments', type: 'textarea' },
      ],
    },

    // Étape 4 — Fichiers
    {
      type: 'group',
      name: 'files',
      label: 'Étape 4 — Fichiers',
      fields: [
        { name: 'filesReady', type: 'checkbox', defaultValue: false },
        { name: 'needsFileCheck', type: 'checkbox', defaultValue: false },
        { name: 'needsGraphicDesign', type: 'checkbox', defaultValue: false },
        { name: 'uploadedFiles', type: 'relationship', relationTo: 'private-quote-files', hasMany: true },
        { name: 'externalLink', type: 'text' },
        { name: 'comments', type: 'textarea' },
      ],
    },

    // Étape 5 — Contact
    {
      type: 'group',
      name: 'contact',
      label: 'Étape 5 — Contact',
      fields: [
        { name: 'company', type: 'text', required: true },
        { name: 'fullName', type: 'text', required: true },
        { name: 'jobTitle', type: 'text' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'city', type: 'text' },
        {
          name: 'preferredContactMethod',
          type: 'select',
          options: [
            { label: 'E-mail', value: 'email' },
            { label: 'Téléphone', value: 'phone' },
          ],
        },
        { name: 'comments', type: 'textarea' },
        { name: 'consentConfirmed', type: 'checkbox', required: true, defaultValue: false },
        { name: 'consentTimestamp', type: 'date' },
      ],
    },

    // Workflow interne (section 24)
    {
      type: 'group',
      name: 'workflow',
      label: 'Suivi commercial',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: [
            { label: 'Nouveau', value: 'new' },
            { label: 'En cours d’examen', value: 'reviewing' },
            { label: 'Information requise', value: 'information-required' },
            { label: 'Qualifié', value: 'qualified' },
            { label: 'Préparation du devis', value: 'quotation-preparation' },
            { label: 'Devis envoyé', value: 'quotation-sent' },
            { label: 'Négociation', value: 'negotiation' },
            { label: 'Gagné', value: 'won' },
            { label: 'Perdu', value: 'lost' },
            { label: 'Archivé', value: 'archived' },
            { label: 'Spam', value: 'spam' },
          ],
        },
        { name: 'assignedTo', type: 'relationship', relationTo: 'users' },
        { name: 'internalNotes', type: 'textarea' },
        { name: 'estimatedValue', type: 'number' },
        {
          name: 'priority',
          type: 'select',
          defaultValue: 'normal',
          options: [
            { label: 'Basse', value: 'low' },
            { label: 'Normale', value: 'normal' },
            { label: 'Haute', value: 'high' },
          ],
        },
        { name: 'followUpDate', type: 'date' },
        { name: 'source', type: 'text' },
        { name: 'utmSource', type: 'text' },
        { name: 'utmMedium', type: 'text' },
        { name: 'utmCampaign', type: 'text' },
        {
          name: 'statusHistory',
          type: 'array',
          admin: { readOnly: true },
          fields: [
            { name: 'status', type: 'text' },
            { name: 'changedAt', type: 'date' },
            { name: 'changedBy', type: 'relationship', relationTo: 'users' },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        if (data.workflow?.status && originalDoc?.workflow?.status !== data.workflow.status) {
          const history = originalDoc?.workflow?.statusHistory ?? []
          data.workflow.statusHistory = [
            ...history,
            {
              status: data.workflow.status,
              changedAt: new Date().toISOString(),
              changedBy: req.user?.id,
            },
          ]
        }
        return data
      },
    ],
  },
  timestamps: true,
}
