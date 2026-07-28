import type { Field } from 'payload'
import { isAdminFieldLevel } from './access'

/**
 * Editorial workflow fields shared by every public content collection
 * (section 31 of the brief). `status` gates public visibility via
 * `publicReadPublished`; `draft` is always the safe default for new docs.
 */
export const workflowFields: Field[] = [
  {
    name: 'status',
    type: 'select',
    required: true,
    defaultValue: 'draft',
    options: [
      { label: 'Brouillon', value: 'draft' },
      { label: 'En révision', value: 'review' },
      { label: 'Approuvé', value: 'approved' },
      { label: 'Publié', value: 'published' },
      { label: 'Archivé', value: 'archived' },
    ],
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'owner',
    type: 'relationship',
    relationTo: 'users',
    admin: {
      position: 'sidebar',
      description: "Rédacteur responsable de ce contenu.",
    },
  },
  {
    name: 'reviewer',
    type: 'relationship',
    relationTo: 'users',
    admin: {
      position: 'sidebar',
      description: 'Relecteur assigné avant publication.',
    },
  },
  {
    name: 'reviewNotes',
    type: 'textarea',
    admin: {
      position: 'sidebar',
      description: 'Notes internes de relecture (jamais publiques).',
    },
  },
  {
    name: 'publishedAt',
    type: 'date',
    admin: {
      position: 'sidebar',
      date: { pickerAppearance: 'dayAndTime' },
    },
  },
  {
    name: 'archivedAt',
    type: 'date',
    admin: {
      position: 'sidebar',
      date: { pickerAppearance: 'dayAndTime' },
    },
  },
]

/**
 * Business-fact verification, required in addition to editorial status for
 * anything that states a technical/industrial capability (section 16, 31).
 * The frontend must only render `verificationStatus: confirmed` content.
 */
export const verificationField: Field = {
  name: 'verificationStatus',
  type: 'select',
  required: true,
  defaultValue: 'unverified',
  options: [
    { label: 'Non vérifié', value: 'unverified' },
    { label: 'Confirmé', value: 'confirmed' },
    { label: 'Indisponible', value: 'unavailable' },
  ],
  admin: {
    position: 'sidebar',
    description:
      "Le frontend n'affiche jamais un contenu tant que ce champ n'est pas \"Confirmé\".",
  },
}

export const seoFields: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: {
    position: undefined,
  },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      admin: { description: 'Si vide, le titre de la page est utilisé.' },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: { description: 'Environ 155 caractères recommandés.' },
    },
    {
      name: 'canonicalUrl',
      type: 'text',
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      defaultValue: false,
      label: 'Empêcher l’indexation (noindex)',
    },
    {
      name: 'openGraphImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'structuredDataEnabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Générer les données structurées',
    },
  ],
}

export const slugField = (source = 'title'): Field[] => [
  {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: `URL générée à partir de "${source}". Modifiable manuellement.`,
    },
  },
]

/** Locks a field so only admins can edit it (e.g. internal commercial data). */
export const adminOnlyField = (field: Field): Field =>
  ({
    ...field,
    access: {
      read: () => true,
      update: isAdminFieldLevel,
    },
  }) as Field
