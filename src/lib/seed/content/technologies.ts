import { richText } from './richText'

/**
 * Real editorial content for print technologies (brief section 12). Every
 * technology is `draft` + `verificationStatus: unverified` — the frontend
 * requires both to be flipped (status=published AND verified=confirmed)
 * before a technology page can render, since these describe general
 * industry processes, not confirmed Printcom equipment.
 */
export type TechnologySeed = {
  slug: string
  title: string
  shortDescription: string
  description: ReturnType<typeof richText>
  seo: { metaTitle: string; metaDescription: string }
  status: 'draft'
  verificationStatus: 'unverified'
}

const EDITORIAL_LIMIT =
  'Ne pas afficher de capacité, format maximal, vitesse, machine, certification, consommation ou délai sans données validées.'

type TechnologySource = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  h1: string
  envisagedFor: string[]
  infoNeeded: string[]
}

const TECHNOLOGY_SOURCES: TechnologySource[] = [
  {
    slug: 'impression-offset',
    title: 'Impression offset',
    metaTitle: 'Impression offset | Printcom',
    metaDescription: 'Comprenez quand l’offset peut être envisagé pour des tirages structurés et une reproduction stable.',
    h1: 'Des tirages structurés avec une reproduction stable.',
    envisagedFor: ['tirages moyens ou importants', 'publications', 'papeterie', 'brochures', 'catalogues', 'certains packagings'],
    infoNeeded: ['quantité', 'format', 'nombre de couleurs', 'papier', 'finition', 'délai'],
  },
  {
    slug: 'impression-numerique',
    title: 'Impression numérique',
    metaTitle: 'Impression numérique | Printcom',
    metaDescription: 'Découvrez quand le numérique peut apporter de la souplesse pour vos séries, versions et délais.',
    h1: 'Produire avec plus de souplesse.',
    envisagedFor: ['petites séries', 'documents variables', 'prototypes', 'brochures courtes', 'cartes', 'supports urgents'],
    infoNeeded: ['quantité', 'format', 'support', 'couleur', 'personnalisation', 'finition'],
  },
  {
    slug: 'impression-grand-format',
    title: 'Impression grand format',
    metaTitle: 'Impression grand format | Printcom',
    metaDescription: 'Préparez une image pensée pour la distance, la lumière et l’environnement de pose.',
    h1: 'Préparer l’image pour la distance.',
    envisagedFor: ['affichage', 'bâches', 'vitrines', 'murs', 'stands', 'signalétique'],
    infoNeeded: ['dimensions', 'distance', 'support', 'intérieur/extérieur', 'pose', 'durée'],
  },
  {
    slug: 'impression-supports-rigides',
    title: 'Impression sur supports rigides',
    metaTitle: 'Impression sur supports rigides | Printcom',
    metaDescription: 'Comprenez quand un support rigide peut recevoir l’impression directement, selon l’équipement confirmé.',
    h1: 'Quand le support fait partie de la structure.',
    envisagedFor: ['panneaux', 'plaques', 'displays', 'signalétique', 'décoration', 'prototypes'],
    infoNeeded: ['matière', 'épaisseur', 'dimensions', 'encre', 'blanc', 'finition'],
  },
  {
    slug: 'serigraphie',
    title: 'Sérigraphie',
    metaTitle: 'Sérigraphie | Printcom',
    metaDescription: 'Découvrez pour quels supports et aplats la sérigraphie peut être une option adaptée.',
    h1: 'Une couche d’encre adaptée au support.',
    envisagedFor: ['textile sous conditions', 'panneaux', 'objets plats', 'aplats', 'marquage spécifique'],
    infoNeeded: ['support', 'nombre de couleurs', 'taille', 'quantité', 'séchage', 'résistance'],
  },
  {
    slug: 'flexographie',
    title: 'Flexographie',
    metaTitle: 'Flexographie | Printcom',
    metaDescription: 'Comprenez quand la flexographie peut être envisagée pour des supports en bobine.',
    h1: 'Pensée pour les supports en bobine.',
    envisagedFor: ['étiquettes', 'films', 'papiers', 'emballages souples', 'bobines'],
    infoNeeded: ['matière', 'laize', 'couleurs', 'répétition', 'bobine', 'quantité'],
  },
  {
    slug: 'impression-uv',
    title: 'Impression UV',
    metaTitle: 'Impression UV | Printcom',
    metaDescription: 'Découvrez les cas où l’impression UV peut être envisagée pour un séchage immédiat ou des effets sélectifs.',
    h1: 'Sécher immédiatement. Travailler la surface.',
    envisagedFor: ['rigides', 'adhésifs', 'signalétique', 'supports spéciaux', 'effets sélectifs'],
    infoNeeded: ['support', 'adhérence', 'blanc', 'vernis', 'relief', 'dimensions'],
  },
  {
    slug: 'sublimation',
    title: 'Sublimation',
    metaTitle: 'Sublimation | Printcom',
    metaDescription: 'Comprenez quand la sublimation peut être envisagée pour le textile polyester ou la signalétique souple.',
    h1: 'Faire entrer la couleur dans la matière.',
    envisagedFor: ['textile polyester', 'signalétique souple', 'décoration', 'éléments événementiels'],
    infoNeeded: ['matière', 'composition', 'format', 'couleur', 'confection', 'usage'],
  },
]

export const TECHNOLOGIES: TechnologySeed[] = TECHNOLOGY_SOURCES.map((t) => ({
  slug: t.slug,
  title: t.title,
  shortDescription: t.h1,
  description: richText([
    { p: t.h1 },
    { h2: 'Quand cette technologie peut être envisagée' },
    { ul: t.envisagedFor },
    { h2: 'Informations nécessaires' },
    { ul: t.infoNeeded },
    { h2: 'Limites éditoriales' },
    { p: EDITORIAL_LIMIT },
  ]),
  seo: { metaTitle: t.metaTitle, metaDescription: t.metaDescription },
  status: 'draft',
  verificationStatus: 'unverified',
}))
