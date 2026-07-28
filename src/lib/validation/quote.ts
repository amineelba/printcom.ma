import { z } from 'zod'

export const quoteNeedSchema = z.object({
  requestType: z.enum([
    'product-printing',
    'advisory',
    'custom-packaging',
    'large-format',
    'multi-site-campaign',
    'other',
  ]),
  desiredProduct: z.string().optional(),
  category: z.string().optional(),
  description: z.string().trim().min(1, 'Décrivez brièvement votre besoin.'),
  usage: z.string().optional(),
  sector: z.string().optional(),
})

export const quoteConfigurationSchema = z.object({
  format: z.string().optional(),
  customFormatWidth: z.union([z.number(), z.nan()]).optional(),
  customFormatHeight: z.union([z.number(), z.nan()]).optional(),
  customFormatUnit: z.enum(['mm', 'cm']).optional(),
  orientation: z.enum(['portrait', 'landscape']).optional(),
  pageCount: z.union([z.number(), z.nan()]).optional(),
  printSides: z.enum(['single', 'double']).optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  grammage: z.string().optional(),
  finish: z.array(z.string()).optional(),
  binding: z.string().optional(),
  quantity: z.union([z.number(), z.nan()]).optional(),
  versionsCount: z.union([z.number(), z.nan()]).optional(),
  variablePersonalization: z.boolean().optional(),
})

export const quoteProductionAndDeliverySchema = z.object({
  desiredDate: z.string().optional(),
  urgencyLevel: z.enum(['standard', 'urgent']).default('standard'),
  city: z.string().optional(),
  addressOrZone: z.string().optional(),
  multiSiteDelivery: z.boolean().optional(),
  destinationsCount: z.union([z.number(), z.nan()]).optional(),
  installationRequired: z.boolean().optional(),
  logisticsComments: z.string().optional(),
})

export const quoteFilesSchema = z.object({
  filesReady: z.boolean().optional(),
  needsFileCheck: z.boolean().optional(),
  needsGraphicDesign: z.boolean().optional(),
  uploadedFileIds: z.array(z.number()).optional(),
  externalLink: z.string().optional(),
  comments: z.string().optional(),
})

export const quoteContactSchema = z.object({
  company: z.string().trim().min(1, 'Indiquez le nom de votre entreprise.'),
  fullName: z.string().trim().min(2, 'Indiquez votre nom complet.'),
  jobTitle: z.string().optional(),
  email: z.string().trim().email('Adresse e-mail invalide.'),
  phone: z.string().trim().min(6, 'Indiquez un numéro de téléphone valide.'),
  city: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone']).optional(),
  comments: z.string().optional(),
  consentConfirmed: z.literal(true, { message: 'Le consentement est requis pour traiter votre demande.' }),
})

export const quoteRequestSchema = z.object({
  need: quoteNeedSchema,
  configuration: quoteConfigurationSchema,
  productionAndDelivery: quoteProductionAndDeliverySchema,
  files: quoteFilesSchema,
  contact: quoteContactSchema,
  honeypot: z.string().optional(),
  idempotencyKey: z.string().min(1),
})

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>

export const REQUEST_TYPE_LABELS: Record<QuoteRequestInput['need']['requestType'], string> = {
  'product-printing': "Impression d'un produit",
  advisory: 'Conseil et accompagnement',
  'custom-packaging': 'Packaging sur mesure',
  'large-format': 'Grand format ou signalétique',
  'multi-site-campaign': 'Campagne multi-sites',
  other: 'Autre demande',
}
