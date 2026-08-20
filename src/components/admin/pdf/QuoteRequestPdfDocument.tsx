import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type {
  Finish,
  Material,
  PrivateQuoteFile,
  Product,
  ProductCategory,
  QuoteRequest,
  Sector,
  User,
} from '@/payload-types'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingHorizontal: 40,
    paddingVertical: 36,
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2 solid #1a1a1a',
    paddingBottom: 12,
    marginBottom: 18,
  },
  brand: { fontSize: 16, fontWeight: 700 },
  headerRight: { textAlign: 'right' },
  reference: { fontSize: 12, fontWeight: 700 },
  metaLine: { fontSize: 9, color: '#555555', marginTop: 2 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: '#f2f2f2',
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: '38%', color: '#555555' },
  value: { width: '62%' },
  paragraph: { marginTop: 2, lineHeight: 1.4 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#888888',
    textAlign: 'center',
    borderTop: '1 solid #dddddd',
    paddingTop: 6,
  },
})

function Row({ label, value }: { label: string; value?: null | number | string }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  )
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  'product-printing': "Impression d'un produit",
  advisory: 'Conseil et accompagnement',
  'custom-packaging': 'Packaging sur mesure',
  'large-format': 'Grand format ou signalétique',
  'multi-site-campaign': 'Campagne multi-sites',
  other: 'Autre demande',
}

const URGENCY_LABELS: Record<string, string> = { standard: 'Standard', urgent: 'Urgent' }
const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  reviewing: 'En cours d’examen',
  'information-required': 'Information requise',
  qualified: 'Qualifié',
  'quotation-preparation': 'Préparation du devis',
  'quotation-sent': 'Devis envoyé',
  negotiation: 'Négociation',
  won: 'Gagné',
  lost: 'Perdu',
  archived: 'Archivé',
  spam: 'Spam',
}
const PRIORITY_LABELS: Record<string, string> = { low: 'Basse', normal: 'Normale', high: 'Haute' }

const formatDate = (value: null | string | undefined) => (value ? new Date(value).toLocaleDateString('fr-FR') : undefined)
const formatDateTime = (value: null | string | undefined) =>
  value ? new Date(value).toLocaleString('fr-FR') : undefined
const yesNo = (value: boolean | null | undefined) => (value ? 'Oui' : 'Non')
const titleOf = (value: null | number | { title: string } | undefined) =>
  value && typeof value === 'object' ? value.title : undefined

export function QuoteRequestPdfDocument({ quoteRequest }: { quoteRequest: QuoteRequest }) {
  const need = quoteRequest.need
  const configuration = quoteRequest.configuration
  const production = quoteRequest.productionAndDelivery
  const files = quoteRequest.files
  const contact = quoteRequest.contact
  const workflow = quoteRequest.workflow

  const desiredProduct = titleOf(need?.desiredProduct as Product | number | null | undefined)
  const category = titleOf(need?.category as ProductCategory | number | null | undefined)
  const sector = titleOf(need?.sector as Sector | number | null | undefined)
  const material = titleOf(configuration?.material as Material | number | null | undefined)
  const finishes = Array.isArray(configuration?.finish)
    ? (configuration.finish as (Finish | number)[])
        .map((f) => (typeof f === 'object' ? f.title : undefined))
        .filter(Boolean)
        .join(', ')
    : undefined
  const uploadedFiles = Array.isArray(files?.uploadedFiles)
    ? (files.uploadedFiles as (number | PrivateQuoteFile)[]).filter(
        (f): f is PrivateQuoteFile => typeof f === 'object',
      )
    : []
  const assignedUser = workflow?.assignedTo as number | User | null | undefined
  const assignedToName =
    assignedUser && typeof assignedUser === 'object' ? assignedUser.email : undefined

  const customFormat =
    configuration?.customFormatWidth && configuration?.customFormatHeight
      ? `${configuration.customFormatWidth} x ${configuration.customFormatHeight} ${configuration.customFormatUnit || 'mm'}`
      : undefined

  return (
    <Document
      title={`Demande de devis ${quoteRequest.reference}`}
      author="Printcom"
      subject="Demande de devis structurée"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Printcom</Text>
            <Text style={styles.metaLine}>Document interne — demande de devis structurée</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reference}>{quoteRequest.reference}</Text>
            <Text style={styles.metaLine}>Reçue le {formatDateTime(quoteRequest.createdAt)}</Text>
          </View>
        </View>

        <Section title="Besoin">
          <Row label="Type de demande" value={need?.requestType ? REQUEST_TYPE_LABELS[need.requestType] : undefined} />
          <Row label="Produit souhaité" value={desiredProduct} />
          <Row label="Catégorie" value={category} />
          <Row label="Secteur" value={sector} />
          <Row label="Usage" value={need?.usage} />
          {need?.description ? <Text style={styles.paragraph}>{need.description}</Text> : null}
        </Section>

        <Section title="Configuration">
          <Row label="Format" value={configuration?.format} />
          <Row label="Format personnalisé" value={customFormat} />
          <Row
            label="Orientation"
            value={
              configuration?.orientation === 'portrait'
                ? 'Portrait'
                : configuration?.orientation === 'landscape'
                  ? 'Paysage'
                  : undefined
            }
          />
          <Row label="Nombre de pages" value={configuration?.pageCount} />
          <Row
            label="Impression"
            value={
              configuration?.printSides === 'single'
                ? 'Recto'
                : configuration?.printSides === 'double'
                  ? 'Recto-verso'
                  : undefined
            }
          />
          <Row label="Couleur" value={configuration?.color} />
          <Row label="Support" value={material} />
          <Row label="Grammage" value={configuration?.grammage} />
          <Row label="Finitions" value={finishes} />
          <Row label="Reliure" value={configuration?.binding} />
          <Row label="Quantité" value={configuration?.quantity} />
          <Row label="Nombre de versions" value={configuration?.versionsCount} />
          <Row label="Personnalisation variable" value={configuration?.variablePersonalization !== undefined ? yesNo(configuration.variablePersonalization) : undefined} />
        </Section>

        <Section title="Production et livraison">
          <Row label="Date souhaitée" value={formatDate(production?.desiredDate)} />
          <Row label="Urgence" value={production?.urgencyLevel ? URGENCY_LABELS[production.urgencyLevel] : undefined} />
          <Row label="Ville" value={production?.city} />
          <Row label="Adresse ou zone" value={production?.addressOrZone} />
          <Row label="Livraison multi-sites" value={production?.multiSiteDelivery !== undefined ? yesNo(production.multiSiteDelivery) : undefined} />
          <Row label="Nombre de destinations" value={production?.destinationsCount} />
          <Row label="Installation requise" value={production?.installationRequired !== undefined ? yesNo(production.installationRequired) : undefined} />
          {production?.logisticsComments ? <Text style={styles.paragraph}>{production.logisticsComments}</Text> : null}
        </Section>

        <Section title="Fichiers">
          <Row label="Fichiers prêts" value={files?.filesReady !== undefined ? yesNo(files.filesReady) : undefined} />
          <Row label="Contrôle de fichier demandé" value={files?.needsFileCheck !== undefined ? yesNo(files.needsFileCheck) : undefined} />
          <Row label="Création graphique demandée" value={files?.needsGraphicDesign !== undefined ? yesNo(files.needsGraphicDesign) : undefined} />
          <Row
            label="Fichiers joints"
            value={uploadedFiles.length ? `${uploadedFiles.length} fichier(s) — voir l’espace privé dans l’administration` : undefined}
          />
          <Row label="Lien externe" value={files?.externalLink} />
          {files?.comments ? <Text style={styles.paragraph}>{files.comments}</Text> : null}
        </Section>

        <Section title="Contact">
          <Row label="Entreprise" value={contact?.company} />
          <Row label="Nom et prénom" value={contact?.fullName} />
          <Row label="Fonction" value={contact?.jobTitle} />
          <Row label="E-mail" value={contact?.email} />
          <Row label="Téléphone" value={contact?.phone} />
          <Row label="Ville" value={contact?.city} />
          <Row
            label="Mode de contact préféré"
            value={
              contact?.preferredContactMethod === 'email'
                ? 'E-mail'
                : contact?.preferredContactMethod === 'phone'
                  ? 'Téléphone'
                  : undefined
            }
          />
          <Row
            label="Consentement"
            value={
              contact?.consentConfirmed
                ? `Confirmé${contact.consentTimestamp ? ` le ${formatDateTime(contact.consentTimestamp)}` : ''}`
                : 'Non confirmé'
            }
          />
          {contact?.comments ? <Text style={styles.paragraph}>{contact.comments}</Text> : null}
        </Section>

        <Section title="Suivi commercial (interne)">
          <Row label="Statut" value={workflow?.status ? STATUS_LABELS[workflow.status] : undefined} />
          <Row label="Priorité" value={workflow?.priority ? PRIORITY_LABELS[workflow.priority] : undefined} />
          <Row label="Assigné à" value={assignedToName} />
          <Row label="Valeur estimée" value={workflow?.estimatedValue ? `${workflow.estimatedValue} MAD` : undefined} />
          <Row label="Date de relance" value={formatDate(workflow?.followUpDate)} />
          {workflow?.internalNotes ? <Text style={styles.paragraph}>{workflow.internalNotes}</Text> : null}
        </Section>

        <Text style={styles.footer}>
          Document généré le {formatDateTime(new Date().toISOString())} — usage interne uniquement. Ceci ne
          constitue ni une commande, ni une confirmation de prix, de disponibilité ou de délai.
        </Text>
      </Page>
    </Document>
  )
}
