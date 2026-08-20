/** Real editorial content for solutions "par secteur" (brief section 11). */
export type SectorSeed = {
  slug: string
  title: string
  shortDescription: string
  challenges: { label: string }[]
  printingNeeds: { label: string }[]
  constraints: string
  seo: { metaTitle: string; metaDescription: string }
  status: 'draft'
}

const INTRO =
  'Printcom étudie les contraintes d’impression propres à ce secteur. L’objectif est de relier le support à son environnement réel, à son audience et à la manière dont il sera utilisé.'

const BEFORE_QUOTE_CHECKLIST = [
  'Décrire le contexte et l’objectif.',
  'Identifier les utilisateurs ou destinataires.',
  'Fournir les dimensions et contenus disponibles.',
  'Signaler les contraintes réglementaires applicables.',
  'Préciser les quantités, versions et destinations.',
  'Indiquer la date souhaitée sans la présenter comme garantie.',
]

type SectorSource = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  h1: string
  supports: string[]
  constraints: string[]
}

const SECTOR_SOURCES: SectorSource[] = [
  {
    slug: 'retail-grande-distribution',
    title: 'Retail et grande distribution',
    metaTitle: 'Solutions d’impression pour le retail | Printcom',
    metaDescription: 'PLV, étiquettes, affichage et kits par point de vente : rendez l’offre visible au moment du choix.',
    h1: 'Rendre l’offre visible au moment du choix.',
    supports: ['plv', 'étiquettes', 'affichage', 'habillage de linéaires', 'catalogues', 'kits par point de vente'],
    constraints: ['versions', 'quantités par site', 'durée de campagne', 'plan de pose', 'logistique'],
  },
  {
    slug: 'agroalimentaire',
    title: 'Agroalimentaire',
    metaTitle: 'Solutions d’impression pour l’agroalimentaire | Printcom',
    metaDescription: 'Packaging, étiquettes et fiches produits : informez clairement sans masquer l’essentiel.',
    h1: 'Informer clairement. Présenter sans masquer l’essentiel.',
    supports: ['packaging', 'étiquettes', 'fourreaux', 'présentoirs', 'fiches produits', 'catalogues'],
    constraints: ['dimensions', 'conditions d’usage', 'informations réglementaires fournies', 'surface', 'stockage'],
  },
  {
    slug: 'cosmetique-beaute',
    title: 'Cosmétique et beauté',
    metaTitle: 'Solutions d’impression pour la cosmétique | Printcom',
    metaDescription: 'Étuis, boîtes, étiquettes et displays : le détail fait partie de l’expérience produit.',
    h1: 'Le détail fait partie de l’expérience.',
    supports: ['étuis', 'boîtes', 'étiquettes', 'fourreaux', 'displays', 'supports de lancement'],
    constraints: ['formats compacts', 'courbes', 'humidité', 'finition', 'gamme', 'mentions'],
  },
  {
    slug: 'pharmaceutique-sante',
    title: 'Pharmaceutique et santé',
    metaTitle: 'Solutions d’impression pour la santé | Printcom',
    metaDescription: 'Étuis, étiquettes et notices : la lisibilité reste prioritaire sur tout support de santé.',
    h1: 'La lisibilité reste prioritaire.',
    supports: ['étuis', 'étiquettes', 'notices', 'brochures', 'signalétique', 'documents d’information'],
    constraints: ['contenu réglementé fourni', 'codification', 'traçabilité', 'versions', 'validation'],
  },
  {
    slug: 'hotellerie-restauration',
    title: 'Hôtellerie et restauration',
    metaTitle: 'Solutions d’impression pour l’hôtellerie | Printcom',
    metaDescription: 'Menus, cartes et signalétique : chaque support accompagne le service, du hall à la table.',
    h1: 'Chaque support accompagne le service.',
    supports: ['menus', 'cartes', 'signalétique', 'affichage', 'chevalets', 'supports de chambre', 'packaging'],
    constraints: ['usage fréquent', 'nettoyage', 'langues', 'mises à jour', 'lieu', 'durabilité'],
  },
  {
    slug: 'immobilier-construction',
    title: 'Immobilier et construction',
    metaTitle: 'Solutions d’impression pour l’immobilier | Printcom',
    metaDescription: 'Brochures, plans et panneaux de chantier : présentez le projet et orientez sur le terrain.',
    h1: 'Présenter le projet. Orienter sur le terrain.',
    supports: ['brochures', 'plans', 'chemises', 'panneaux', 'bâches', 'signalétique', 'documents commerciaux'],
    constraints: ['site', 'phases', 'dimensions', 'exposition', 'versions', 'calendrier'],
  },
  {
    slug: 'automobile',
    title: 'Automobile',
    metaTitle: 'Solutions d’impression pour l’automobile | Printcom',
    metaDescription: 'Catalogues, PLV et habillage de véhicules : la marque, du showroom à la route.',
    h1: 'La marque, du showroom à la route.',
    supports: ['catalogues', 'fiches', 'plv', 'affichage', 'habillage de véhicules', 'signalétique'],
    constraints: ['modèles', 'réseau', 'formats', 'versions', 'pose', 'durée'],
  },
  {
    slug: 'banque-assurance',
    title: 'Banque et assurance',
    metaTitle: 'Solutions d’impression pour la banque et l’assurance | Printcom',
    metaDescription: 'Brochures, formulaires et guides : des documents clairs pour des décisions importantes.',
    h1: 'Des documents clairs pour des décisions importantes.',
    supports: ['brochures', 'formulaires', 'chemises', 'guides', 'affichage', 'signalétique'],
    constraints: ['confidentialité', 'versions', 'validation', 'réseau', 'archivage', 'lisibilité'],
  },
  {
    slug: 'industrie',
    title: 'Industrie',
    metaTitle: 'Solutions d’impression pour l’industrie | Printcom',
    metaDescription: 'Étiquettes, manuels et signalétique : identifier, documenter et orienter sur site.',
    h1: 'Identifier, documenter, orienter.',
    supports: ['étiquettes', 'manuels', 'fiches techniques', 'signalétique', 'panneaux', 'documents de procédure'],
    constraints: ['environnement', 'résistance', 'codification', 'fréquence d’usage', 'sécurité'],
  },
  {
    slug: 'education-formation',
    title: 'Éducation et formation',
    metaTitle: 'Solutions d’impression pour l’éducation | Printcom',
    metaDescription: 'Manuels, livrets et certificats : des supports conçus pour apprendre.',
    h1: 'Des supports conçus pour apprendre.',
    supports: ['manuels', 'livrets', 'blocs', 'carnets', 'certificats', 'signalétique', 'supports d’événement'],
    constraints: ['niveau', 'pagination', 'exercices', 'durabilité', 'sessions', 'versions'],
  },
  {
    slug: 'institutions-publiques',
    title: 'Institutions publiques',
    metaTitle: 'Solutions d’impression pour les institutions publiques | Printcom',
    metaDescription: 'Rapports, guides et formulaires : rendre l’information accessible et structurée.',
    h1: 'Rendre l’information accessible et structurée.',
    supports: ['rapports', 'guides', 'brochures', 'affiches', 'formulaires', 'signalétique', 'publications'],
    constraints: ['validation', 'langues', 'accessibilité', 'diffusion', 'archivage', 'marchés applicables'],
  },
  {
    slug: 'associations-ong',
    title: 'Associations et ONG',
    metaTitle: 'Solutions d’impression pour les associations et ONG | Printcom',
    metaDescription: 'Rapports, brochures et outils de sensibilisation : donner une forme claire aux actions.',
    h1: 'Donner une forme claire aux actions.',
    supports: ['rapports', 'brochures', 'guides', 'supports d’événement', 'affiches', 'outils de sensibilisation'],
    constraints: ['publics', 'bailleurs', 'langues', 'terrain', 'distribution', 'budget'],
  },
  {
    slug: 'evenementiel',
    title: 'Événementiel',
    metaTitle: 'Solutions d’impression pour l’événementiel | Printcom',
    metaDescription: 'Invitations, badges et roll-ups : un parcours cohérent, de l’invitation au lieu.',
    h1: 'Un parcours cohérent, de l’invitation au lieu.',
    supports: ['invitations', 'badges', 'programmes', 'roll-ups', 'décors imprimés', 'signalétique', 'kits'],
    constraints: ['date', 'lieu', 'participants', 'accès', 'montage', 'réutilisation'],
  },
  {
    slug: 'agences-communication',
    title: 'Agences de communication',
    metaTitle: 'Solutions d’impression pour les agences de communication | Printcom',
    metaDescription: 'Déclinaisons, prépresse et grand format : une production alignée sur l’idée créative.',
    h1: 'Une production alignée sur l’idée créative.',
    supports: ['déclinaisons', 'prépresse', 'supports marketing', 'packaging', 'plv', 'grand format'],
    constraints: ['charte', 'fichiers', 'campagne', 'versions', 'planning', 'validations'],
  },
  {
    slug: 'e-commerce',
    title: 'E-commerce',
    metaTitle: 'Solutions d’impression pour l’e-commerce | Printcom',
    metaDescription: 'Boîtes, pochettes et inserts : l’expérience continue après le clic.',
    h1: 'L’expérience continue après le clic.',
    supports: ['boîtes', 'pochettes', 'étiquettes', 'inserts', 'cartes', 'papier d’emballage', 'supports de retour'],
    constraints: ['dimensions produits', 'logistique', 'unboxing', 'variantes', 'stockage', 'expédition'],
  },
]

export const SECTORS: SectorSeed[] = SECTOR_SOURCES.map((s) => ({
  slug: s.slug,
  title: s.title,
  shortDescription: `${s.h1} ${INTRO}`,
  challenges: s.constraints.map((label) => ({ label })),
  printingNeeds: s.supports.map((label) => ({ label })),
  constraints: `Avant le devis : ${BEFORE_QUOTE_CHECKLIST.join(' ')}`,
  seo: { metaTitle: s.metaTitle, metaDescription: s.metaDescription },
  status: 'draft',
}))
