/**
 * Real editorial content for finishes (brief section 14), grouped by
 * family. Same field constraint as materials — usages/points-to-confirm
 * are folded into `shortDescription`.
 */
export type FinishSeed = {
  slug: string
  title: string
  group: 'pelliculage' | 'vernis' | 'ennoblissement' | 'decoupe' | 'reliure'
  shortDescription: string
  seo: { metaTitle: string; metaDescription: string }
  status: 'draft'
}

type FinishSource = {
  title: string
  slug: string
  group: FinishSeed['group']
  tagline: string
  usages: string[]
  toConfirm: string[]
}

const FINISH_SOURCES: FinishSource[] = [
  // Pelliculage
  { title: 'Pelliculage mat', slug: 'pelliculage-mat', group: 'pelliculage', tagline: 'Un reflet réduit. Un toucher plus discret.', usages: ['couvertures', 'cartes', 'packaging', 'chemises'], toConfirm: ['compatibilité support', 'recto/verso', 'pliage', 'résistance'] },
  { title: 'Pelliculage brillant', slug: 'pelliculage-brillant', group: 'pelliculage', tagline: 'Plus de lumière en surface.', usages: ['flyers', 'couvertures', 'packaging', 'visuels colorés'], toConfirm: ['reflet', 'manipulation', 'support', 'rayure'] },
  { title: 'Pelliculage soft touch', slug: 'pelliculage-soft-touch', group: 'pelliculage', tagline: 'Un toucher velouté à valider sur échantillon.', usages: ['packaging', 'cartes', 'couvertures', 'coffrets'], toConfirm: ['compatibilité', 'rayure', 'couleur', 'pli', 'disponibilité'] },
  { title: 'Pelliculage anti-rayures', slug: 'pelliculage-anti-rayures', group: 'pelliculage', tagline: 'Protéger les surfaces très manipulées.', usages: ['couvertures sombres', 'packaging', 'menus', 'chemises'], toConfirm: ['niveau de protection', 'support', 'finition associée', 'coût'] },

  // Vernis
  { title: 'Vernis machine', slug: 'vernis-machine', group: 'vernis', tagline: 'Une protection légère intégrée au processus.', usages: ['imprimés courants', 'couvertures', 'travaux offset'], toConfirm: ['brillance', 'couverture', 'support', 'procédé'] },
  { title: 'Vernis UV', slug: 'vernis-uv', group: 'vernis', tagline: 'Une surface plus marquée selon application.', usages: ['couvertures', 'packaging', 'cartes', 'supports visuels'], toConfirm: ['support', 'couverture', 'pliage', 'effet'] },
  { title: 'Vernis sélectif', slug: 'vernis-selectif', group: 'vernis', tagline: 'La lumière sur une zone précise.', usages: ['logo', 'titre', 'motif', 'détail produit'], toConfirm: ['fichier de vernis', 'repérage', 'pelliculage', 'surface'] },
  { title: 'Vernis sélectif 3D', slug: 'vernis-selectif-3d', group: 'vernis', tagline: 'Un relief visible et tactile.', usages: ['cartes', 'couvertures', 'packaging', 'éléments graphiques'], toConfirm: ['hauteur', 'finesse', 'repérage', 'support', 'disponibilité'] },

  // Ennoblissement
  { title: 'Dorure à chaud', slug: 'dorure-a-chaud', group: 'ennoblissement', tagline: 'Une matière métallique appliquée par pression et chaleur.', usages: ['cartes', 'couvertures', 'packaging', 'invitations'], toConfirm: ['couleur', 'surface', 'cliché', 'finesse', 'support'] },
  { title: 'Dorure argent', slug: 'dorure-argent', group: 'ennoblissement', tagline: 'Un accent froid et réfléchissant.', usages: ['packaging', 'cartes', 'couvertures', 'signalétique fine'], toConfirm: ['teinte', 'support', 'surface', 'contraste', 'finition'] },
  { title: 'Gaufrage', slug: 'gaufrage', group: 'ennoblissement', tagline: 'Faire monter la matière.', usages: ['logo', 'motif', 'titre', 'texture'], toConfirm: ['relief', 'contrepartie', 'papier', 'taille', 'position'] },
  { title: 'Débossage', slug: 'debossage', group: 'ennoblissement', tagline: 'Creuser pour créer une empreinte.', usages: ['couverture', 'carte', 'packaging', 'marquage sobre'], toConfirm: ['profondeur', 'support', 'surface', 'verso', 'combinaison'] },
  { title: 'Marquage holographique', slug: 'marquage-holographique', group: 'ennoblissement', tagline: 'Un effet changeant qui doit rester local.', usages: ['sécurité visuelle', 'édition', 'packaging', 'accent'], toConfirm: ['film', 'motif', 'zone', 'support', 'réglementation éventuelle'] },

  // Découpe
  { title: 'Coupe droite', slug: 'coupe-droite', group: 'decoupe', tagline: 'La précision du format final.', usages: ['tous imprimés rectangulaires'], toConfirm: ['dimensions', 'tolérance', 'repères', 'fond perdu'] },
  { title: 'Coins arrondis', slug: 'coins-arrondis', group: 'decoupe', tagline: 'Adoucir la forme et la manipulation.', usages: ['cartes', 'badges', 'fiches', 'menus'], toConfirm: ['rayon', 'support', 'épaisseur', 'quantité'] },
  { title: 'Forme personnalisée', slug: 'forme-personnalisee', group: 'decoupe', tagline: 'Faire du contour une partie du design.', usages: ['stickers', 'packaging', 'plv', 'cartes'], toConfirm: ['tracé vectoriel', 'ponts', 'rayon', 'matière', 'imbrication'] },
  { title: 'Découpe laser', slug: 'decoupe-laser', group: 'decoupe', tagline: 'Une découpe fine selon matière et équipement.', usages: ['papier', 'carton', 'certains rigides', 'décoration'], toConfirm: ['matière', 'brûlure', 'finesse', 'format', 'disponibilité'] },
  { title: 'Mi-chair', slug: 'mi-chair', group: 'decoupe', tagline: 'Découper l’adhésif sans traverser le support.', usages: ['étiquettes', 'stickers', 'planches'], toConfirm: ['tracé', 'liner', 'espace', 'forme', 'échenillage'] },

  // Reliure
  { title: 'Agrafage', slug: 'agrafage', group: 'reliure', tagline: 'Simple pour les publications courtes.', usages: ['brochures', 'livrets', 'programmes'], toConfirm: ['pagination', 'format', 'papier', 'piqûre', 'dos'] },
  { title: 'Dos carré collé', slug: 'dos-carre-colle', group: 'reliure', tagline: 'Un dos lisible pour les volumes plus importants.', usages: ['livres', 'catalogues', 'rapports', 'magazines'], toConfirm: ['épaisseur', 'colle', 'ouverture', 'couverture', 'pagination'] },
  { title: 'Spirale', slug: 'spirale', group: 'reliure', tagline: 'Une ouverture pratique et répétée.', usages: ['manuels', 'blocs', 'formation', 'calendriers'], toConfirm: ['diamètre', 'métal/plastique', 'perforation', 'couverture'] },
  { title: 'Couture', slug: 'couture', group: 'reliure', tagline: 'Assembler les cahiers avec une structure durable.', usages: ['livres', 'éditions', 'documents de référence'], toConfirm: ['cahiers', 'papier', 'couverture', 'ouverture', 'disponibilité'] },
  { title: 'Wire-O', slug: 'wire-o', group: 'reliure', tagline: 'Une reliure métallique régulière.', usages: ['calendriers', 'carnets', 'présentations', 'manuels'], toConfirm: ['diamètre', 'couleur', 'perforation', 'couverture', 'suspension'] },
  { title: 'Couverture rigide', slug: 'couverture-rigide', group: 'reliure', tagline: 'Transformer le document en objet durable.', usages: ['livres', 'rapports', 'coffrets éditoriaux', 'cadeaux'], toConfirm: ['carton', 'habillage', 'dos', 'garde', 'finition'] },
]

export const FINISHES: FinishSeed[] = FINISH_SOURCES.map((f) => ({
  slug: f.slug,
  title: f.title,
  group: f.group,
  shortDescription: `${f.tagline} Usages à envisager : ${f.usages.join(', ')}. Points à confirmer : ${f.toConfirm.join(', ')}.`,
  seo: {
    metaTitle: `${f.title} pour supports imprimés | Printcom`,
    metaDescription: `${f.tagline} Découvrez les usages, supports compatibles et points à confirmer avant votre devis.`,
  },
  status: 'draft',
}))
