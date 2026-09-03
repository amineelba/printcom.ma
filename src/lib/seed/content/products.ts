import { richText } from './richText'

/**
 * Real editorial content for the 79 products of the catalogue (Printcom
 * master content brief, sections 7-8). Every product is seeded in `draft`
 * (brief section 33, rule 2) — the copy itself is publication-ready, but
 * nothing here is a confirmed commercial offer until Printcom reviews and
 * publishes it. SEO title/description follow the brief's fixed formula
 * (`<Nom> personnalisé | Printcom`) rather than per-product creative
 * copywriting, matching the source document exactly.
 */
type ProductSource = {
  category: string
  title: string
  tagline: string
  sentence: string
  usages: string[]
  configure: string[]
}

const PRODUCT_SOURCES: ProductSource[] = [
  // Papeterie d’entreprise
  {
    category: 'papeterie-entreprise',
    title: 'Cartes de visite',
    tagline: 'Une petite surface. Une présence immédiate.',
    sentence:
      'Réunissez identité, coordonnées et fonction dans un format simple à transmettre et agréable à conserver.',
    usages: ['rendez-vous', 'prospection', 'événements', 'équipes commerciales'],
    configure: ['format', 'orientation', 'support', 'grammage', 'recto-verso', 'finition'],
  },
  {
    category: 'papeterie-entreprise',
    title: 'Papier à en-tête',
    tagline: 'Vos documents commencent par votre identité.',
    sentence:
      'Structurez courriers, propositions et documents officiels avec un en-tête cohérent et une zone de contenu confortable.',
    usages: ['correspondance', 'devis', 'notes', 'documents administratifs'],
    configure: ['format', 'papier', 'grammage', 'impression', 'marges', 'compatibilité imprimante'],
  },
  {
    category: 'papeterie-entreprise',
    title: 'Enveloppes',
    tagline: 'L’identité avant même l’ouverture.',
    sentence:
      'Personnalisez l’enveloppe pour identifier clairement l’expéditeur et prolonger la cohérence de vos documents.',
    usages: ['courrier', 'invitations', 'dossiers', 'envois institutionnels'],
    configure: ['format', 'fenêtre', 'fermeture', 'papier', 'impression', 'position des éléments'],
  },
  {
    category: 'papeterie-entreprise',
    title: 'Chemises à rabats',
    tagline: 'Présenter. Regrouper. Protéger.',
    sentence:
      'Organisez vos documents dans une chemise conçue pour les rendez-vous, dossiers commerciaux et remises institutionnelles.',
    usages: ['propositions', 'présentations', 'appels d’offres', 'dossiers d’accueil'],
    configure: ['format fermé', 'rabats', 'encoche carte', 'support', 'pelliculage', 'découpe'],
  },
  {
    category: 'papeterie-entreprise',
    title: 'Blocs-notes',
    tagline: 'Votre marque, page après page.',
    sentence:
      'Créez un support utile pour les réunions, formations et prises de notes, avec une mise en page qui laisse la fonction au premier plan.',
    usages: ['réunions', 'formations', 'accueil', 'usage interne'],
    configure: ['format', 'nombre de feuilles', 'papier intérieur', 'dos', 'collage', 'couverture'],
  },
  {
    category: 'papeterie-entreprise',
    title: 'Carnets personnalisés',
    tagline: 'Pensé pour durer dans le quotidien.',
    sentence: 'Associez couverture, pages intérieures et type de reliure dans un carnet cohérent avec son usage.',
    usages: ['cadeau professionnel', 'formation', 'équipe', 'événement'],
    configure: ['format', 'pagination', 'couverture', 'intérieur', 'reliure', 'élastique éventuel'],
  },
  {
    category: 'papeterie-entreprise',
    title: 'Factures et bons',
    tagline: 'Des documents clairs. Des opérations fluides.',
    sentence: 'Organisez les informations essentielles pour faciliter la saisie, la lecture, la transmission et l’archivage.',
    usages: ['facturation', 'livraison', 'commande', 'intervention', 'réception'],
    configure: ['format', 'numérotation', 'jeux', 'autocopiant', 'perforation', 'reliure'],
  },
  {
    category: 'papeterie-entreprise',
    title: 'Formulaires autocopiants',
    tagline: 'Une saisie. Plusieurs exemplaires.',
    sentence: 'Préparez des formulaires en liasses pour conserver et distribuer plusieurs copies d’une même information.',
    usages: ['bons', 'reçus', 'interventions', 'commandes', 'livraisons'],
    configure: ['nombre de feuillets', 'couleurs de copies', 'numérotation', 'perforation', 'reliure'],
  },
  {
    category: 'papeterie-entreprise',
    title: 'Calendriers',
    tagline: 'Votre marque dans le rythme de l’année.',
    sentence: 'Choisissez une structure de calendrier qui combine visibilité, utilité et espace éditorial.',
    usages: ['bureau', 'mur', 'cadeau d’entreprise', 'planification'],
    configure: ['format', 'période', 'support', 'reliure', 'chevalet', 'personnalisation'],
  },
  {
    category: 'papeterie-entreprise',
    title: 'Agendas',
    tagline: 'L’année, organisée à votre image.',
    sentence: 'Concevez un agenda utile, lisible et adapté au rythme des équipes ou des destinataires.',
    usages: ['usage interne', 'cadeau', 'relation client', 'événement annuel'],
    configure: ['format', 'couverture', 'mise en page', 'pagination', 'reliure', 'accessoires'],
  },

  // Supports marketing
  {
    category: 'supports-marketing',
    title: 'Flyers',
    tagline: 'Un message. Une action.',
    sentence: 'Concentrez une offre, un événement ou une information dans un support court, facile à distribuer et rapide à lire.',
    usages: ['lancement', 'promotion', 'événement', 'information locale'],
    configure: ['format', 'recto-verso', 'papier', 'grammage', 'quantité', 'finition'],
  },
  {
    category: 'supports-marketing',
    title: 'Dépliants',
    tagline: 'Plus d’espace. Toujours aussi direct.',
    sentence: 'Organisez plusieurs niveaux d’information dans un document compact qui se déploie dans un ordre maîtrisé.',
    usages: ['présentation', 'menu', 'programme', 'offre', 'guide court'],
    configure: ['format ouvert', 'format fermé', 'nombre de volets', 'type de pli', 'papier'],
  },
  {
    category: 'supports-marketing',
    title: 'Plaquettes commerciales',
    tagline: 'Présentez l’essentiel. Avec structure.',
    sentence: 'Réunissez positionnement, offre, preuves et contact dans un document destiné aux rendez-vous et à la prospection.',
    usages: ['vente B2B', 'institutionnel', 'partenariat', 'présentation d’entreprise'],
    configure: ['format', 'pagination', 'papier', 'reliure', 'couverture', 'finition'],
  },
  {
    category: 'supports-marketing',
    title: 'Brochures',
    tagline: 'Une histoire qui tient en main.',
    sentence: 'Développez un sujet, une offre ou une organisation dans une publication séquencée et confortable à parcourir.',
    usages: ['corporate', 'produit', 'programme', 'tourisme', 'formation'],
    configure: ['format', 'nombre de pages', 'couverture', 'intérieur', 'reliure', 'finition'],
  },
  {
    category: 'supports-marketing',
    title: 'Catalogues',
    tagline: 'Votre gamme. Une lecture cohérente.',
    sentence: 'Classez produits, références et informations dans un catalogue pensé pour aider à parcourir, comparer et choisir.',
    usages: ['vente', 'distribution', 'collection', 'saison', 'présentation technique'],
    configure: ['format', 'pagination', 'structure', 'couverture', 'index', 'reliure'],
  },
  {
    category: 'supports-marketing',
    title: 'Fiches produits',
    tagline: 'La bonne information. Au bon moment.',
    sentence: 'Présentez les caractéristiques, bénéfices et usages d’un produit dans un format autonome et facile à mettre à jour.',
    usages: ['vente', 'salon', 'dossier technique', 'accompagnement commercial'],
    configure: ['format', 'recto-verso', 'papier', 'perforation', 'classement', 'versions'],
  },
  {
    category: 'supports-marketing',
    title: 'Prospectus',
    tagline: 'Faites circuler une offre clairement.',
    sentence: 'Réunissez plusieurs produits, messages ou promotions dans un support conçu pour une diffusion large et une lecture rapide.',
    usages: ['retail', 'opération commerciale', 'lancement', 'distribution'],
    configure: ['format', 'pliage', 'pagination', 'papier', 'quantité', 'zonage'],
  },
  {
    category: 'supports-marketing',
    title: 'Coupons',
    tagline: 'Une action simple à détacher.',
    sentence: 'Créez un support mesurable pour une remise, une inscription, une réponse ou une activation.',
    usages: ['promotion', 'événement', 'collecte', 'fidélisation'],
    configure: ['format', 'numérotation', 'perforation', 'code', 'conditions', 'support'],
  },
  {
    category: 'supports-marketing',
    title: 'Cartes promotionnelles',
    tagline: 'Un format compact pour une idée forte.',
    sentence: 'Utilisez une carte pour porter une invitation, un avantage, un code ou un message à conserver.',
    usages: ['invitation', 'fidélité', 'lancement', 'code promotionnel'],
    configure: ['format', 'support', 'recto-verso', 'coins', 'finition', 'personnalisation'],
  },
  {
    category: 'supports-marketing',
    title: 'Mailings imprimés',
    tagline: 'Parlez directement à chaque destinataire.',
    sentence: 'Combinez lettre, enveloppe et éléments personnalisés dans un envoi structuré pour une audience identifiée.',
    usages: ['prospection', 'fidélisation', 'invitation', 'information client'],
    configure: ['composition', 'personnalisation', 'enveloppe', 'adressage', 'assemblage'],
  },

  // Édition et documents
  {
    category: 'edition-documents',
    title: 'Livres',
    tagline: 'Le contenu d’abord. L’objet ensuite.',
    sentence: 'Donnez à un texte long un rythme de lecture, une couverture et une reliure cohérents avec sa diffusion.',
    usages: ['édition', 'institutionnel', 'patrimoine', 'formation', 'publication interne'],
    configure: ['format', 'pagination', 'papier', 'couverture', 'reliure', 'tirage'],
  },
  {
    category: 'edition-documents',
    title: 'Magazines',
    tagline: 'Un rythme éditorial qui se feuillette.',
    sentence: 'Alternez articles, images et rubriques dans une publication pensée pour une lecture régulière ou thématique.',
    usages: ['marque', 'institution', 'association', 'secteur', 'culture'],
    configure: ['format', 'périodicité', 'pagination', 'papier', 'couverture', 'reliure'],
  },
  {
    category: 'edition-documents',
    title: 'Rapports annuels',
    tagline: 'Une année. Une lecture claire.',
    sentence: 'Structurez résultats, actions et perspectives dans un document qui facilite la compréhension et la consultation.',
    usages: ['entreprise', 'institution', 'association', 'programme'],
    configure: ['format', 'pagination', 'graphiques', 'papier', 'reliure', 'version linguistique'],
  },
  {
    category: 'edition-documents',
    title: 'Rapports institutionnels',
    tagline: 'Donnez de la forme aux informations importantes.',
    sentence: 'Organisez analyses, données et recommandations avec une hiérarchie éditoriale stable.',
    usages: ['étude', 'audit', 'stratégie', 'bilan', 'politique publique'],
    configure: ['format', 'volume', 'tableaux', 'annexes', 'couverture', 'reliure'],
  },
  {
    category: 'edition-documents',
    title: 'Manuels',
    tagline: 'Une information faite pour servir.',
    sentence: 'Créez un document de référence robuste, facile à parcourir et adapté aux consultations répétées.',
    usages: ['procédure', 'produit', 'maintenance', 'formation', 'qualité'],
    configure: ['format', 'pagination', 'index', 'onglets', 'reliure', 'résistance'],
  },
  {
    category: 'edition-documents',
    title: 'Guides',
    tagline: 'Expliquez une démarche. Étape par étape.',
    sentence: 'Transformez une expertise ou un parcours en contenu pratique, avec repères, exemples et actions.',
    usages: ['orientation', 'accueil', 'usage', 'procédure', 'destination'],
    configure: ['format', 'chapitres', 'pictogrammes', 'papier', 'reliure', 'poche éventuelle'],
  },
  {
    category: 'edition-documents',
    title: 'Livrets',
    tagline: 'Compact. Complet. Facile à transmettre.',
    sentence: 'Réunissez un programme, une notice ou une présentation dans une publication courte et ordonnée.',
    usages: ['événement', 'produit', 'cérémonie', 'information', 'accueil'],
    configure: ['format', 'pagination', 'papier', 'agrafage', 'couverture'],
  },
  {
    category: 'edition-documents',
    title: 'Journaux',
    tagline: 'L’information dans un format collectif.',
    sentence: 'Composez actualités, annonces et rubriques dans un support adapté à une lecture rapide et partagée.',
    usages: ['interne', 'local', 'associatif', 'événementiel', 'institutionnel'],
    configure: ['format', 'pagination', 'papier', 'pliage', 'périodicité'],
  },
  {
    category: 'edition-documents',
    title: 'Thèses et mémoires',
    tagline: 'Un travail long, présenté avec rigueur.',
    sentence: 'Préparez la couverture, les pages intérieures et la reliure d’un document académique ou de recherche.',
    usages: ['université', 'recherche', 'soutenance', 'archivage'],
    configure: ['format', 'pagination', 'couleur', 'papier', 'couverture', 'reliure'],
  },
  {
    category: 'edition-documents',
    title: 'Documents de formation',
    tagline: 'Des supports qui accompagnent l’apprentissage.',
    sentence: 'Organisez objectifs, séquences, exercices et notes dans un document conçu pour être utilisé pendant et après la formation.',
    usages: ['atelier', 'cours', 'onboarding', 'séminaire', 'certification'],
    configure: ['format', 'pagination', 'zones de notes', 'reliure', 'intercalaires'],
  },

  // Packaging
  {
    category: 'packaging',
    title: 'Boîtes pliantes',
    tagline: 'Une structure légère. Une présence nette.',
    sentence: 'Concevez une boîte en carton pliant qui combine protection, surface graphique et montage adapté au produit.',
    usages: ['retail', 'cosmétique', 'alimentaire sec', 'accessoires', 'édition'],
    configure: ['dimensions', 'carton', 'découpe', 'collage', 'impression', 'finition'],
  },
  {
    category: 'packaging',
    title: 'Étuis produits',
    tagline: 'Le produit, présenté dès le premier regard.',
    sentence: 'Entourez un article d’un étui qui porte son identité, ses informations et son mode d’utilisation.',
    usages: ['cosmétique', 'pharmacie', 'alimentaire', 'accessoire', 'cadeau'],
    configure: ['dimensions', 'carton', 'fermeture', 'fenêtre', 'impression', 'finition'],
  },
  {
    category: 'packaging',
    title: 'Boîtes alimentaires',
    tagline: 'Protéger. Informer. Servir.',
    sentence:
      'Préparez une boîte adaptée au format du produit et aux contraintes de présentation. Toute exigence de contact alimentaire doit être validée séparément.',
    usages: ['vente', 'transport', 'présentation', 'restauration', 'produit sec'],
    configure: ['dimensions', 'matière', 'barrière', 'montage', 'impression', 'conformité à confirmer'],
  },
  {
    category: 'packaging',
    title: 'Boîtes cosmétiques',
    tagline: 'La précision jusqu’à l’ouverture.',
    sentence: 'Associez structure, matière et finition pour présenter un produit cosmétique sans perdre la clarté des informations.',
    usages: ['soin', 'parfum', 'maquillage', 'coffret', 'lancement'],
    configure: ['dimensions', 'carton', 'calage', 'fenêtre', 'finition', 'mentions'],
  },
  {
    category: 'packaging',
    title: 'Boîtes pharmaceutiques',
    tagline: 'L’information reste prioritaire.',
    sentence:
      'Organisez la structure et les zones d’information d’un étui destiné à un produit de santé. Les exigences réglementaires doivent être fournies et validées.',
    usages: ['médicament', 'dispositif', 'complément', 'soin', 'laboratoire'],
    configure: ['dimensions', 'carton', 'braille éventuel', 'notice', 'codification', 'conformité'],
  },
  {
    category: 'packaging',
    title: 'Fourreaux',
    tagline: 'Habillez sans enfermer.',
    sentence: 'Ajoutez une bande imprimée autour d’un produit, d’une boîte ou d’un ensemble pour compléter l’information et créer une variation.',
    usages: ['édition limitée', 'coffret', 'alimentaire', 'cosmétique', 'promotion'],
    configure: ['dimensions', 'recouvrement', 'carton', 'découpe', 'collage', 'finition'],
  },
  {
    category: 'packaging',
    title: 'Pochettes',
    tagline: 'Réunir, protéger, remettre.',
    sentence: 'Créez une pochette pour présenter des documents, échantillons ou éléments de marque dans un ensemble cohérent.',
    usages: ['dossier', 'échantillons', 'bienvenue', 'événement', 'vente'],
    configure: ['format', 'soufflet', 'fermeture', 'support', 'découpe', 'finition'],
  },
  {
    category: 'packaging',
    title: 'Sacs en papier',
    tagline: 'Votre marque accompagne le produit.',
    sentence: 'Choisissez un sac en fonction du poids, du volume et de l’expérience de remise souhaitée.',
    usages: ['boutique', 'événement', 'cadeau', 'restauration', 'retail'],
    configure: ['dimensions', 'papier', 'poignées', 'fond', 'renfort', 'impression'],
  },
  {
    category: 'packaging',
    title: 'Papier d’emballage',
    tagline: 'Une surface simple. Un geste de marque.',
    sentence: 'Personnalisez le papier qui enveloppe, sépare ou protège pour prolonger l’identité jusque dans le détail.',
    usages: ['boutique', 'cadeau', 'alimentaire sous conditions', 'e-commerce'],
    configure: ['format', 'papier', 'répétition du motif', 'couleur', 'quantité'],
  },
  {
    category: 'packaging',
    title: 'Packaging sur mesure',
    tagline: 'Quand le produit définit la forme.',
    sentence: 'Développez une structure spécifique à partir des dimensions, du poids, du parcours logistique et de l’expérience d’ouverture.',
    usages: ['lancement', 'coffret', 'gamme', 'produit atypique', 'présentation'],
    configure: ['brief', 'dimensions', 'prototype', 'matière', 'découpe', 'assemblage'],
  },

  // Étiquettes et stickers
  {
    category: 'etiquettes-stickers',
    title: 'Étiquettes produits',
    tagline: 'Nommer. Informer. Distinguer.',
    sentence: 'Réunissez identité, informations et repères de gamme dans une étiquette adaptée au contenant.',
    usages: ['retail', 'industrie', 'artisanat', 'cosmétique', 'alimentaire'],
    configure: ['forme', 'dimensions', 'support', 'adhésif', 'finition', 'pose'],
  },
  {
    category: 'etiquettes-stickers',
    title: 'Étiquettes alimentaires',
    tagline: 'Lisibles du rayon à l’usage.',
    sentence:
      'Organisez marque, dénomination et informations fournies par le responsable du produit. La conformité réglementaire reste sous validation du donneur d’ordre.',
    usages: ['produit emballé', 'bocal', 'bouteille', 'sachet', 'barquette'],
    configure: ['support', 'adhésif', 'humidité', 'froid', 'informations', 'conformité'],
  },
  {
    category: 'etiquettes-stickers',
    title: 'Étiquettes cosmétiques',
    tagline: 'Une petite surface. Beaucoup de précision.',
    sentence: 'Concevez une étiquette lisible pour des contenants souvent compacts, courbes ou exposés à l’humidité.',
    usages: ['flacon', 'pot', 'tube', 'coffret', 'échantillon'],
    configure: ['dimensions', 'courbure', 'support', 'adhésif', 'résistance', 'finition'],
  },
  {
    category: 'etiquettes-stickers',
    title: 'Étiquettes pharmaceutiques',
    tagline: 'La lisibilité ne se négocie pas.',
    sentence: 'Structurez les informations fournies pour une lecture claire et une application maîtrisée. Toute exigence réglementaire doit être confirmée.',
    usages: ['flacon', 'boîte', 'dispositif', 'laboratoire', 'traçabilité'],
    configure: ['support', 'adhésif', 'codification', 'variables', 'sécurité', 'conformité'],
  },
  {
    category: 'etiquettes-stickers',
    title: 'Étiquettes en rouleau',
    tagline: 'Prêtes pour une pose régulière.',
    sentence: 'Conditionnez les étiquettes en bobine selon le sens de sortie, le mandrin et le mode d’application.',
    usages: ['conditionnement', 'ligne', 'pose manuelle', 'pose automatique'],
    configure: ['laize', 'mandrin', 'sens d’enroulement', 'forme', 'espacement', 'quantité'],
  },
  {
    category: 'etiquettes-stickers',
    title: 'Étiquettes en planche',
    tagline: 'Souples pour les petites séries.',
    sentence: 'Regroupez plusieurs étiquettes sur une planche pratique à stocker, manipuler et poser à la main.',
    usages: ['bureau', 'événement', 'artisanat', 'petites séries', 'organisation'],
    configure: ['format de planche', 'forme', 'quantité par planche', 'support', 'découpe'],
  },
  {
    category: 'etiquettes-stickers',
    title: 'Stickers personnalisés',
    tagline: 'Une forme libre pour faire circuler la marque.',
    sentence: 'Créez des autocollants pour identifier, décorer, fermer ou accompagner un message.',
    usages: ['packaging', 'événement', 'communauté', 'scellé', 'décoration'],
    configure: ['forme', 'dimensions', 'support', 'adhésif', 'découpe', 'finition'],
  },
  {
    category: 'etiquettes-stickers',
    title: 'Stickers vitrine',
    tagline: 'Le message rencontre l’espace.',
    sentence: 'Utilisez l’adhésif pour informer, habiller ou orienter sur une surface vitrée.',
    usages: ['boutique', 'bureau', 'événement', 'promotion', 'signalétique'],
    configure: ['dimensions', 'pose intérieure/extérieure', 'transparence', 'découpe', 'durée'],
  },
  {
    category: 'etiquettes-stickers',
    title: 'Étiquettes transparentes',
    tagline: 'L’information sans masquer le contenant.',
    sentence: 'Imprimez sur un support transparent pour conserver la visibilité de la matière, de la couleur ou du produit.',
    usages: ['verre', 'plastique', 'cosmétique', 'boisson', 'objet'],
    configure: ['blanc de soutien éventuel', 'transparence', 'adhésif', 'forme', 'finition'],
  },
  {
    category: 'etiquettes-stickers',
    title: 'Étiquettes de sécurité',
    tagline: 'Rendre l’ouverture visible.',
    sentence:
      'Préparez une solution d’étiquetage destinée à signaler une ouverture, une altération ou un contrôle. Le niveau de sécurité doit être défini selon le besoin réel.',
    usages: ['scellé', 'garantie', 'contrôle', 'logistique', 'équipement'],
    configure: ['matière', 'adhésif', 'destructibilité', 'message', 'numérotation', 'traçabilité'],
  },

  // PLV et supports de vente
  {
    category: 'plv-supports-vente',
    title: 'Présentoirs de comptoir',
    tagline: 'Le produit à portée de regard.',
    sentence: 'Présentez une sélection ou un message sur une surface compacte, proche de la décision.',
    usages: ['comptoir', 'caisse', 'accueil', 'démonstration', 'lancement'],
    configure: ['dimensions', 'capacité', 'carton ou rigide', 'montage', 'visuel'],
  },
  {
    category: 'plv-supports-vente',
    title: 'Présentoirs de sol',
    tagline: 'Créer un point de présence autonome.',
    sentence: 'Structurez une présentation visible dans l’espace, avec une capacité et une stabilité adaptées.',
    usages: ['rayon', 'entrée', 'salon', 'promotion', 'lancement'],
    configure: ['dimensions', 'charge', 'matière', 'étagères', 'transport', 'montage'],
  },
  {
    category: 'plv-supports-vente',
    title: 'Stop-rayons',
    tagline: 'Interrompre le regard. Juste assez.',
    sentence: 'Ajoutez un signal perpendiculaire au linéaire pour attirer l’attention sur une offre ou une information.',
    usages: ['retail', 'promotion', 'nouveauté', 'repérage', 'catégorie'],
    configure: ['format', 'fixation', 'matière', 'recto-verso', 'résistance'],
  },
  {
    category: 'plv-supports-vente',
    title: 'Frontons',
    tagline: 'Donner un titre à l’espace.',
    sentence: 'Identifiez une marque, une gamme ou une opération au-dessus d’un meuble ou d’un linéaire.',
    usages: ['rayon', 'meuble', 'stand', 'tête de gondole', 'événement'],
    configure: ['dimensions', 'fixation', 'support', 'visibilité', 'éclairage éventuel'],
  },
  {
    category: 'plv-supports-vente',
    title: 'Totems',
    tagline: 'Une présence verticale. Un message direct.',
    sentence: 'Utilisez un support autoportant pour informer ou orienter dans un espace de passage.',
    usages: ['accueil', 'événement', 'retail', 'exposition', 'institution'],
    configure: ['hauteur', 'base', 'matière', 'recto-verso', 'démontage'],
  },
  {
    category: 'plv-supports-vente',
    title: 'Chevalets',
    tagline: 'Informer au plus près.',
    sentence: 'Placez un message sur table, comptoir ou sol dans une structure simple à déplacer.',
    usages: ['menu', 'offre', 'information', 'orientation', 'événement'],
    configure: ['format', 'inclinaison', 'support', 'pli', 'usage'],
  },
  {
    category: 'plv-supports-vente',
    title: 'Kakémonos',
    tagline: 'Un visuel vertical qui accompagne l’espace.',
    sentence: 'Suspendez ou installez une communication verticale adaptée à un stand, un hall ou un événement.',
    usages: ['salon', 'vitrine', 'accueil', 'exposition', 'promotion'],
    configure: ['dimensions', 'matière', 'système d’accroche', 'finition', 'transport'],
  },
  {
    category: 'plv-supports-vente',
    title: 'Roll-ups',
    tagline: 'Déployer. Présenter. Ranger.',
    sentence: 'Réunissez visuel vertical et structure rétractable pour les déplacements et présentations temporaires.',
    usages: ['salon', 'conférence', 'accueil', 'formation', 'promotion'],
    configure: ['largeur', 'hauteur', 'matière', 'structure', 'sac', 'remplacement du visuel'],
  },
  {
    category: 'plv-supports-vente',
    title: 'Displays',
    tagline: 'Donnez une scène au produit.',
    sentence: 'Créez un élément imprimé qui organise la présentation et donne un contexte clair à l’offre.',
    usages: ['comptoir', 'rayon', 'vitrine', 'lancement', 'collection'],
    configure: ['dimensions', 'nombre de produits', 'matière', 'montage', 'transport'],
  },
  {
    category: 'plv-supports-vente',
    title: 'Habillage de linéaires',
    tagline: 'Faire parler l’ensemble du rayon.',
    sentence: 'Coordonnez bandeaux, joues, frontons et messages pour créer une lecture continue autour des produits.',
    usages: ['retail', 'gamme', 'campagne', 'saison', 'activation'],
    configure: ['mesures', 'supports', 'fixation', 'plan de pose', 'déclinaisons'],
  },

  // Affichage et grand format
  {
    category: 'affichage-grand-format',
    title: 'Affiches',
    tagline: 'Une idée visible en quelques secondes.',
    sentence: 'Composez un message capable d’être compris à la distance et dans le temps de lecture disponibles.',
    usages: ['campagne', 'événement', 'vitrine', 'information', 'culture'],
    configure: ['format', 'papier', 'intérieur/extérieur', 'durée', 'fixation'],
  },
  {
    category: 'affichage-grand-format',
    title: 'Posters',
    tagline: 'L’image prend toute sa place.',
    sentence: 'Imprimez un visuel destiné à être regardé de près, exposé ou intégré dans un environnement intérieur.',
    usages: ['décoration', 'exposition', 'communication', 'photographie', 'édition'],
    configure: ['dimensions', 'papier', 'rendu', 'marge', 'encadrement'],
  },
  {
    category: 'affichage-grand-format',
    title: 'Bâches',
    tagline: 'Une surface souple pour les grands espaces.',
    sentence: 'Déployez une communication grand format sur une matière adaptée à l’installation et aux conditions du site.',
    usages: ['façade', 'chantier', 'événement', 'barrière', 'scène'],
    configure: ['dimensions', 'matière', 'œillets', 'ourlets', 'tension', 'environnement'],
  },
  {
    category: 'affichage-grand-format',
    title: 'Banderoles',
    tagline: 'Un message horizontal qui traverse l’espace.',
    sentence: 'Créez une communication visible pour une façade, une rue, une scène ou un événement.',
    usages: ['annonce', 'événement', 'sport', 'promotion', 'orientation'],
    configure: ['dimensions', 'matière', 'fixation', 'vent', 'distance de lecture'],
  },
  {
    category: 'affichage-grand-format',
    title: 'Panneaux publicitaires',
    tagline: 'Une présence stable. Une lecture immédiate.',
    sentence: 'Préparez un visuel pour un support rigide ou une structure existante, avec une hiérarchie adaptée à la distance.',
    usages: ['extérieur', 'immobilier', 'chantier', 'retail', 'direction'],
    configure: ['dimensions', 'matière', 'fixation', 'durée', 'exposition'],
  },
  {
    category: 'affichage-grand-format',
    title: 'Vinyles adhésifs',
    tagline: 'Transformer une surface sans la reconstruire.',
    sentence: 'Utilisez un film adhésif pour habiller, identifier ou informer sur une surface compatible.',
    usages: ['mur', 'meuble', 'vitre', 'sol', 'équipement'],
    configure: ['surface', 'adhésif', 'finition', 'pose', 'retrait', 'durée'],
  },
  {
    category: 'affichage-grand-format',
    title: 'Habillage de vitrines',
    tagline: 'Faire de la vitre un média.',
    sentence: 'Composez une vitrine qui attire, informe ou préserve l’intimité sans perdre la relation avec l’espace.',
    usages: ['boutique', 'bureau', 'promotion', 'décoration', 'confidentialité'],
    configure: ['mesures', 'visibilité', 'microperforé', 'dépoli', 'transparent', 'pose'],
  },
  {
    category: 'affichage-grand-format',
    title: 'Habillage mural',
    tagline: 'L’identité à l’échelle du lieu.',
    sentence: 'Déployez un visuel sur un mur pour créer une ambiance, transmettre une information ou identifier un espace.',
    usages: ['bureau', 'retail', 'événement', 'exposition', 'accueil'],
    configure: ['dimensions', 'état du mur', 'matière', 'raccords', 'pose', 'durée'],
  },
  {
    category: 'affichage-grand-format',
    title: 'Habillage de véhicules',
    tagline: 'La marque en mouvement.',
    sentence: 'Adaptez le visuel aux volumes, ouvertures et lignes du véhicule pour conserver sa lisibilité.',
    usages: ['flotte', 'utilitaire', 'véhicule commercial', 'événement'],
    configure: ['modèle du véhicule', 'couverture', 'vinyle', 'découpe', 'pose', 'retrait'],
  },
  {
    category: 'affichage-grand-format',
    title: 'Impression événementielle',
    tagline: 'Un espace cohérent, du premier regard au détail.',
    sentence: 'Coordonnez plusieurs supports imprimés autour d’un événement, d’un stand ou d’une rencontre.',
    usages: ['salon', 'conférence', 'lancement', 'exposition', 'cérémonie'],
    configure: ['plan du site', 'formats', 'supports', 'montage', 'délais', 'réutilisation'],
  },

  // Signalétique
  {
    category: 'signaletique',
    title: 'Enseignes',
    tagline: 'Votre nom dans l’espace.',
    sentence: 'Identifiez un site, une façade ou un point d’accueil avec une solution dimensionnée selon le lieu.',
    usages: ['commerce', 'bureau', 'atelier', 'institution', 'site'],
    configure: ['dimensions', 'matière', 'éclairage éventuel', 'fixation', 'autorisation'],
  },
  {
    category: 'signaletique',
    title: 'Plaques professionnelles',
    tagline: 'Une identification claire dès l’entrée.',
    sentence: 'Présentez nom, activité et informations utiles dans un format adapté à la façade, la porte ou l’accueil.',
    usages: ['cabinet', 'bureau', 'immeuble', 'administration', 'atelier'],
    configure: ['dimensions', 'matière', 'fixation', 'gravure ou impression', 'extérieur'],
  },
  {
    category: 'signaletique',
    title: 'Signalétique intérieure',
    tagline: 'Orienter sans interrompre.',
    sentence: 'Organisez les repères, noms d’espaces et informations dans un système cohérent à l’intérieur d’un bâtiment.',
    usages: ['bureaux', 'hôtel', 'clinique', 'école', 'commerce'],
    configure: ['parcours', 'nomenclature', 'supports', 'fixation', 'accessibilité'],
  },
  {
    category: 'signaletique',
    title: 'Signalétique extérieure',
    tagline: 'Rester lisible dans les conditions réelles.',
    sentence: 'Préparez des repères conçus pour la distance, la lumière, les intempéries et la durée attendue.',
    usages: ['site', 'parking', 'campus', 'chantier', 'entrée'],
    configure: ['dimensions', 'matière', 'protection', 'fixation', 'exposition'],
  },
  {
    category: 'signaletique',
    title: 'Signalétique directionnelle',
    tagline: 'Chaque décision devient plus simple.',
    sentence: 'Indiquez clairement les destinations et les changements de direction tout au long du parcours.',
    usages: ['bâtiment', 'événement', 'site industriel', 'campus', 'retail'],
    configure: ['plan', 'destinations', 'flèches', 'hiérarchie', 'implantation'],
  },
  {
    category: 'signaletique',
    title: 'Signalétique de sécurité',
    tagline: 'Informer avec des codes compréhensibles.',
    sentence:
      'Produisez les messages, pictogrammes et repères fournis selon les normes applicables au site. La conformité doit être validée par le responsable concerné.',
    usages: ['évacuation', 'interdiction', 'obligation', 'danger', 'équipement'],
    configure: ['norme fournie', 'dimensions', 'matière', 'photoluminescence', 'pose'],
  },
  {
    category: 'signaletique',
    title: 'Panneaux de chantier',
    tagline: 'Identifier, informer, encadrer.',
    sentence: 'Présentez les informations du projet ou les consignes sur un support adapté à la durée et au site.',
    usages: ['construction', 'immobilier', 'travaux', 'accès', 'sécurité'],
    configure: ['dimensions', 'matière', 'structure', 'fixation', 'exposition'],
  },
  {
    category: 'signaletique',
    title: 'Marquage au sol',
    tagline: 'Le parcours sous les pieds.',
    sentence: 'Utilisez le sol pour orienter, délimiter ou signaler dans des zones de circulation.',
    usages: ['entrepôt', 'commerce', 'événement', 'bureau', 'file d’attente'],
    configure: ['surface', 'adhésif', 'résistance', 'antidérapant', 'durée', 'retrait'],
  },
  {
    category: 'signaletique',
    title: 'Signalétique sur mesure',
    tagline: 'Quand le lieu demande son propre système.',
    sentence: 'Développez un ensemble de repères à partir du parcours, de l’architecture et des besoins d’information.',
    usages: ['site complexe', 'réseau', 'institution', 'retail', 'événement'],
    configure: ['audit du parcours', 'nomenclature', 'prototype', 'matériaux', 'plan de pose'],
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

export const FILE_PREP_INSTRUCTIONS = richText([
  {
    p: 'Vérifiez les dimensions finales, les marges, les fonds perdus, la résolution des images et le mode colorimétrique. Lorsqu’un gabarit est nécessaire, utilisez uniquement la version fournie ou validée pour la configuration retenue.',
  },
])

export type ProductSeed = {
  slug: string
  title: string
  category: string
  shortDescription: string
  longDescription: ReturnType<typeof richText>
  filePreparationInstructions: ReturnType<typeof richText>
  seo: { metaTitle: string; metaDescription: string }
  status: 'draft'
  quoteOnly: true
  indicativePriceEnabled: false
}

export const PRODUCTS: ProductSeed[] = PRODUCT_SOURCES.map((source) => {
  const lowerTitle = source.title.charAt(0).toLowerCase() + source.title.slice(1)
  return {
    slug: slugify(source.title),
    title: source.title,
    category: source.category,
    shortDescription: `${source.tagline} ${source.sentence}`,
    longDescription: richText([
      { p: source.sentence },
      { ul: [`Usages fréquents : ${source.usages.join(', ')}.`, `À configurer : ${source.configure.join(', ')}.`] },
    ]),
    filePreparationInstructions: FILE_PREP_INSTRUCTIONS,
    seo: {
      metaTitle: `${source.title} personnalisé | Printcom`,
      metaDescription: `Découvrez ${lowerTitle} pour vos besoins professionnels. Comparez les formats, supports, finitions et quantités avant de demander un devis.`,
    },
    status: 'draft',
    quoteOnly: true,
    indicativePriceEnabled: false,
  }
})
