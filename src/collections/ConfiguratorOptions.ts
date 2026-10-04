import type { CollectionConfig } from 'payload'
import { isAdminOrContentManager, publicReadPublished } from '@/lib/payload/access'
import { verificationField } from '@/lib/payload/fields'

/**
 * Reusable option catalog (Sprint 5): one document per value that is
 * *technically identical* wherever it is used (A4, Recto-verso, 350 g…).
 * A catalog option is not available to any product by itself — each
 * product's `configurationSchema` allowlist decides where it appears.
 * Materials and finishes are NOT duplicated here: those dimensions point at
 * the existing `materials` / `finishes` collections.
 */
export const ConfiguratorOptions: CollectionConfig = {
  slug: 'configurator-options',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'dimension', 'machineValue', 'verificationStatus', 'status'],
    description:
      'Catalogue d’options réutilisables. Une option du catalogue n’est proposée que sur les produits qui l’autorisent dans leur propre configuration technique.',
  },
  access: {
    read: publicReadPublished,
    create: isAdminOrContentManager,
    update: isAdminOrContentManager,
    delete: isAdminOrContentManager,
  },
  fields: [
    { name: 'dimension', type: 'relationship', relationTo: 'configurator-dimensions', required: true, index: true },
    { name: 'label', type: 'text', required: true, label: 'Libellé public' },
    {
      name: 'machineValue',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Identifiant stable de la valeur au sein de la dimension (utilisé par l’import et les liens).' },
      validate: async (
        value: string | null | undefined,
        { siblingData, id, req }: { siblingData?: { dimension?: unknown }; id?: number | string; req: { payload: import('payload').Payload } },
      ) => {
        if (!value?.trim()) return 'Valeur requise.'
        const dimension = siblingData?.dimension
        const dimensionId = typeof dimension === 'object' && dimension && 'id' in dimension ? (dimension as { id: number }).id : dimension
        if (!dimensionId) return true
        const clash = await req.payload.find({
          collection: 'configurator-options',
          where: {
            and: [{ dimension: { equals: dimensionId } }, { machineValue: { equals: value } }, ...(id ? [{ id: { not_equals: id } }] : [])],
          },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        return clash.totalDocs ? 'Cette valeur existe déjà pour cette dimension.' : true
      },
    },
    { name: 'description', type: 'text', maxLength: 120, label: 'Description courte' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Image de l’option' },
    verificationField,
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'Publié', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'notes', type: 'textarea', admin: { description: 'Notes internes (jamais publiques).' } },
  ],
}
