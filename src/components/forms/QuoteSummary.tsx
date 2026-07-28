import type { QuoteRequestInput } from '@/lib/validation/quote'
import { REQUEST_TYPE_LABELS } from '@/lib/validation/quote'

interface OptionLookup {
  products: { id: string; label: string }[]
  categories: { id: string; label: string }[]
  sectors: { id: string; label: string }[]
  materials: { id: string; label: string }[]
  finishes: { id: string; label: string }[]
}

function labelFor(list: { id: string; label: string }[], id?: string) {
  return list.find((item) => item.id === id)?.label
}

export function QuoteSummary({
  data,
  options,
  uploadedFileCount,
  onEditStep,
}: {
  data: Omit<QuoteRequestInput, 'honeypot' | 'idempotencyKey' | 'contact'> & {
    contact: Omit<QuoteRequestInput['contact'], 'consentConfirmed'> & { consentConfirmed: boolean }
  }
  options: OptionLookup
  uploadedFileCount: number
  onEditStep: (step: number) => void
}) {
  const rows: { step: number; title: string; items: [string, string | undefined][] }[] = [
    {
      step: 1,
      title: 'Besoin',
      items: [
        ['Type de demande', REQUEST_TYPE_LABELS[data.need.requestType]],
        ['Produit souhaité', labelFor(options.products, data.need.desiredProduct)],
        ['Catégorie', labelFor(options.categories, data.need.category)],
        ['Secteur', labelFor(options.sectors, data.need.sector)],
        ['Description', data.need.description],
        ['Usage', data.need.usage],
      ],
    },
    {
      step: 2,
      title: 'Configuration',
      items: [
        ['Format', data.configuration.format],
        ['Orientation', data.configuration.orientation],
        ['Recto/verso', data.configuration.printSides === 'double' ? 'Recto-verso' : data.configuration.printSides === 'single' ? 'Recto' : undefined],
        ['Couleur', data.configuration.color],
        ['Support', labelFor(options.materials, data.configuration.material)],
        ['Grammage', data.configuration.grammage],
        ['Finitions', data.configuration.finish?.map((id) => labelFor(options.finishes, id)).filter(Boolean).join(', ')],
        ['Quantité', data.configuration.quantity ? String(data.configuration.quantity) : undefined],
      ],
    },
    {
      step: 3,
      title: 'Production et livraison',
      items: [
        ['Date souhaitée', data.productionAndDelivery.desiredDate],
        ['Urgence', data.productionAndDelivery.urgencyLevel === 'urgent' ? 'Urgent' : 'Standard'],
        ['Ville', data.productionAndDelivery.city],
        ['Livraison multi-sites', data.productionAndDelivery.multiSiteDelivery ? 'Oui' : 'Non'],
        ['Installation requise', data.productionAndDelivery.installationRequired ? 'Oui' : 'Non'],
      ],
    },
    {
      step: 4,
      title: 'Fichiers',
      items: [
        ['Fichiers prêts', data.files.filesReady ? 'Oui' : 'Non'],
        ['Fichiers joints', String(uploadedFileCount)],
        ['Besoin de contrôle', data.files.needsFileCheck ? 'Oui' : 'Non'],
        ['Besoin de création graphique', data.files.needsGraphicDesign ? 'Oui' : 'Non'],
      ],
    },
    {
      step: 5,
      title: 'Contact',
      items: [
        ['Entreprise', data.contact.company],
        ['Nom', data.contact.fullName],
        ['Fonction', data.contact.jobTitle],
        ['E-mail', data.contact.email],
        ['Téléphone', data.contact.phone],
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      {rows.map((section) => (
        <div key={section.title} className="rounded-card border border-border-subtle p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[1.0625rem] font-semibold text-primary">{section.title}</h3>
            <button type="button" onClick={() => onEditStep(section.step)} className="pc-text-footnote font-medium text-link">
              Modifier
            </button>
          </div>
          <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {section.items
              .filter(([, value]) => Boolean(value))
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="pc-text-footnote text-tertiary">{label}</dt>
                  <dd className="text-[0.9375rem] text-primary">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      ))}
    </div>
  )
}
