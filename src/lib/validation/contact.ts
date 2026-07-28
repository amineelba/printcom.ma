import { z } from 'zod'

export const contactFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Indiquez votre nom complet.'),
  company: z.string().trim().optional(),
  email: z.string().trim().email('Adresse e-mail invalide.'),
  phone: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  message: z.string().trim().min(10, 'Votre message doit contenir au moins 10 caractères.'),
  consentConfirmed: z
    .union([z.literal('true'), z.literal('on'), z.boolean()])
    .refine((v) => v === true || v === 'true' || v === 'on', {
      message: 'Le consentement est requis pour vous répondre.',
    }),
  website: z.string().optional(), // honeypot
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
