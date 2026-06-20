/**
 * Articles par défaut — utilisés comme fallback si Firestore est vide.
 * Pour ajouter/modifier des articles dynamiquement :
 *   → Firebase Console > Firestore > collection "articles"
 *   → Ajouter un document avec les champs : slug, title, excerpt, content, category, image, publishedAt, author, tags
 */

export const ARTICLES_SEED = [
  {
    id: 'ia-chat-gpt-2026',
    slug: 'ia-chat-gpt-2026',
    title: "IA générative et agents IA en 2026 : L'avenir du travail",
    excerpt: "Explorez comment les assistants IA redéfinissent la productivité et l'employabilité en 2026.",
    category: 'IA',
    image: '🤖',
    publishedAt: '2026-03-22',
    author: 'Équipe Syllabix',
    tags: ['IA', 'travail', 'productivité'],
    content: `## Les agents IA autonomes en 2026

En 2026, les agents IA autonomes révolutionnent les espaces de travail. Ces systèmes peuvent non seulement répondre aux questions, mais aussi exécuter des tâches complexes de manière indépendante.

## Comment fonctionnent les systèmes IA modernes ?

Les nouveaux systèmes utilisent des modèles de langage multimodaux qui comprennent le texte, les images et même les vidéos. Ils sont capables d'apprendre des préférences utilisateur et d'adapter leurs réponses en temps réel.

## Applications professionnelles 2026

- Automatisation : Gérer les tâches répétitives et les processus métier
- Analyse de données : Interpréter des volumes massifs de données
- Service client : Support 24/7 multilingue et contextuel
- Collaboration : Assistants intelligents pour les équipes

## Compétences IA requises en 2026

- Littératie IA basique pour tous les rôles
- Capacité à collaborer efficacement avec les systèmes IA
- Compréhension des implications éthiques
- Adaptabilité face aux changements technologiques rapides`,
  },
  {
    id: 'securite-biometrique-2026',
    slug: 'securite-biometrique-2026',
    title: 'Sécurité biométrique et authentification multi-niveaux',
    excerpt: 'Les nouvelles normes de protection des données en 2026.',
    category: 'Cybersécurité',
    image: '🔒',
    publishedAt: '2026-03-18',
    author: 'Équipe Syllabix',
    tags: ['sécurité', 'biométrie', 'authentification'],
    content: `## La fin des mots de passe traditionnels ?

En 2026, l'authentification biométrique est devenue la norme. La combinaison reconnaissance faciale, empreinte digitale et reconnaissance vocale offre une sécurité inégalée.

## Niveaux d'authentification en 2026

- Niveau 1 : Biométrie unique (empreinte ou visage)
- Niveau 2 : Biométrie + device ID
- Niveau 3 : Multi-biométrie + contexte géographique
- Niveau 4 : Authentification comportementale IA

## Avantages de la sécurité biométrique

- Impossible à oublier
- Impossible à partager
- Détection de fraude en temps réel
- Expérience utilisateur fluide

## Conformité et réglementation

- RGPD renforcé pour les données biométriques
- Standards ISO 27001
- Consentement explicite des utilisateurs
- Droit à l'oubli pour les données biométriques`,
  },
  {
    id: 'power-bi-avance-2026',
    slug: 'power-bi-avance-2026',
    title: 'Power BI et analytics : Visualiser vos données en 2026',
    excerpt: 'Maîtrisez les outils modernes d\'analyse de données et de visualisation.',
    category: 'Données',
    image: '📊',
    publishedAt: '2026-03-15',
    author: 'Équipe Syllabix',
    tags: ['Power BI', 'données', 'analytics'],
    content: `## Power BI en 2026 : Plus qu'un outil de reporting

Power BI est devenu l'outil incontournable pour la business intelligence. Les organisations utilisent ses capacités avancées pour prendre des décisions data-driven en temps réel.

## Fonctionnalités clés 2026

- AI Insights : Découverte automatique de patterns
- Real-time Dashboards : Mise à jour instantanée des données
- Natural Language Query : Poser des questions en langage naturel
- Mobile Analytics : Accès complet en mobilité

## Cas d'usage professionnels

- Tableaux de bord KPI pour la direction
- Analyse prédictive des tendances du marché
- Optimisation de la supply chain
- Segmentation client avancée`,
  },
  {
    id: 'brand-digital-2026',
    slug: 'brand-digital-2026',
    title: 'Marque digitale et présence LinkedIn en 2026',
    excerpt: 'Construire votre image professionnelle à l\'ère du digital.',
    category: 'Employabilité',
    image: '💼',
    publishedAt: '2026-03-10',
    author: 'Équipe Syllabix',
    tags: ['LinkedIn', 'marque personnelle', 'emploi'],
    content: `## La marque personnelle en 2026

En 2026, votre présence digitale est votre première impression professionnelle. Construire une marque cohérente et authentique ouvre des portes qui ne s'ouvriraient jamais autrement.

## Éléments essentiels d'une marque digitale forte

- LinkedIn complet : Photo professionnelle, headline optimisée, résumé impactant
- Portfolio en ligne : Projets et accomplissements documentés
- Contenu régulier : Articles, insights et partages pertinents
- Réseau engagé : Connexions qualité plutôt que quantité

## Stratégie de contenu 2026

- Partager vos apprentissages et expériences
- Commenter et engager sur le contenu pertinent
- Créer du contenu original sur vos domaines d'expertise
- Utiliser les vidéos et formats visuels

## Pièges à éviter

- Profil incomplet
- Inactivité prolongée
- Contenu non professionnel ou incohérent
- Ignorance des tendances de votre industrie`,
  },
  {
    id: 'ia-recherche-2026',
    slug: 'ia-recherche-2026',
    title: 'Recherche intelligente avec les assistants IA',
    excerpt: 'Au-delà de Google : les nouveaux outils de recherche assistée par IA.',
    category: 'Internet',
    image: '🔍',
    publishedAt: '2026-03-05',
    author: 'Équipe Syllabix',
    tags: ['IA', 'recherche', 'Google'],
    content: `## Au-delà de Google en 2026

La recherche d'informations a radicalement changé. Les assistants IA synthétisent maintenant l'information plutôt que de simplement donner une liste de résultats.

## Nouveaux outils de recherche 2026

- Recherche conversationnelle : Dialogue continu avec l'IA
- Recherche contextuelle : Comprendre votre intention réelle
- Recherche multimodale : Images, texte, vidéo ensemble
- Recherche prédictive : Anticiper vos besoins

## Productivité améliorée

- Réduire le temps de recherche de 70%
- Obtenir des réponses plus précises et contextuelles
- Découvrir des connexions que vous auriez manquées
- Rester à jour sans surcharge informationnelle`,
  },
  {
    id: 'travail-hybrid-2026',
    slug: 'travail-hybrid-2026',
    title: 'Travail hybride : Outils et compétences indispensables',
    excerpt: 'Les technologies et soft-skills pour l\'environnement de travail 2026.',
    category: 'Employabilité',
    image: '💻',
    publishedAt: '2026-02-28',
    author: 'Équipe Syllabix',
    tags: ['télétravail', 'hybride', 'compétences'],
    content: `## Le travail hybride : nouveau standard en 2026

Le modèle hybride est maintenant dominant. Réussir en 2026 nécessite de maîtriser à la fois la technologie et les soft-skills pour travailler efficacement à distance et au bureau.

## Infrastructure technologique essentielle

- Hardware : Ordinateur performant, écrans multiples, connexion fiable
- Logiciels collaboration : Teams, Slack, Zoom pour la communication
- Sécurité : VPN, authentification biométrique
- Productivité : Project Management, documentation partagée

## Soft-skills critiques

- Communication asynchrone claire et concise
- Automanagement et discipline
- Collaboration virtuelle efficace
- Empathie et intelligence émotionnelle

## Meilleures pratiques du télétravail

- Établir une routine et des limites claires
- Créer un espace de travail dédié
- Maintenir la documentation à jour
- Participer aux réunions avec caméra activée`,
  },
];
