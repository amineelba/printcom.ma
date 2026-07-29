/**
 * Real editorial content for supports/materials (brief section 13), grouped
 * by family. The `materials` collection has no dedicated fields for
 * "usages"/"points to confirm" lists, so they're folded into
 * `shortDescription` as labelled plain text.
 */
export type MaterialSeed = {
  slug: string
  title: string
  group: 'papier' | 'carton' | 'supports-souples' | 'supports-rigides'
  shortDescription: string
  seo: { metaTitle: string; metaDescription: string }
  status: 'draft'
}

type MaterialSource = {
  title: string
  slug: string
  group: MaterialSeed['group']
  tagline: string
  usages: string[]
  toConfirm: string[]
}

const MATERIAL_SOURCES: MaterialSource[] = [
  // Papier
  { title: 'Couché mat', slug: 'couche-mat', group: 'papier', tagline: 'Une surface lisse avec des reflets maîtrisés.', usages: ['brochures', 'catalogues', 'dépliants', 'fiches', 'couvertures'], toConfirm: ['grammage', 'opacité', 'blancheur', 'recto-verso', 'finition'] },
  { title: 'Couché brillant', slug: 'couche-brillant', group: 'papier', tagline: 'Des couleurs vives et une surface plus réfléchissante.', usages: ['flyers', 'affiches', 'catalogues visuels', 'promotions'], toConfirm: ['grammage', 'brillance', 'manipulation', 'éclairage', 'finition'] },
  { title: 'Offset', slug: 'offset', group: 'papier', tagline: 'Un papier non couché, naturel à l’écriture.', usages: ['papier à en-tête', 'blocs', 'livres', 'formulaires', 'intérieur de documents'], toConfirm: ['grammage', 'main', 'opacité', 'écriture', 'impression bureautique'] },
  { title: 'Bristol', slug: 'bristol', group: 'papier', tagline: 'Plus de tenue dans un format compact.', usages: ['cartes', 'fiches', 'couvertures légères', 'invitations'], toConfirm: ['grammage', 'rigidité', 'surface', 'pliage', 'finition'] },
  { title: 'Kraft', slug: 'kraft', group: 'papier', tagline: 'Une matière visible, avec une teinte naturelle.', usages: ['packaging', 'sacs', 'étiquettes', 'cartes', 'fourreaux'], toConfirm: ['teinte', 'contraste', 'blanc de soutien', 'fibre', 'finition'] },
  { title: 'Recyclé', slug: 'recycle', group: 'papier', tagline: 'Une matière à choisir sur des données vérifiées.', usages: ['papeterie', 'édition', 'marketing', 'packaging selon spécification'], toConfirm: ['certification', 'composition', 'teinte', 'disponibilité', 'rendu'] },
  { title: 'Texturé', slug: 'texture', group: 'papier', tagline: 'Le toucher devient une partie du message.', usages: ['cartes', 'invitations', 'couvertures', 'papeterie premium'], toConfirm: ['texture', 'grammage', 'lisibilité', 'aplats', 'finition'] },
  { title: 'Autocollant', slug: 'autocollant', group: 'papier', tagline: 'Un papier qui devient étiquette.', usages: ['stickers', 'étiquettes', 'fermeture', 'identification'], toConfirm: ['adhésif', 'surface', 'découpe', 'humidité', 'retrait'] },
  { title: 'Papier synthétique', slug: 'papier-synthetique', group: 'papier', tagline: 'Une lecture papier avec des propriétés différentes.', usages: ['menus', 'fiches', 'signalétique légère', 'usages exposés'], toConfirm: ['composition', 'résistance', 'impression', 'découpe', 'recyclabilité'] },

  // Carton
  { title: 'Carton compact', slug: 'carton-compact', group: 'carton', tagline: 'Une structure dense pour les étuis et supports.', usages: ['boîtes pliantes', 'pochettes', 'chemises', 'displays'], toConfirm: ['épaisseur', 'sens fibre', 'rainage', 'découpe', 'collage'] },
  { title: 'Carton ondulé', slug: 'carton-ondule', group: 'carton', tagline: 'La protection avec une structure cannelée.', usages: ['transport', 'boîtes', 'présentoirs', 'packaging secondaire'], toConfirm: ['cannelure', 'charge', 'dimensions', 'impression', 'montage'] },
  { title: 'Microcannelure', slug: 'microcannelure', group: 'carton', tagline: 'Plus fine, plus adaptée à la présentation.', usages: ['boîtes', 'coffrets', 'présentoirs', 'e-commerce'], toConfirm: ['type de cannelure', 'couverture', 'charge', 'découpe', 'finition'] },
  { title: 'Carton gris', slug: 'carton-gris', group: 'carton', tagline: 'Une base rigide pour habillage ou reliure.', usages: ['couvertures', 'coffrets', 'structures', 'panneaux'], toConfirm: ['épaisseur', 'habillage', 'coupe', 'collage', 'poids'] },
  { title: 'Carton kraft', slug: 'carton-kraft', group: 'carton', tagline: 'Une structure avec une expression matière.', usages: ['boîtes', 'e-commerce', 'présentoirs', 'emballage'], toConfirm: ['cannelure ou compact', 'teinte', 'impression', 'charge', 'finition'] },

  // Supports souples
  { title: 'Vinyle', slug: 'vinyle', group: 'supports-souples', tagline: 'Une surface adhésive pour habiller et identifier.', usages: ['vitrines', 'murs', 'véhicules', 'panneaux', 'sols selon gamme'], toConfirm: ['adhésif', 'surface', 'durée', 'pose', 'retrait'] },
  { title: 'Bâche', slug: 'bache', group: 'supports-souples', tagline: 'Une grande surface souple à tendre ou suspendre.', usages: ['façade', 'événement', 'chantier', 'scène'], toConfirm: ['matière', 'mesh éventuel', 'œillets', 'ourlets', 'vent'] },
  { title: 'Toile', slug: 'toile', group: 'supports-souples', tagline: 'Une matière textile ou canvas pour l’image.', usages: ['décoration', 'exposition', 'kakémono', 'reproduction'], toConfirm: ['composition', 'texture', 'tension', 'finition', 'usage'] },
  { title: 'Textile', slug: 'textile', group: 'supports-souples', tagline: 'Souple, léger et dépendant de sa composition.', usages: ['drapeaux', 'stands', 'événement', 'décoration'], toConfirm: ['fibre', 'impression compatible', 'confection', 'feu', 'lavage'] },
  { title: 'Film transparent', slug: 'film-transparent', group: 'supports-souples', tagline: 'Informer tout en laissant voir.', usages: ['vitrines', 'étiquettes', 'superposition', 'protection'], toConfirm: ['transparence', 'blanc', 'adhésif', 'reflet', 'pose'] },

  // Supports rigides
  { title: 'PVC Forex', slug: 'pvc-forex', group: 'supports-rigides', tagline: 'Un panneau léger pour l’intérieur ou certains usages courts.', usages: ['signalétique', 'exposition', 'affichage', 'plv'], toConfirm: ['épaisseur', 'dimensions', 'fixation', 'exposition', 'impression'] },
  { title: 'Plexiglas', slug: 'plexiglas', group: 'supports-rigides', tagline: 'Transparence, profondeur et rigidité.', usages: ['plaques', 'signalétique', 'décoration', 'présentoirs'], toConfirm: ['épaisseur', 'transparent ou teinté', 'impression', 'découpe', 'fixation'] },
  { title: 'Dibond', slug: 'dibond', group: 'supports-rigides', tagline: 'Une structure composite pour une bonne tenue.', usages: ['enseignes', 'panneaux', 'signalétique', 'exposition'], toConfirm: ['épaisseur', 'aluminium', 'fixation', 'extérieur', 'finition'] },
  { title: 'Akilux', slug: 'akilux', group: 'supports-rigides', tagline: 'Un panneau alvéolaire léger et temporaire.', usages: ['chantier', 'immobilier', 'événement', 'signalétique courte durée'], toConfirm: ['épaisseur', 'exposition', 'fixation', 'réemploi', 'dimensions'] },
  { title: 'Carton plume', slug: 'carton-plume', group: 'supports-rigides', tagline: 'Léger pour la présentation intérieure.', usages: ['exposition', 'maquette', 'affichage', 'présentation'], toConfirm: ['épaisseur', 'format', 'fragilité', 'fixation', 'découpe'] },
  { title: 'Bois', slug: 'bois', group: 'supports-rigides', tagline: 'Une matière dont le rendu dépend fortement de la surface.', usages: ['signalétique', 'décoration', 'présentation', 'objet plat'], toConfirm: ['essence', 'traitement', 'planéité', 'impression', 'découpe'] },
  { title: 'Métal', slug: 'metal', group: 'supports-rigides', tagline: 'Une base durable à spécifier précisément.', usages: ['plaques', 'signalétique', 'identification', 'décoration'], toConfirm: ['alliage', 'épaisseur', 'traitement', 'fixation', 'impression'] },
]

export const MATERIALS: MaterialSeed[] = MATERIAL_SOURCES.map((m) => ({
  slug: m.slug,
  title: m.title,
  group: m.group,
  shortDescription: `${m.tagline} Usages à envisager : ${m.usages.join(', ')}. Points à confirmer : ${m.toConfirm.join(', ')}.`,
  seo: {
    metaTitle: `${m.title} pour vos impressions | Printcom`,
    metaDescription: `${m.tagline} Découvrez ses usages possibles et les caractéristiques à confirmer pour votre projet.`,
  },
  status: 'draft',
}))
