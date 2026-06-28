/**
 * Mapping module → compétences numériques développées.
 * Source de vérité utilisée sur /training et /training/module/[id].
 *
 * Chaque compétence est présentée de façon simple et concrète
 * pour être compréhensible par tous les utilisateurs.
 */

export const MODULE_COMPETENCIES = [
  {
    moduleId: 0,
    nameFr: 'IT & Ordinateur',
    nameEn: 'IT & Computer',
    icon: '💻',
    color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
    competences: [
      { emoji: '🖥️', fr: 'Maîtriser son ordinateur',             en: 'Master your computer',              desc_fr: 'Matériel, système d\'exploitation, gestion de fichiers', desc_en: 'Hardware, OS, file management' },
      { emoji: '🔧', fr: 'Résoudre les problèmes courants',       en: 'Troubleshoot common issues',         desc_fr: 'Diagnostiquer et corriger les pannes basiques',          desc_en: 'Diagnose and fix basic issues' },
      { emoji: '📱', fr: 'Utiliser l\'écosystème numérique',      en: 'Use the digital ecosystem',          desc_fr: 'Mobile Money, applications africaines, outils locaux',   desc_en: 'Mobile Money, African apps, local tools' },
    ],
  },
  {
    moduleId: 1,
    nameFr: 'Internet',
    nameEn: 'Internet',
    icon: '🌐',
    color: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-800' },
    competences: [
      { emoji: '🔍', fr: 'Rechercher efficacement',               en: 'Search efficiently',                desc_fr: 'Trouver des infos fiables, éviter la désinformation',   desc_en: 'Find reliable info, avoid misinformation' },
      { emoji: '📊', fr: 'Évaluer & analyser l\'information',     en: 'Evaluate & analyse information',    desc_fr: 'Distinguer sources fiables et fausses nouvelles',       desc_en: 'Distinguish reliable sources from fake news' },
      { emoji: '🏛️', fr: 'Accéder aux services en ligne',        en: 'Access online services',             desc_fr: 'Démarches administratives, services publics, banque',    desc_en: 'Government services, banking, public services' },
    ],
  },
  {
    moduleId: 2,
    nameFr: 'Email',
    nameEn: 'Email',
    icon: '📧',
    color: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
    competences: [
      { emoji: '✉️', fr: 'Communiquer par email',                 en: 'Communicate by email',              desc_fr: 'Rédiger, envoyer et organiser ses emails professionnels', desc_en: 'Write, send and organize professional emails' },
      { emoji: '📤', fr: 'Partager du contenu en ligne',          en: 'Share content online',               desc_fr: 'Pièces jointes, liens, partage de documents',           desc_en: 'Attachments, links, document sharing' },
      { emoji: '🤝', fr: 'Collaborer à distance',                 en: 'Collaborate remotely',               desc_fr: 'Travail en équipe via outils numériques',               desc_en: 'Teamwork via digital tools' },
    ],
  },
  {
    moduleId: 3,
    nameFr: 'Bureautique',
    nameEn: 'Office Tools',
    icon: '📊',
    color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' },
    competences: [
      { emoji: '📄', fr: 'Créer des documents professionnels',    en: 'Create professional documents',      desc_fr: 'Word, rapports, mise en page et présentations PowerPoint', desc_en: 'Word, reports, layouts and PowerPoint slides' },
      { emoji: '📈', fr: 'Analyser avec des tableurs',            en: 'Analyse with spreadsheets',          desc_fr: 'Excel, formules, tableaux et graphiques de données',    desc_en: 'Excel, formulas, data tables and charts' },
      { emoji: '⚙️', fr: 'Automatiser des tâches répétitives',   en: 'Automate repetitive tasks',          desc_fr: 'Macros, modèles réutilisables, publipostage',           desc_en: 'Macros, reusable templates, mail merge' },
    ],
  },
  {
    moduleId: 4,
    nameFr: 'Cybersécurité',
    nameEn: 'Cybersecurity',
    icon: '🔒',
    color: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
    competences: [
      { emoji: '🔐', fr: 'Protéger ses données personnelles',     en: 'Protect personal data',              desc_fr: 'Mots de passe forts, vie privée, RGPD',                 desc_en: 'Strong passwords, privacy, GDPR' },
      { emoji: '🛡️', fr: 'Sécuriser ses appareils',              en: 'Secure your devices',                desc_fr: 'Antivirus, mises à jour, sauvegarde, éviter les virus', desc_en: 'Antivirus, updates, backup, avoiding viruses' },
      { emoji: '🎣', fr: 'Reconnaître les arnaques en ligne',     en: 'Spot online scams',                  desc_fr: 'Phishing, faux sites, escroqueries par SMS ou email',   desc_en: 'Phishing, fake sites, SMS/email scams' },
    ],
  },
  {
    moduleId: 5,
    nameFr: 'Intelligence Artificielle',
    nameEn: 'Artificial Intelligence',
    icon: '🤖',
    color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
    competences: [
      { emoji: '💬', fr: 'Utiliser l\'IA au quotidien',           en: 'Use AI in daily life',               desc_fr: 'ChatGPT, assistants IA, génération de texte et images', desc_en: 'ChatGPT, AI assistants, text and image generation' },
      { emoji: '🎨', fr: 'Créer du contenu avec l\'IA',           en: 'Create content with AI',             desc_fr: 'Générer textes, images, présentations automatiquement',  desc_en: 'Generate text, images, presentations automatically' },
      { emoji: '⚖️', fr: 'Comprendre les enjeux éthiques',        en: 'Understand ethical challenges',      desc_fr: 'Biais, droits d\'auteur, usage responsable de l\'IA',   desc_en: 'Bias, copyright, responsible AI use' },
    ],
  },
  {
    moduleId: 6,
    nameFr: 'Employabilité',
    nameEn: 'Employability',
    icon: '💼',
    color: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
    competences: [
      { emoji: '🏆', fr: 'Valoriser son profil professionnel',    en: 'Enhance your professional profile',  desc_fr: 'LinkedIn, CV numérique, visibilité en ligne',           desc_en: 'LinkedIn, digital CV, online visibility' },
      { emoji: '🤝', fr: 'Travailler en équipe à distance',       en: 'Work remotely in a team',            desc_fr: 'Visioconférence, outils collaboratifs, gestion de projet', desc_en: 'Video calls, collaborative tools, project management' },
      { emoji: '🚀', fr: 'Développer son réseau professionnel',   en: 'Build your professional network',    desc_fr: 'Networking, réseaux sociaux pro, personal branding',    desc_en: 'Networking, pro social networks, personal branding' },
    ],
  },
];
