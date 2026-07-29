import { richText } from './richText'

/** Real editorial content for services and sub-services (brief section 9). */
export type ServiceSeed = {
  slug: string
  title: string
  parent?: string
  order: number
  shortDescription: string
  description: ReturnType<typeof richText>
  steps?: { title: string; description: string }[]
  seo: { metaTitle: string; metaDescription: string }
  status: 'draft'
}

const INFORMATION_REQUIRED = [
  'Produit ou support concerné',
  'Objectif',
  'Quantité envisagée',
  'Format ou dimensions',
  'Date souhaitée',
  'Fichiers disponibles',
  'Contraintes particulières',
]

type TopService = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  h1: string
  intro: string
  outcome: string
  steps: string[]
  subServices: { title: string; tagline: string; sentence: string }[]
}

const TOP_SERVICES: TopService[] = [
  {
    slug: 'conseil-accompagnement',
    title: 'Conseil et accompagnement',
    metaTitle: 'Conseil et accompagnement pour vos impressions | Printcom',
    metaDescription:
      'Avant le format et le papier, il y a l’objectif. Le conseil aide à clarifier l’usage, le volume, les contraintes et le niveau de finition pour construire une demande cohérente.',
    h1: 'Commencer par les bonnes questions.',
    intro:
      'Avant le format et le papier, il y a l’objectif. Le conseil aide à clarifier l’usage, le volume, les contraintes et le niveau de finition pour construire une demande cohérente.',
    outcome: 'Une configuration compréhensible, comparable et prête à être étudiée.',
    steps: ['Comprendre le contexte', 'Définir l’usage', 'Comparer les options', 'Formaliser la configuration'],
    subServices: [
      {
        title: 'Analyse du besoin',
        tagline: 'Transformer une intention en brief exploitable.',
        sentence: 'Objectif, audience, quantité, contexte et date souhaitée sont réunis dans une lecture commune.',
      },
      {
        title: 'Conseil sur les supports',
        tagline: 'Choisir la matière qui sert le message.',
        sentence: 'Le support est évalué selon l’usage, la manipulation, la durée et le rendu attendu.',
      },
      {
        title: 'Optimisation des configurations',
        tagline: 'Simplifier sans perdre l’essentiel.',
        sentence: 'Les options sont hiérarchisées pour éviter les choix inutiles et préserver la fonction du produit.',
      },
      {
        title: 'Planification de production',
        tagline: 'Rendre les étapes visibles.',
        sentence: 'Les validations, fichiers et contraintes sont organisés avant l’étude du calendrier.',
      },
    ],
  },
  {
    slug: 'studio-graphique',
    title: 'Studio graphique',
    metaTitle: 'Studio graphique pour vos impressions | Printcom',
    metaDescription:
      'Un visuel destiné à l’écran ne devient pas automatiquement un bon fichier d’impression. Le studio organise la composition, les formats et les déclinaisons pour le support final.',
    h1: 'Un fichier pensé pour devenir un objet.',
    intro:
      'Un visuel destiné à l’écran ne devient pas automatiquement un bon fichier d’impression. Le studio organise la composition, les formats et les déclinaisons pour le support final.',
    outcome: 'Des fichiers cohérents, structurés et adaptés aux formats validés.',
    steps: ['Recevoir les éléments', 'Définir la hiérarchie', 'Adapter au support', 'Préparer les déclinaisons'],
    subServices: [
      {
        title: 'Création graphique',
        tagline: 'Donner une forme claire au contenu.',
        sentence: 'La composition relie message, identité, images et contraintes du support.',
      },
      {
        title: 'Mise en page',
        tagline: 'Créer un rythme de lecture.',
        sentence: 'Titres, textes, images, tableaux et espaces sont organisés pour guider le regard.',
      },
      {
        title: 'Adaptation de formats',
        tagline: 'Changer de taille sans perdre l’idée.',
        sentence: 'La composition est repensée pour chaque proportion au lieu d’être simplement étirée.',
      },
      {
        title: 'Exécution graphique',
        tagline: 'Rendre le concept techniquement exploitable.',
        sentence: 'Les éléments approuvés sont assemblés dans des fichiers conformes au gabarit retenu.',
      },
      {
        title: 'Déclinaison de campagnes',
        tagline: 'Une campagne. Plusieurs points de contact.',
        sentence: 'Le système visuel est adapté à chaque produit, format, lieu ou version.',
      },
    ],
  },
  {
    slug: 'prepresse',
    title: 'Prépresse',
    metaTitle: 'Prépresse pour vos impressions | Printcom',
    metaDescription:
      'Le prépresse vérifie ce que l’écran ne montre pas toujours : dimensions, fonds perdus, résolution, couleurs, polices, transparences et éléments de découpe.',
    h1: 'Le dernier contrôle avant la matière.',
    intro:
      'Le prépresse vérifie ce que l’écran ne montre pas toujours : dimensions, fonds perdus, résolution, couleurs, polices, transparences et éléments de découpe.',
    outcome: 'Un fichier techniquement prêt à passer à l’étape suivante, sous réserve de validation.',
    steps: ['Contrôler le format', 'Vérifier les images et couleurs', 'Identifier les anomalies', 'Valider la version finale'],
    subServices: [
      {
        title: 'Vérification des fichiers',
        tagline: 'Détecter avant de produire.',
        sentence: 'Le fichier est contrôlé selon le produit, le gabarit et les paramètres fournis.',
      },
      {
        title: 'Contrôle colorimétrique',
        tagline: 'Préparer une couleur destinée à l’impression.',
        sentence: 'Les modes colorimétriques, profils et tons directs sont vérifiés selon le procédé retenu.',
      },
      {
        title: 'Imposition',
        tagline: 'Organiser les pages pour la fabrication.',
        sentence: 'Les pages ou poses sont disposées selon le format, le pliage, la coupe et la production.',
      },
      {
        title: 'Épreuvage',
        tagline: 'Voir une référence avant le lancement.',
        sentence: 'Une épreuve peut servir à valider le contenu, la couleur ou la structure selon le besoin.',
      },
      {
        title: 'Bon à tirer',
        tagline: 'Valider la version qui fait foi.',
        sentence: 'Le BAT formalise l’accord sur le contenu et les paramètres présentés avant production.',
      },
      {
        title: 'Préparation de production',
        tagline: 'Réunir les éléments utiles au lancement.',
        sentence: 'Les fichiers, repères, formes et instructions sont consolidés dans une version contrôlée.',
      },
    ],
  },
  {
    slug: 'production',
    title: 'Production',
    metaTitle: 'Production pour vos impressions | Printcom',
    metaDescription:
      'La technologie d’impression dépend du support, de la quantité, du format, de la personnalisation et du rendu attendu. Seules les capacités confirmées de Printcom doivent être proposées.',
    h1: 'La bonne technologie pour le bon projet.',
    intro:
      'La technologie d’impression dépend du support, de la quantité, du format, de la personnalisation et du rendu attendu. Seules les capacités confirmées de Printcom doivent être proposées.',
    outcome: 'Une orientation de production fondée sur les caractéristiques réelles du projet.',
    steps: ['Valider la configuration', 'Choisir la technologie confirmée', 'Lancer selon le BAT', 'Contrôler les éléments définis'],
    subServices: [
      {
        title: 'Impression offset',
        tagline: 'Pensée pour la répétition et la stabilité.',
        sentence: 'L’offset peut convenir à des tirages structurés sur papier ou carton, selon la configuration.',
      },
      {
        title: 'Impression numérique',
        tagline: 'Souple pour les séries et les versions.',
        sentence: 'Le numérique peut faciliter les petites quantités, les délais courts ou la personnalisation.',
      },
      {
        title: 'Impression grand format',
        tagline: 'Une image préparée pour l’échelle.',
        sentence: 'Le grand format répond aux supports visibles à distance ou intégrés dans l’espace.',
      },
      {
        title: 'Impression sur supports rigides',
        tagline: 'Imprimer directement sur une structure.',
        sentence: 'Selon l’équipement confirmé, certains panneaux ou matériaux peuvent recevoir une impression adaptée.',
      },
      {
        title: 'Sérigraphie',
        tagline: 'Déposer l’encre avec maîtrise.',
        sentence: 'La sérigraphie peut convenir à certains supports, aplats, séries ou usages spécifiques.',
      },
      {
        title: 'Impression d’étiquettes',
        tagline: 'Produire selon la pose et le conditionnement.',
        sentence: 'La forme, la matière, l’adhésif et le mode d’application guident la configuration.',
      },
    ],
  },
  {
    slug: 'faconnage',
    title: 'Façonnage',
    metaTitle: 'Façonnage pour vos impressions | Printcom',
    metaDescription:
      'Après l’impression, la coupe, le pli, l’assemblage ou la reliure transforment le support en produit utilisable. Chaque opération doit être anticipée dès le fichier.',
    h1: 'L’impression prend sa forme finale.',
    intro:
      'Après l’impression, la coupe, le pli, l’assemblage ou la reliure transforment le support en produit utilisable. Chaque opération doit être anticipée dès le fichier.',
    outcome: 'Un produit fini dont la structure correspond à l’usage prévu.',
    steps: ['Définir la forme', 'Préparer les repères', 'Réaliser les opérations confirmées', 'Contrôler l’assemblage'],
    subServices: [
      {
        title: 'Découpe',
        tagline: 'Donner au support sa dimension ou sa forme.',
        sentence: 'La coupe droite, la forme ou la mi-chair sont préparées selon le produit et le matériau.',
      },
      {
        title: 'Pliage',
        tagline: 'Créer un ordre de lecture dans la feuille.',
        sentence: 'Le pli organise les faces et doit être intégré à la composition dès la conception.',
      },
      {
        title: 'Rainage',
        tagline: 'Préparer le pli sans contraindre la matière.',
        sentence: 'Une ligne de rainage aide certains papiers ou cartons à se plier plus proprement.',
      },
      {
        title: 'Perforation',
        tagline: 'Permettre de détacher ou classer.',
        sentence: 'La perforation est placée selon la fonction du document et sa manipulation.',
      },
      {
        title: 'Assemblage',
        tagline: 'Réunir plusieurs éléments en un produit.',
        sentence: 'Feuilles, pièces, calages ou supports sont regroupés selon une séquence définie.',
      },
      {
        title: 'Collage',
        tagline: 'Fermer, fixer ou former.',
        sentence: 'Le collage intervient dans les boîtes, pochettes, chemises et autres structures.',
      },
      {
        title: 'Reliure',
        tagline: 'Faire tenir les pages. Et le temps.',
        sentence: 'Le mode de reliure dépend du volume, de l’ouverture, de la fréquence d’usage et du rendu.',
      },
      {
        title: 'Conditionnement',
        tagline: 'Préparer le produit pour son parcours.',
        sentence: 'Les lots, protections et répartitions sont définis selon la livraison ou le déploiement.',
      },
    ],
  },
  {
    slug: 'livraison-deploiement',
    title: 'Livraison et déploiement',
    metaTitle: 'Livraison et déploiement pour vos impressions | Printcom',
    metaDescription:
      'Le conditionnement, la répartition, les destinations et l’installation peuvent modifier la manière dont un projet doit être préparé. Ces besoins sont intégrés dès la demande.',
    h1: 'Le projet ne s’arrête pas à l’atelier.',
    intro:
      'Le conditionnement, la répartition, les destinations et l’installation peuvent modifier la manière dont un projet doit être préparé. Ces besoins sont intégrés dès la demande.',
    outcome: 'Une organisation logistique documentée, sous réserve des zones et services confirmés.',
    steps: ['Définir les destinations', 'Préparer les répartitions', 'Valider les contraintes d’accès', 'Organiser la remise ou l’installation'],
    subServices: [
      {
        title: 'Livraison nationale',
        tagline: 'Préparer une destination clairement définie.',
        sentence: 'La disponibilité, les zones, les modalités et les délais doivent être confirmés par Printcom.',
      },
      {
        title: 'Livraison multi-sites',
        tagline: 'Un projet. Plusieurs destinations.',
        sentence: 'Les quantités sont réparties par site avec des consignes de conditionnement et d’identification.',
      },
      {
        title: 'Gestion des stocks',
        tagline: 'Produire et libérer selon le besoin.',
        sentence: 'Ce service doit rester masqué tant que la capacité de stockage et ses conditions ne sont pas confirmées.',
      },
      {
        title: 'Préparation par point de vente',
        tagline: 'Chaque site reçoit ce qui lui correspond.',
        sentence: 'Les lots peuvent être organisés par destination, campagne ou configuration validée.',
      },
      {
        title: 'Installation de signalétique',
        tagline: 'Préparer le support pour le lieu réel.',
        sentence: 'La visite, les mesures, l’accès, la fixation et les responsabilités doivent être validés.',
      },
      {
        title: 'Déploiement de campagnes',
        tagline: 'Coordonner les supports et les destinations.',
        sentence: 'Une campagne multi-sites nécessite nomenclature, quantités, versions, colisage et calendrier.',
      },
    ],
  },
]

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const SERVICES: ServiceSeed[] = TOP_SERVICES.flatMap((service, index) => {
  const parent: ServiceSeed = {
    slug: service.slug,
    title: service.title,
    order: index + 1,
    shortDescription: service.h1,
    description: richText([
      { p: service.intro },
      { h2: 'Ce que ce service apporte' },
      { p: service.outcome },
      { h2: 'Informations à fournir' },
      { ul: INFORMATION_REQUIRED },
    ]),
    steps: service.steps.map((title) => ({ title, description: '' })),
    seo: { metaTitle: service.metaTitle, metaDescription: service.metaDescription },
    status: 'draft',
  }

  const children: ServiceSeed[] = service.subServices.map((sub, subIndex) => ({
    slug: slugify(sub.title),
    title: sub.title,
    parent: service.slug,
    order: subIndex + 1,
    shortDescription: sub.tagline,
    description: richText([{ p: sub.sentence }]),
    seo: {
      metaTitle: `${sub.title} pour l’impression | Printcom`,
      metaDescription: `${sub.tagline} Découvrez les informations à préparer avant d’intégrer ce besoin à votre demande Printcom.`,
    },
    status: 'draft',
  }))

  return [parent, ...children]
})
