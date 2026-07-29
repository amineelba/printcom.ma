import { richText } from './richText'

/**
 * Real editorial content for the FAQ (brief section 20). The `faqs`
 * collection's category select has 5 options (quote/production/files/
 * delivery/general) — narrower than the brief's 13 informal categories, so
 * several brief categories are folded into the closest matching option.
 */
export type FAQSeed = {
  question: string
  answer: ReturnType<typeof richText>
  category: 'quote' | 'production' | 'files' | 'delivery' | 'general'
  order: number
  status: 'review'
}

const RAW: { question: string; answer: string; category: FAQSeed['category'] }[] = [
  { question: 'Comment demander un devis ?', category: 'quote', answer: 'Utilisez le formulaire de devis et indiquez le produit, l’usage, le format, la quantité, les options connues, la date souhaitée et les fichiers disponibles. Les informations manquantes pourront être étudiées ensuite.' },
  { question: 'Une demande de devis vaut-elle commande ?', category: 'quote', answer: 'Non. La demande sert à étudier la configuration, la faisabilité, le prix et les conditions. Une commande suit uniquement le processus de validation et d’acceptation confirmé par Printcom.' },
  { question: 'Puis-je demander un devis sans connaître le papier ou la finition ?', category: 'quote', answer: 'Oui. Sélectionnez « Je souhaite être conseillé » et décrivez l’usage, le rendu souhaité et la manière dont le support sera utilisé.' },
  { question: 'Quels éléments accélèrent l’étude d’un devis ?', category: 'quote', answer: 'Un format clair, une quantité estimée, une date souhaitée, un fichier ou un exemple, les options envisagées et la destination facilitent l’analyse.' },
  { question: 'Puis-je modifier ma demande après l’envoi ?', category: 'quote', answer: 'Contactez Printcom avec la référence de la demande. Toute modification importante peut nécessiter une nouvelle version du devis ou une nouvelle validation.' },
  { question: 'Quels fichiers puis-je envoyer ?', category: 'files', answer: 'Les formats autorisés doivent être affichés dans le formulaire selon la configuration technique de Printcom. Un PDF final, les fichiers sources, les images et les tracés techniques peuvent être demandés selon le projet.' },
  { question: 'Mon fichier est-il automatiquement prêt à imprimer ?', category: 'files', answer: 'Non. Un fichier transmis peut nécessiter un contrôle du format, du fond perdu, des images, des couleurs, des polices, des plis ou de la découpe.' },
  { question: 'Puis-je envoyer un fichier créé dans Word ou PowerPoint ?', category: 'files', answer: 'Ces fichiers peuvent changer selon les polices et les logiciels. Fournissez une version PDF relue et, si une adaptation est nécessaire, le fichier source avec les éléments associés.' },
  { question: 'Pourquoi mon image paraît-elle floue ?', category: 'files', answer: 'La définition disponible peut être insuffisante à la taille finale. Vérifiez la résolution effective, le niveau d’agrandissement et la qualité du fichier source.' },
  { question: 'Qu’est-ce qu’un fond perdu ?', category: 'files', answer: 'C’est une extension des images ou couleurs au-delà de la ligne de coupe. Elle évite l’apparition d’un bord blanc lorsque le support est coupé.' },
  { question: 'Dois-je convertir mes textes en tracés ?', category: 'files', answer: 'Cela dépend du workflow. Les polices peuvent être incorporées au PDF ou vectorisées lorsque les instructions le demandent. Conservez toujours une version éditable.' },
  { question: 'Comment transmettre un fichier volumineux ?', category: 'files', answer: 'Utilisez le téléversement privé du formulaire ou un lien autorisé selon les méthodes confirmées. Ne partagez pas de lien inaccessible ou arrivant rapidement à expiration.' },
  { question: 'Pourquoi la couleur imprimée diffère-t-elle de mon écran ?', category: 'general', answer: 'L’écran émet de la lumière, tandis que le papier réfléchit la lumière et l’encre. Le profil, le support, le procédé et le réglage de l’écran influencent le rendu.' },
  { question: 'Dois-je travailler en CMJN ?', category: 'general', answer: 'Cela dépend du procédé et des instructions. Le CMJN est courant en impression, mais la conversion doit être faite avec le profil approprié.' },
  { question: 'Pouvez-vous reproduire exactement une couleur de marque ?', category: 'general', answer: 'Une couleur doit être définie par une référence exploitable et évaluée selon le procédé, le papier et le niveau de contrôle prévu. Une correspondance absolue ne doit pas être promise sans processus validé.' },
  { question: 'Comment choisir entre un flyer, un dépliant et une brochure ?', category: 'general', answer: 'Choisissez selon le volume d’information. Le flyer porte un message court, le dépliant organise plusieurs volets et la brochure développe un contenu sur plusieurs pages.' },
  { question: 'Comment choisir un format ?', category: 'general', answer: 'Tenez compte du contenu, de la manipulation, du mode de distribution, de la distance de lecture, des contraintes postales ou logistiques et du budget.' },
  { question: 'Comment choisir un papier ?', category: 'general', answer: 'Comparez l’usage, la tenue, l’opacité, le toucher, le pliage, l’écriture, la finition et le poids total. Le grammage n’est qu’un critère parmi d’autres.' },
  { question: 'Puis-je demander un format sur mesure ?', category: 'general', answer: 'Un format personnalisé peut être étudié selon le produit, le support, la découpe et les capacités confirmées. Ajoutez les dimensions exactes au devis.' },
  { question: 'Existe-t-il une quantité minimale ?', category: 'production', answer: 'Elle dépend du produit, de la technologie, du support et du façonnage. Les minimums doivent être confirmés dans le devis.' },
  { question: 'Le prix unitaire baisse-t-il avec la quantité ?', category: 'production', answer: 'Le coût unitaire peut évoluer avec le volume, mais le calcul dépend de la mise en route, du support, des versions, des finitions et de la logistique.' },
  { question: 'Quel est le délai d’impression ?', category: 'production', answer: 'Le délai dépend de la validation, des fichiers, du produit, de la quantité, des matières, des finitions et de la charge. Il doit être confirmé pour chaque demande.' },
  { question: 'Proposez-vous une impression urgente ?', category: 'production', answer: 'Une demande urgente peut être étudiée. La faisabilité dépend du produit, des fichiers, des options et de la disponibilité réelle. Aucune date n’est garantie avant confirmation.' },
  { question: 'Quand commence le délai ?', category: 'production', answer: 'Le point de départ doit être défini dans les conditions Printcom, généralement après validation des éléments requis.' },
  { question: 'Qu’est-ce qu’un bon à tirer ?', category: 'files', answer: 'Le BAT est une version soumise à validation avant production. Il sert de référence pour le contenu et les paramètres qu’il présente.' },
  { question: 'Que dois-je vérifier sur un BAT ?', category: 'files', answer: 'Relisez textes, coordonnées, dates, images, ordre des pages, format, plis, découpes, couleurs, options et quantité. Signalez toute correction avant validation.' },
  { question: 'Puis-je corriger après avoir validé ?', category: 'files', answer: 'Toute correction après validation peut modifier le planning, le coût ou la version de référence. Contactez immédiatement Printcom avec la référence du projet.' },
  { question: 'De quelles informations avez-vous besoin pour un packaging ?', category: 'production', answer: 'Fournissez le produit ou un échantillon, les dimensions, le poids, le mode d’ouverture, le transport, les informations à afficher, la quantité et les contraintes applicables.' },
  { question: 'Pouvez-vous créer une forme de boîte sur mesure ?', category: 'production', answer: 'Une structure spécifique peut être étudiée selon les capacités confirmées. Elle nécessite généralement dimensions, matière, tracé, prototype et validation.' },
  { question: 'Qui valide les mentions réglementaires ?', category: 'production', answer: 'Le responsable du produit doit fournir et valider les contenus réglementaires. Printcom ne doit pas être présenté comme conseil juridique ou réglementaire sans mandat et expertise confirmés.' },
  { question: 'Comment choisir l’adhésif d’une étiquette ?', category: 'production', answer: 'Indiquez la matière, la forme, la température, l’humidité, la durée, la pose et les conditions de retrait. L’adhésif doit être choisi selon l’usage réel.' },
  { question: 'Quelle différence entre planche et rouleau ?', category: 'production', answer: 'La planche facilite souvent la pose manuelle ou les petites séries. Le rouleau est configuré selon la pose manuelle ou automatique, le mandrin et le sens d’enroulement.' },
  { question: 'Livrez-vous dans ma ville ?', category: 'delivery', answer: 'Les zones de livraison doivent être confirmées par Printcom. Indiquez la ville et l’adresse ou la zone dans la demande.' },
  { question: 'Pouvez-vous répartir une commande sur plusieurs sites ?', category: 'delivery', answer: 'La livraison multi-sites peut être étudiée si ce service est confirmé. Fournissez les destinations, quantités, versions et instructions de colisage.' },
  { question: 'Proposez-vous la pose de signalétique ?', category: 'delivery', answer: 'La disponibilité dépend de la zone, du support, du site, des accès et des responsabilités. Sélectionnez « À étudier » dans la demande.' },
  { question: 'Mes fichiers sont-ils publics ?', category: 'general', answer: 'Les fichiers de devis doivent être stockés dans un espace privé et accessibles uniquement aux utilisateurs autorisés. Les conditions de conservation doivent figurer dans la politique de confidentialité.' },
  { question: 'Comment signaler un problème ?', category: 'general', answer: 'Utilisez le formulaire de contact avec le sujet « Réclamation » et indiquez la référence, le produit, la quantité concernée, une description et des photos si le canal sécurisé les accepte.' },
]

export const FAQS: FAQSeed[] = RAW.map((item, index) => ({
  question: item.question,
  answer: richText([{ p: item.answer }]),
  category: item.category,
  order: index + 1,
  status: 'review',
}))
