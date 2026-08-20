/**
 * Real editorial content for solutions "par besoin" and the 3 operational
 * solutions (brief sections 10 and 37). The `solutions` collection has no
 * long-form body field — only short text fields plus a `process` step
 * array — so narrative lists from the brief are folded into `problem` /
 * `desiredOutcome` as labelled plain-text summaries.
 */
export type SolutionSeed = {
  slug: string
  title: string
  shortDescription: string
  problem: string
  desiredOutcome: string
  process: { title: string; description: string }[]
  quoteCTA: string
  seo: { metaTitle: string; metaDescription: string }
  status: 'draft'
}

const METHOD_STEPS = [
  'Définir l’objectif et l’audience.',
  'Choisir les points de contact.',
  'Sélectionner les supports.',
  'Préparer les contenus et les fichiers.',
  'Répartir les quantités et destinations.',
  'Soumettre la demande pour étude.',
].map((title) => ({ title, description: '' }))

type NeedSolution = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  h1: string
  supports: string[]
  info: string[]
}

const NEED_SOLUTIONS: NeedSolution[] = [
  {
    slug: 'lancer-une-entreprise',
    title: 'Lancer une entreprise',
    metaTitle: 'Solution impression pour lancer une entreprise | Printcom',
    metaDescription:
      'Cartes de visite, papier à en-tête, enveloppes, chemises, plaquette commerciale et signalétique : préparez l’identité imprimée d’un lancement.',
    h1: 'Une identité prête à rencontrer le monde.',
    supports: ['cartes de visite', 'papier à en-tête', 'enveloppes', 'chemises', 'plaquette commerciale', 'signalétique'],
    info: ['identité validée', 'coordonnées', 'usages', 'quantités', 'formats'],
  },
  {
    slug: 'promouvoir-une-offre',
    title: 'Promouvoir une offre',
    metaTitle: 'Solution impression pour promouvoir une offre | Printcom',
    metaDescription: 'Flyers, dépliants, affiches, coupons et PLV : diffusez une offre avec un message clair et une action visible.',
    h1: 'Un message clair. Une action visible.',
    supports: ['flyers', 'dépliants', 'affiches', 'coupons', 'plv', 'habillage vitrine'],
    info: ['offre', 'audience', 'durée', 'distribution', 'appel à l’action'],
  },
  {
    slug: 'presenter-des-produits',
    title: 'Présenter des produits',
    metaTitle: 'Solution impression pour présenter des produits | Printcom',
    metaDescription: 'Catalogues, brochures, fiches produits et displays : rendez une gamme plus facile à comprendre et à comparer.',
    h1: 'Votre gamme, plus facile à comprendre.',
    supports: ['catalogues', 'brochures', 'fiches produits', 'displays', 'présentoirs'],
    info: ['structure de gamme', 'contenus', 'images', 'références', 'mise à jour'],
  },
  {
    slug: 'emballer-un-produit',
    title: 'Emballer un produit',
    metaTitle: 'Solution impression pour emballer un produit | Printcom',
    metaDescription: 'Boîtes, étuis, fourreaux, étiquettes et sacs : structurez un packaging qui protège le produit et présente la marque.',
    h1: 'Protéger le produit. Présenter la marque.',
    supports: ['boîtes', 'étuis', 'fourreaux', 'étiquettes', 'sacs', 'papier d’emballage'],
    info: ['échantillon', 'dimensions', 'poids', 'matériau', 'montage', 'mentions'],
  },
  {
    slug: 'equiper-un-point-de-vente',
    title: 'Équiper un point de vente',
    metaTitle: 'Solution impression pour équiper un point de vente | Printcom',
    metaDescription: 'Stop-rayons, frontons, présentoirs, vitrines et signalétique : chaque surface peut guider le choix en point de vente.',
    h1: 'Chaque surface peut guider le choix.',
    supports: ['stop-rayons', 'frontons', 'présentoirs', 'vitrines', 'panneaux', 'signalétique'],
    info: ['plan', 'mesures', 'parcours', 'campagne', 'durée', 'installation'],
  },
  {
    slug: 'organiser-un-evenement',
    title: 'Organiser un événement',
    metaTitle: 'Solution impression pour organiser un événement | Printcom',
    metaDescription: 'Invitations, badges, programmes, roll-ups et signalétique : donnez à un événement une lecture commune, de l’accueil au parcours.',
    h1: 'Un espace. Une lecture commune.',
    supports: ['invitations', 'badges', 'programmes', 'roll-ups', 'kakémonos', 'signalétique'],
    info: ['date', 'lieu', 'parcours', 'participants', 'versions', 'montage'],
  },
  {
    slug: 'deployer-une-campagne-nationale',
    title: 'Déployer une campagne nationale',
    metaTitle: 'Solution impression pour déployer une campagne nationale | Printcom',
    metaDescription: 'Affiches, PLV, kits magasin, vitrines et signalétique : structurez une campagne multi-sites avec une cohérence unique.',
    h1: 'Une campagne. Plusieurs sites. Une même cohérence.',
    supports: ['affiches', 'plv', 'kits magasin', 'vitrines', 'signalétique', 'documents'],
    info: ['liste des sites', 'quantités', 'versions', 'conditionnement', 'calendrier'],
  },
  {
    slug: 'imprimer-en-urgence',
    title: 'Imprimer en urgence',
    metaTitle: 'Solution impression pour imprimer en urgence | Printcom',
    metaDescription: 'Transmettez fichier final, quantité, format, finition et date impérative pour faire étudier une demande urgente.',
    h1: 'Aller vite commence par être prêt.',
    supports: ['produits compatibles à confirmer selon équipement et charge'],
    info: ['fichier final', 'quantité', 'format', 'finition', 'destination', 'date impérative'],
  },
]

const OPERATIONAL_SOLUTIONS: SolutionSeed[] = [
  {
    slug: 'production-en-volume',
    title: 'Production en volume',
    shortDescription: 'Répéter sans perdre la cohérence.',
    problem:
      'Ce qu’il faut structurer : références, quantités, versions, fichiers de référence, tolérances, contrôles qualité, calendrier, conditionnement et destinations.',
    desiredOutcome:
      'Ce qui doit être confirmé : seuils de volume, technologies disponibles, capacité, approvisionnement, stockage, libération par lots, délais, modalités de livraison.',
    process: [
      'Réunir les références et quantités',
      'Fixer une version de fichier de référence',
      'Définir les tolérances et contrôles',
      'Planifier le calendrier de production',
      'Organiser le conditionnement',
      'Confirmer les destinations',
    ].map((title) => ({ title, description: '' })),
    quoteCTA: 'Étudier une production en volume',
    seo: {
      metaTitle: 'Production d’imprimés en volume | Printcom',
      metaDescription:
        'Structurez une production en volume avec des références, quantités, versions, fichiers et conditions logistiques clairement documentés.',
    },
    status: 'draft',
  },
  {
    slug: 'campagnes-multi-sites',
    title: 'Campagnes multi-sites',
    shortDescription: 'Une campagne. Chaque site à sa place.',
    problem:
      'Architecture recommandée : référentiel des sites, quantités par site, versions par site, kits, colisage, identification, calendrier, points de contact, suivi des exceptions.',
    desiredOutcome:
      'Données à fournir : liste des sites, contacts par site, quantités, versions, contraintes d’accès, dates, conditionnement, transporteur.',
    process: [
      'Référentiel des sites',
      'Répartition des quantités',
      'Déclinaison des versions',
      'Constitution des kits',
      'Organisation du colisage',
      'Identification par destination',
      'Calendrier de déploiement',
      'Points de contact par site',
      'Suivi des exceptions',
    ].map((title) => ({ title, description: '' })),
    quoteCTA: 'Préparer une campagne multi-sites',
    seo: {
      metaTitle: 'Supports imprimés pour campagnes multi-sites | Printcom',
      metaDescription:
        'Coordonnez produits, versions, kits, points de vente et destinations dans une demande de campagne multi-sites structurée.',
    },
    status: 'draft',
  },
  {
    slug: 'impression-urgente',
    title: 'Impression urgente',
    shortDescription: 'Aller vite commence par un fichier prêt.',
    problem:
      'À transmettre immédiatement : produit, format, quantité, fichier final relu, finitions souhaitées, date impérative, destination, contact disponible.',
    desiredOutcome:
      'Ce qui peut ralentir l’étude : fichier incomplet, format indéfini, quantité incertaine, options non tranchées, destination non confirmée.',
    process: [],
    quoteCTA: 'Soumettre une demande urgente',
    seo: {
      metaTitle: 'Demande d’impression urgente | Printcom',
      metaDescription:
        'Transmettez immédiatement le fichier, le format, la quantité et la date impérative afin que la faisabilité de votre demande soit étudiée.',
    },
    status: 'draft',
  },
]

export const SOLUTIONS: SolutionSeed[] = [
  ...NEED_SOLUTIONS.map((s) => ({
    slug: s.slug,
    title: s.title,
    shortDescription: s.h1,
    problem: `Les supports à envisager : ${s.supports.join(', ')}. Ces produits constituent des points de départ. La configuration finale dépend de l’usage, des contenus, du volume et des contraintes confirmées.`,
    desiredOutcome: `Les informations qui font avancer le projet : ${s.info.join(', ')}.`,
    process: METHOD_STEPS,
    quoteCTA: 'Étudier cette solution',
    seo: { metaTitle: s.metaTitle, metaDescription: s.metaDescription },
    status: 'draft' as const,
  })),
  ...OPERATIONAL_SOLUTIONS,
]
