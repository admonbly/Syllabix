/**
 * Alignement du référentiel Syllabix sur le cadre Pix / CRCN
 * (Cadre de Référence des Compétences Numériques), lui-même dérivé du
 * référentiel européen DigComp.
 *
 * Objectif : permettre aux tableaux de bord écoles/entreprises (sous-projets 2 et 3)
 * de restituer la progression par DOMAINE et par COMPÉTENCE reconnus, et pas
 * seulement par module Syllabix. Rien n'est affiché à ce stade — c'est la
 * fondation de données du reporting.
 *
 * Les libellés sont adaptés au contexte ivoirien / africain (Mobile Money,
 * démarches administratives locales, employabilité) plutôt que repris mot pour
 * mot du référentiel français.
 *
 * Source de vérité des modules : lib/moduleNames.js et lib/moduleCompetencies.js
 */

/** Les 5 domaines du CRCN. */
export const PIX_DOMAINS = [
  {
    id: 1,
    code: 'INFORMATION_DONNEES',
    nameFr: 'Information et données',
    nameEn: 'Information and data',
    descFr: 'Chercher, évaluer et organiser l\'information numérique.',
  },
  {
    id: 2,
    code: 'COMMUNICATION_COLLABORATION',
    nameFr: 'Communication et collaboration',
    nameEn: 'Communication and collaboration',
    descFr: 'Interagir, partager et travailler à plusieurs avec des outils numériques.',
  },
  {
    id: 3,
    code: 'CREATION_CONTENU',
    nameFr: 'Création de contenu',
    nameEn: 'Content creation',
    descFr: 'Produire des documents, des données et des contenus numériques.',
  },
  {
    id: 4,
    code: 'PROTECTION_SECURITE',
    nameFr: 'Protection et sécurité',
    nameEn: 'Protection and security',
    descFr: 'Protéger ses données, ses appareils et sa vie privée en ligne.',
  },
  {
    id: 5,
    code: 'ENVIRONNEMENT_NUMERIQUE',
    nameFr: 'Environnement numérique',
    nameEn: 'Digital environment',
    descFr: 'Comprendre et utiliser son matériel, ses logiciels et l\'écosystème numérique.',
  },
];

/**
 * Les 16 compétences du CRCN, rattachées à leur domaine et aux modules Syllabix
 * qui les couvrent (`moduleIds` → index de MODULE_NAMES / MODULE_COMPETENCIES).
 */
export const PIX_COMPETENCIES = [
  // ── Domaine 1 — Information et données ──────────────────────────────
  { code: '1.1', domainId: 1, nameFr: 'Mener une recherche et une veille d\'information', nameEn: 'Search and monitor information', moduleIds: [1] },
  { code: '1.2', domainId: 1, nameFr: 'Gérer des données',                                nameEn: 'Manage data',                     moduleIds: [1, 3] },
  { code: '1.3', domainId: 1, nameFr: 'Traiter des données',                              nameEn: 'Process data',                    moduleIds: [3] },

  // ── Domaine 2 — Communication et collaboration ──────────────────────
  { code: '2.1', domainId: 2, nameFr: 'Interagir',                                        nameEn: 'Interact',                        moduleIds: [2] },
  { code: '2.2', domainId: 2, nameFr: 'Partager et publier',                              nameEn: 'Share and publish',               moduleIds: [2, 6] },
  { code: '2.3', domainId: 2, nameFr: 'Collaborer',                                       nameEn: 'Collaborate',                     moduleIds: [2, 6] },
  { code: '2.4', domainId: 2, nameFr: 'S\'insérer dans le monde numérique',               nameEn: 'Fit into the digital world',      moduleIds: [6, 1] },

  // ── Domaine 3 — Création de contenu ─────────────────────────────────
  { code: '3.1', domainId: 3, nameFr: 'Développer des documents textuels',                nameEn: 'Create text documents',           moduleIds: [3] },
  { code: '3.2', domainId: 3, nameFr: 'Développer des documents multimédias',             nameEn: 'Create multimedia documents',     moduleIds: [3, 5] },
  { code: '3.3', domainId: 3, nameFr: 'Adapter les documents à leur finalité',            nameEn: 'Adapt documents to their purpose', moduleIds: [3, 5] },
  { code: '3.4', domainId: 3, nameFr: 'Programmer et automatiser',                        nameEn: 'Program and automate',            moduleIds: [3, 5] },

  // ── Domaine 4 — Protection et sécurité ──────────────────────────────
  { code: '4.1', domainId: 4, nameFr: 'Sécuriser l\'environnement numérique',             nameEn: 'Secure the digital environment',  moduleIds: [4] },
  { code: '4.2', domainId: 4, nameFr: 'Protéger les données personnelles et la vie privée', nameEn: 'Protect personal data and privacy', moduleIds: [4] },
  { code: '4.3', domainId: 4, nameFr: 'Protéger la santé, le bien-être et l\'environnement', nameEn: 'Protect health, wellbeing and environment', moduleIds: [4, 5] },

  // ── Domaine 5 — Environnement numérique ─────────────────────────────
  { code: '5.1', domainId: 5, nameFr: 'Résoudre des problèmes techniques',                nameEn: 'Solve technical problems',        moduleIds: [0] },
  { code: '5.2', domainId: 5, nameFr: 'Construire un environnement numérique',            nameEn: 'Build a digital environment',     moduleIds: [0, 1] },
];

/**
 * Module Syllabix → compétences Pix couvertes.
 * Index = moduleId (0..6), aligné sur MODULE_NAMES.
 */
export const MODULE_TO_PIX = PIX_COMPETENCIES.reduce((acc, comp) => {
  for (const moduleId of comp.moduleIds) {
    (acc[moduleId] ??= []).push(comp.code);
  }
  return acc;
}, {});

/** Compétences Pix couvertes par un module Syllabix. */
export function getPixCompetenciesForModule(moduleId) {
  const codes = MODULE_TO_PIX[Number(moduleId)] ?? [];
  return PIX_COMPETENCIES.filter((c) => codes.includes(c.code));
}

/** Domaine Pix d'une compétence (par code, ex. '3.2'). */
export function getPixDomain(competencyCode) {
  const comp = PIX_COMPETENCIES.find((c) => c.code === competencyCode);
  return comp ? PIX_DOMAINS.find((d) => d.id === comp.domainId) ?? null : null;
}

/** Modules Syllabix couvrant un domaine Pix donné. */
export function getModulesForDomain(domainId) {
  const modules = new Set();
  for (const comp of PIX_COMPETENCIES) {
    if (comp.domainId === domainId) comp.moduleIds.forEach((m) => modules.add(m));
  }
  return [...modules].sort((a, b) => a - b);
}
