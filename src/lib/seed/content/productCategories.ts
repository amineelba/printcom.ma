/**
 * Real editorial content for the 8 top-level product category families,
 * sourced from the Printcom master content brief (section 7). Slugs match
 * the brief's specified routes exactly — they are not auto-generated from
 * the title, since several titles contain filler words ("d'", "et", "de")
 * that the intended URLs drop.
 */
export type ProductCategorySeed = {
  slug: string
  title: string
  shortDescription: string
  order: number
  seo: { metaTitle: string; metaDescription: string }
}

export const PRODUCT_CATEGORIES: ProductCategorySeed[] = [
  {
    slug: 'papeterie-entreprise',
    title: 'Papeterie d’entreprise',
    shortDescription:
      'Votre identité. Dans chaque échange. La papeterie d’entreprise donne une forme concrète à votre marque. Elle accompagne les rendez-vous, les courriers, les dossiers et les opérations quotidiennes, avec des formats pensés pour rester cohérents. Commencez par l’usage. Choisissez ensuite le format, le support et la finition capables de porter votre identité sans compliquer la lecture.',
    order: 1,
    seo: {
      metaTitle: 'Papeterie d’entreprise personnalisée | Printcom',
      metaDescription:
        'Cartes, en-têtes, enveloppes, chemises et documents courants : structurez une papeterie professionnelle cohérente avec votre identité.',
    },
  },
  {
    slug: 'supports-marketing',
    title: 'Supports marketing',
    shortDescription:
      'Votre message. Dans le bon format. Un support marketing doit permettre de comprendre rapidement ce que vous proposez, à qui cela s’adresse et quelle action suivre. Le format organise cette lecture. Définissez le niveau de détail, la durée de vie et le mode de distribution. Ces trois choix orientent le produit, le papier et la finition.',
    order: 2,
    seo: {
      metaTitle: 'Supports marketing imprimés | Printcom',
      metaDescription:
        'Flyers, dépliants, brochures, catalogues et fiches produits : choisissez le format qui présente votre offre avec clarté.',
    },
  },
  {
    slug: 'edition-documents',
    title: 'Édition et documents',
    shortDescription:
      'Des contenus faits pour être lus. L’édition transforme une suite de pages en expérience de lecture. Format, papier, pagination, couverture et reliure doivent servir le contenu avant de chercher l’effet. Commencez par le lecteur, la fréquence d’usage et la durée de conservation. La fabrication peut ensuite suivre la fonction réelle du document.',
    order: 3,
    seo: {
      metaTitle: 'Impression de livres et documents | Printcom',
      metaDescription:
        'Livres, magazines, rapports, manuels et guides : donnez aux contenus longs une structure lisible, durable et adaptée à leur usage.',
    },
  },
  {
    slug: 'packaging',
    title: 'Packaging',
    shortDescription:
      'Le produit commence par son emballage. Un packaging doit tenir, protéger, informer et donner envie d’être pris en main. Sa forme dépend du produit, de son parcours et du contexte dans lequel il sera vu. Dimensions, poids, matière, montage, transport et informations obligatoires doivent être validés avant le design final.',
    order: 4,
    seo: {
      metaTitle: 'Packaging et boîtes personnalisés | Printcom',
      metaDescription:
        'Boîtes, étuis, fourreaux, pochettes et sacs : structurez un packaging qui protège, informe et présente votre produit.',
    },
  },
  {
    slug: 'etiquettes-stickers',
    title: 'Étiquettes et stickers',
    shortDescription:
      'L’information, exactement là où elle compte. Une étiquette peut identifier, expliquer, fermer, tracer ou décorer. Son support, son adhésif et sa finition doivent correspondre à la surface et aux conditions d’usage. Précisez la matière du contenant, la forme, la taille, l’environnement, le mode de pose et les informations variables.',
    order: 5,
    seo: {
      metaTitle: 'Étiquettes et stickers personnalisés | Printcom',
      metaDescription:
        'Étiquettes produits, rouleaux, planches, stickers et solutions transparentes : identifiez, informez et personnalisez chaque surface.',
    },
  },
  {
    slug: 'plv-supports-vente',
    title: 'PLV et supports de vente',
    shortDescription:
      'Attirer l’attention. Sans perdre le message. La PLV intervient au moment où l’on regarde, compare ou choisit. Sa taille, sa position et sa durée d’usage déterminent la structure la plus adaptée. Précisez le lieu, la distance de lecture, le produit présenté, la durée et les contraintes d’installation.',
    order: 6,
    seo: {
      metaTitle: 'PLV et supports de vente personnalisés | Printcom',
      metaDescription:
        'Présentoirs, stop-rayons, totems, roll-ups et habillages : rendez l’offre plus visible dans le point de vente ou l’espace d’accueil.',
    },
  },
  {
    slug: 'affichage-grand-format',
    title: 'Affichage et grand format',
    shortDescription:
      'Plus grand. Toujours lisible. Le grand format ne consiste pas à agrandir un petit visuel. Il faut penser distance, mouvement, lumière, support, pose et durée d’exposition. Fournissez les dimensions finales, le lieu, la distance de lecture et les conditions d’usage avant la préparation du fichier.',
    order: 7,
    seo: {
      metaTitle: 'Impression grand format et affichage | Printcom',
      metaDescription:
        'Affiches, bâches, vinyles, vitrines et habillages : préparez une communication visible à distance et adaptée à son environnement.',
    },
  },
  {
    slug: 'signaletique',
    title: 'Signalétique',
    shortDescription:
      'Savoir où l’on est. Et où aller. La signalétique simplifie un espace. Elle identifie, dirige, informe ou avertit avec un message lisible au bon endroit et au bon moment. Analysez le parcours, la distance de lecture, l’environnement, le support de pose et les obligations applicables.',
    order: 8,
    seo: {
      metaTitle: 'Signalétique intérieure et extérieure | Printcom',
      metaDescription:
        'Enseignes, plaques, panneaux et marquages : identifiez les lieux, orientez les visiteurs et rendez l’information immédiatement lisible.',
    },
  },
]

/** Category-level quote CTA label, shown on each `/produits/<categorie>` archive page. */
export const CATEGORY_CTA_LABEL: Record<string, string> = {
  'papeterie-entreprise': 'Préparer une demande papeterie d’entreprise',
  'supports-marketing': 'Préparer une demande supports marketing',
  'edition-documents': 'Préparer une demande édition et documents',
  packaging: 'Préparer une demande packaging',
  'etiquettes-stickers': 'Préparer une demande étiquettes et stickers',
  'plv-supports-vente': 'Préparer une demande plv et supports de vente',
  'affichage-grand-format': 'Préparer une demande affichage et grand format',
  signaletique: 'Préparer une demande signalétique',
}
