'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  quoteNeedSchema,
  quoteConfigurationSchema,
  quoteProductionAndDeliverySchema,
  quoteContactSchema,
  REQUEST_TYPE_LABELS,
  type QuoteRequestInput,
} from '@/lib/validation/quote'
import { submitQuoteRequest } from '@/app/(frontend)/demande-de-devis/actions'
import { QuoteStepper } from './QuoteStepper'
import { QuoteSummary } from './QuoteSummary'
import { FileUpload } from './FileUpload'
import { FormField } from './FormField'
import { FormErrorSummary } from './FormErrorSummary'
import { ConsentField } from './ConsentField'
import { TextInput, TextArea, Select } from './inputs'
import { Button } from '@/components/ui/Button'

export interface QuoteOption {
  id: string
  label: string
}

export interface QuoteWizardOptions {
  products: QuoteOption[]
  categories: QuoteOption[]
  sectors: QuoteOption[]
  materials: QuoteOption[]
  finishes: QuoteOption[]
}

export interface QuoteWizardDefaults {
  desiredProduct?: string
  material?: string
  finish?: string
}

/**
 * Local editing state loosens `contact.consentConfirmed` from the zod
 * schema's `literal(true)` to a plain boolean — the checkbox starts
 * unchecked, and quoteContactSchema.safeParse is what actually enforces
 * "must be true" before the wizard advances past step 5 or submits.
 */
type WizardData = Omit<QuoteRequestInput, 'honeypot' | 'idempotencyKey' | 'contact'> & {
  contact: Omit<QuoteRequestInput['contact'], 'consentConfirmed'> & { consentConfirmed: boolean }
}

function buildInitialData(defaults: QuoteWizardDefaults): WizardData {
  return {
    need: {
      requestType: 'product-printing',
      desiredProduct: defaults.desiredProduct,
      category: undefined,
      description: '',
      usage: undefined,
      sector: undefined,
    },
    configuration: {
      material: defaults.material,
      finish: defaults.finish ? [defaults.finish] : undefined,
    },
    productionAndDelivery: {
      urgencyLevel: 'standard',
    },
    files: {
      uploadedFileIds: [],
    },
    contact: {
      company: '',
      fullName: '',
      email: '',
      phone: '',
      consentConfirmed: false,
    },
  }
}

export function QuoteWizard({ options, defaults }: { options: QuoteWizardOptions; defaults: QuoteWizardDefaults }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(() => buildInitialData(defaults))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [])

  const goToStep = (target: number) => {
    setErrors({})
    setStep(target)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const validateStep = (): boolean => {
    let result
    if (step === 1) result = quoteNeedSchema.safeParse(data.need)
    else if (step === 2) result = quoteConfigurationSchema.safeParse(data.configuration)
    else if (step === 3) result = quoteProductionAndDeliverySchema.safeParse(data.productionAndDelivery)
    else if (step === 5) result = quoteContactSchema.safeParse(data.contact)
    else return true

    if (!result.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of result.error.issues) nextErrors[issue.path.join('.')] = issue.message
      setErrors(nextErrors)
      return false
    }
    setErrors({})
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    goToStep(Math.min(6, step + 1))
  }

  const handleSubmit = async () => {
    if (!data.contact.consentConfirmed) {
      goToStep(5)
      setErrors({ consentConfirmed: 'Le consentement est requis pour traiter votre demande.' })
      return
    }

    setIsSubmitting(true)
    setSubmitError(undefined)
    const result = await submitQuoteRequest({
      ...data,
      contact: { ...data.contact, consentConfirmed: true },
      honeypot: '',
      idempotencyKey,
    })
    setIsSubmitting(false)

    if (result.status === 'success' && result.reference) {
      router.push(`/demande-de-devis/merci?reference=${encodeURIComponent(result.reference)}`)
      return
    }

    if (result.errors) {
      setErrors(result.errors)
    }
    setSubmitError(result.message || 'Une erreur est survenue. Merci de réessayer.')
  }

  return (
    <div className="flex flex-col gap-10">
      <QuoteStepper currentStep={step} />
      <FormErrorSummary errors={errors} />
      {submitError ? (
        <p role="alert" className="pc-text-body-small text-error">
          {submitError}
        </p>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-col gap-6">
          <FormField label="Type de demande" htmlFor="requestType" required>
            <Select
              id="requestType"
              value={data.need.requestType}
              onChange={(e) => setData((d) => ({ ...d, need: { ...d.need, requestType: e.target.value as WizardData['need']['requestType'] } }))}
            >
              {Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Produit souhaité" htmlFor="desiredProduct">
              <Select
                id="desiredProduct"
                value={data.need.desiredProduct ?? ''}
                onChange={(e) => setData((d) => ({ ...d, need: { ...d.need, desiredProduct: e.target.value || undefined } }))}
              >
                <option value="">Non déterminé</option>
                {options.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Catégorie" htmlFor="category">
              <Select
                id="category"
                value={data.need.category ?? ''}
                onChange={(e) => setData((d) => ({ ...d, need: { ...d.need, category: e.target.value || undefined } }))}
              >
                <option value="">Non déterminée</option>
                {options.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Secteur" htmlFor="sector">
            <Select
              id="sector"
              value={data.need.sector ?? ''}
              onChange={(e) => setData((d) => ({ ...d, need: { ...d.need, sector: e.target.value || undefined } }))}
            >
              <option value="">Non déterminé</option>
              {options.sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Décrivez votre besoin" htmlFor="description" required error={errors['description']}>
            <TextArea
              id="description"
              rows={5}
              invalid={Boolean(errors['description'])}
              value={data.need.description}
              onChange={(e) => setData((d) => ({ ...d, need: { ...d.need, description: e.target.value } }))}
            />
          </FormField>

          <FormField label="Usage prévu" htmlFor="usage">
            <TextInput
              id="usage"
              value={data.need.usage ?? ''}
              onChange={(e) => setData((d) => ({ ...d, need: { ...d.need, usage: e.target.value } }))}
            />
          </FormField>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Format" htmlFor="format" description="Ex : A4, A5, 210×99 mm…">
              <TextInput
                id="format"
                value={data.configuration.format ?? ''}
                onChange={(e) => setData((d) => ({ ...d, configuration: { ...d.configuration, format: e.target.value } }))}
              />
            </FormField>
            <FormField label="Orientation" htmlFor="orientation">
              <Select
                id="orientation"
                value={data.configuration.orientation ?? ''}
                onChange={(e) => setData((d) => ({ ...d, configuration: { ...d.configuration, orientation: (e.target.value || undefined) as 'portrait' | 'landscape' | undefined } }))}
              >
                <option value="">Non déterminée</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Paysage</option>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Recto / recto-verso" htmlFor="printSides">
              <Select
                id="printSides"
                value={data.configuration.printSides ?? ''}
                onChange={(e) => setData((d) => ({ ...d, configuration: { ...d.configuration, printSides: (e.target.value || undefined) as 'single' | 'double' | undefined } }))}
              >
                <option value="">Non déterminé</option>
                <option value="single">Recto</option>
                <option value="double">Recto-verso</option>
              </Select>
            </FormField>
            <FormField label="Couleur" htmlFor="color" description="Ex : quadrichromie, noir et blanc, Pantone…">
              <TextInput
                id="color"
                value={data.configuration.color ?? ''}
                onChange={(e) => setData((d) => ({ ...d, configuration: { ...d.configuration, color: e.target.value } }))}
              />
            </FormField>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Support" htmlFor="material">
              <Select
                id="material"
                value={data.configuration.material ?? ''}
                onChange={(e) => setData((d) => ({ ...d, configuration: { ...d.configuration, material: e.target.value || undefined } }))}
              >
                <option value="">Non déterminé</option>
                {options.materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Grammage" htmlFor="grammage">
              <TextInput
                id="grammage"
                value={data.configuration.grammage ?? ''}
                onChange={(e) => setData((d) => ({ ...d, configuration: { ...d.configuration, grammage: e.target.value } }))}
              />
            </FormField>
          </div>

          <FormField label="Finitions" htmlFor="finish" description="Maintenez Ctrl/Cmd pour sélectionner plusieurs finitions.">
            <select
              id="finish"
              multiple
              className="min-h-32 w-full rounded-[var(--pc-field-radius)] border border-[var(--pc-field-border-color)] bg-canvas p-3 text-[0.9375rem]"
              value={data.configuration.finish ?? []}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  configuration: { ...d.configuration, finish: Array.from(e.target.selectedOptions).map((o) => o.value) },
                }))
              }
            >
              {options.finishes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Quantité" htmlFor="quantity">
              <TextInput
                id="quantity"
                type="number"
                min={1}
                value={data.configuration.quantity ?? ''}
                onChange={(e) => setData((d) => ({ ...d, configuration: { ...d.configuration, quantity: e.target.value ? Number(e.target.value) : undefined } }))}
              />
            </FormField>
            <FormField label="Nombre de versions" htmlFor="versionsCount">
              <TextInput
                id="versionsCount"
                type="number"
                min={1}
                value={data.configuration.versionsCount ?? ''}
                onChange={(e) => setData((d) => ({ ...d, configuration: { ...d.configuration, versionsCount: e.target.value ? Number(e.target.value) : undefined } }))}
              />
            </FormField>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col gap-6">
          <p className="pc-text-body-small rounded-[var(--pc-radius-sm)] bg-alternate p-4 text-secondary">
            La date demandée sera étudiée et confirmée par l’équipe Printcom.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Date souhaitée" htmlFor="desiredDate">
              <TextInput
                id="desiredDate"
                type="date"
                value={data.productionAndDelivery.desiredDate ?? ''}
                onChange={(e) => setData((d) => ({ ...d, productionAndDelivery: { ...d.productionAndDelivery, desiredDate: e.target.value } }))}
              />
            </FormField>
            <FormField label="Niveau d’urgence" htmlFor="urgencyLevel">
              <Select
                id="urgencyLevel"
                value={data.productionAndDelivery.urgencyLevel}
                onChange={(e) => setData((d) => ({ ...d, productionAndDelivery: { ...d.productionAndDelivery, urgencyLevel: e.target.value as 'standard' | 'urgent' } }))}
              >
                <option value="standard">Standard</option>
                <option value="urgent">Urgent</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Ville" htmlFor="city">
            <TextInput
              id="city"
              value={data.productionAndDelivery.city ?? ''}
              onChange={(e) => setData((d) => ({ ...d, productionAndDelivery: { ...d.productionAndDelivery, city: e.target.value } }))}
            />
          </FormField>

          <FormField label="Adresse ou zone de livraison" htmlFor="addressOrZone">
            <TextArea
              id="addressOrZone"
              rows={3}
              value={data.productionAndDelivery.addressOrZone ?? ''}
              onChange={(e) => setData((d) => ({ ...d, productionAndDelivery: { ...d.productionAndDelivery, addressOrZone: e.target.value } }))}
            />
          </FormField>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 text-[0.9375rem] text-primary">
              <input
                type="checkbox"
                checked={data.productionAndDelivery.multiSiteDelivery ?? false}
                onChange={(e) => setData((d) => ({ ...d, productionAndDelivery: { ...d.productionAndDelivery, multiSiteDelivery: e.target.checked } }))}
                className="h-5 w-5 rounded-[var(--pc-radius-xs)] border border-border-default"
              />
              Livraison multi-sites
            </label>
            <label className="flex items-center gap-3 text-[0.9375rem] text-primary">
              <input
                type="checkbox"
                checked={data.productionAndDelivery.installationRequired ?? false}
                onChange={(e) => setData((d) => ({ ...d, productionAndDelivery: { ...d.productionAndDelivery, installationRequired: e.target.checked } }))}
                className="h-5 w-5 rounded-[var(--pc-radius-xs)] border border-border-default"
              />
              Installation requise sur site
            </label>
          </div>

          {data.productionAndDelivery.multiSiteDelivery ? (
            <FormField label="Nombre de destinations" htmlFor="destinationsCount">
              <TextInput
                id="destinationsCount"
                type="number"
                min={2}
                value={data.productionAndDelivery.destinationsCount ?? ''}
                onChange={(e) => setData((d) => ({ ...d, productionAndDelivery: { ...d.productionAndDelivery, destinationsCount: e.target.value ? Number(e.target.value) : undefined } }))}
              />
            </FormField>
          ) : null}

          <FormField label="Commentaires logistiques" htmlFor="logisticsComments">
            <TextArea
              id="logisticsComments"
              rows={3}
              value={data.productionAndDelivery.logisticsComments ?? ''}
              onChange={(e) => setData((d) => ({ ...d, productionAndDelivery: { ...d.productionAndDelivery, logisticsComments: e.target.value } }))}
            />
          </FormField>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 text-[0.9375rem] text-primary">
              <input
                type="checkbox"
                checked={data.files.filesReady ?? false}
                onChange={(e) => setData((d) => ({ ...d, files: { ...d.files, filesReady: e.target.checked } }))}
                className="h-5 w-5 rounded-[var(--pc-radius-xs)] border border-border-default"
              />
              Mes fichiers sont prêts
            </label>
            <label className="flex items-center gap-3 text-[0.9375rem] text-primary">
              <input
                type="checkbox"
                checked={data.files.needsFileCheck ?? false}
                onChange={(e) => setData((d) => ({ ...d, files: { ...d.files, needsFileCheck: e.target.checked } }))}
                className="h-5 w-5 rounded-[var(--pc-radius-xs)] border border-border-default"
              />
              Je souhaite un contrôle de fichiers
            </label>
            <label className="flex items-center gap-3 text-[0.9375rem] text-primary">
              <input
                type="checkbox"
                checked={data.files.needsGraphicDesign ?? false}
                onChange={(e) => setData((d) => ({ ...d, files: { ...d.files, needsGraphicDesign: e.target.checked } }))}
                className="h-5 w-5 rounded-[var(--pc-radius-xs)] border border-border-default"
              />
              J’ai besoin d’une création graphique
            </label>
          </div>

          <FileUpload onFilesChange={(ids) => setData((d) => ({ ...d, files: { ...d.files, uploadedFileIds: ids } }))} />

          <FormField label="Lien externe vers vos fichiers" htmlFor="externalLink" description="WeTransfer, Google Drive…">
            <TextInput
              id="externalLink"
              value={data.files.externalLink ?? ''}
              onChange={(e) => setData((d) => ({ ...d, files: { ...d.files, externalLink: e.target.value } }))}
            />
          </FormField>

          <FormField label="Commentaires" htmlFor="filesComments">
            <TextArea
              id="filesComments"
              rows={3}
              value={data.files.comments ?? ''}
              onChange={(e) => setData((d) => ({ ...d, files: { ...d.files, comments: e.target.value } }))}
            />
          </FormField>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Entreprise" htmlFor="company" required error={errors['company']}>
              <TextInput
                id="company"
                invalid={Boolean(errors['company'])}
                value={data.contact.company}
                onChange={(e) => setData((d) => ({ ...d, contact: { ...d.contact, company: e.target.value } }))}
              />
            </FormField>
            <FormField label="Fonction" htmlFor="jobTitle">
              <TextInput
                id="jobTitle"
                value={data.contact.jobTitle ?? ''}
                onChange={(e) => setData((d) => ({ ...d, contact: { ...d.contact, jobTitle: e.target.value } }))}
              />
            </FormField>
          </div>

          <FormField label="Nom et prénom" htmlFor="fullName" required error={errors['fullName']}>
            <TextInput
              id="fullName"
              invalid={Boolean(errors['fullName'])}
              value={data.contact.fullName}
              onChange={(e) => setData((d) => ({ ...d, contact: { ...d.contact, fullName: e.target.value } }))}
            />
          </FormField>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="E-mail" htmlFor="email" required error={errors['email']}>
              <TextInput
                id="email"
                type="email"
                invalid={Boolean(errors['email'])}
                value={data.contact.email}
                onChange={(e) => setData((d) => ({ ...d, contact: { ...d.contact, email: e.target.value } }))}
              />
            </FormField>
            <FormField label="Téléphone" htmlFor="phone" required error={errors['phone']}>
              <TextInput
                id="phone"
                type="tel"
                invalid={Boolean(errors['phone'])}
                value={data.contact.phone}
                onChange={(e) => setData((d) => ({ ...d, contact: { ...d.contact, phone: e.target.value } }))}
              />
            </FormField>
          </div>

          <FormField label="Mode de contact préféré" htmlFor="preferredContactMethod">
            <Select
              id="preferredContactMethod"
              value={data.contact.preferredContactMethod ?? ''}
              onChange={(e) => setData((d) => ({ ...d, contact: { ...d.contact, preferredContactMethod: (e.target.value || undefined) as 'email' | 'phone' | undefined } }))}
            >
              <option value="">Indifférent</option>
              <option value="email">E-mail</option>
              <option value="phone">Téléphone</option>
            </Select>
          </FormField>

          <FormField label="Commentaires" htmlFor="contactComments">
            <TextArea
              id="contactComments"
              rows={3}
              value={data.contact.comments ?? ''}
              onChange={(e) => setData((d) => ({ ...d, contact: { ...d.contact, comments: e.target.value } }))}
            />
          </FormField>

          <ConsentField
            error={errors['consentConfirmed']}
            checked={data.contact.consentConfirmed}
            onChange={(checked) => setData((d) => ({ ...d, contact: { ...d.contact, consentConfirmed: checked } }))}
          />
        </div>
      ) : null}

      {step === 6 ? (
        <QuoteSummary data={data} options={options} uploadedFileCount={data.files.uploadedFileIds?.length ?? 0} onEditStep={goToStep} />
      ) : null}

      <div className="flex items-center justify-between border-t border-(--pc-color-border-subtle) pt-6">
        {step > 1 ? (
          <Button type="button" variant="secondary" onClick={() => goToStep(step - 1)} disabled={isSubmitting}>
            Précédent
          </Button>
        ) : (
          <span />
        )}
        {step < 6 ? (
          <Button type="button" onClick={handleNext}>
            Continuer
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Envoi en cours…' : 'Envoyer ma demande de devis'}
          </Button>
        )}
      </div>
    </div>
  )
}
