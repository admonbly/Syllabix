/**
 * Épreuves pratiques pour les modules Internet (1), IA (5) et
 * Employabilité (6) — fichiers dans public/exercises/.
 * AJOUT UNIQUEMENT, dédupliqué par texte.
 * Usage : node scripts/seed-practical-batch2.mjs
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('../service-account.json', import.meta.url), 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

const BATCH = [
  {
    moduleId: 1,
    docId: 'practical-b2-1',
    question: {
      practical: true,
      app: 'explorer',
      fileUrl: '/exercises/internet/article-mystere.html',
      competency: { fr: 'Évaluer & analyser l\'information', en: 'Evaluate & analyse information' },
      instructions: [
        'Téléchargez le fichier article-mystere.html et ouvrez-le (double-clic : il s\'ouvre dans votre navigateur)',
        'Lisez cet article comme si un proche vous l\'avait partagé sur WhatsApp',
        'Cherchez les éléments qui permettraient de vérifier l\'information : noms de chercheurs, études citées, institutions identifiables',
      ],
      text: 'Combien de sources vérifiables (chercheur nommé, étude publiée, institution identifiée) cet article cite-t-il ?',
      type: 'calculation',
      correct: 0,
      tolerance: 0,
      difficulty: 2,
      explanation: 'ZÉRO source vérifiable : un "expert anonyme", "nos sources", "des témoignages sur les réseaux" — rien de contrôlable. Ajoutez le titre en majuscules, l\'urgence ("partagez avant suppression !"), le complot ("on vous cache") et même une date impossible (30 février !) : cet article coche toutes les cases de la désinformation.',
    },
  },
  {
    moduleId: 5,
    docId: 'practical-b2-1',
    question: {
      practical: true,
      app: 'explorer',
      fileUrl: '/exercises/ia/conversation-ia.txt',
      competency: { fr: 'Utiliser l\'IA au quotidien', en: 'Use AI in daily life' },
      instructions: [
        'Téléchargez le fichier conversation-ia.txt et ouvrez-le (Bloc-notes ou navigateur)',
        'Lisez la conversation entre un utilisateur et un assistant IA au sujet de Thomas Sankara',
        'L\'IA commet une "hallucination" : une information fausse affirmée avec assurance — repérez-la',
      ],
      text: 'Quelle année de naissance (FAUSSE) l\'assistant IA donne-t-il pour Thomas Sankara ?',
      type: 'calculation',
      correct: 1959,
      tolerance: 0,
      difficulty: 2,
      explanation: 'L\'IA affirme "né le 21 décembre 1959" alors que Thomas Sankara est né en 1949. Tout le reste de la réponse est correct, le ton est assuré, la date est plausible — c\'est exactement ce qui rend les hallucinations dangereuses. Réflexe à retenir : vérifier toute donnée factuelle importante avant de la réutiliser.',
    },
  },
  {
    moduleId: 6,
    docId: 'practical-b2-1',
    question: {
      practical: true,
      app: 'explorer',
      fileUrl: '/exercises/employabilite/cv-a-corriger.html',
      competency: { fr: 'Valoriser son profil professionnel', en: 'Enhance your professional profile' },
      instructions: [
        'Téléchargez le fichier cv-a-corriger.html et ouvrez-le dans votre navigateur',
        'Examinez ce CV comme le ferait un recruteur qui reçoit 200 candidatures',
        'Repérez les erreurs : police, informations manquantes, formulations vagues... et surtout l\'adresse email',
      ],
      text: 'Quelle est l\'adresse email non professionnelle utilisée dans ce CV ?',
      type: 'input',
      correct: 'bogossdu226@gmail.com',
      acceptableAnswers: ['bogossdu226@gmail.com', 'bogossdu226', 'bogossdu226@gmail'],
      difficulty: 1,
      explanation: 'Une adresse comme "bogossdu226@..." décrédibilise instantanément une candidature — le recruteur la voit avant même de lire le CV. Créez une adresse dédiée sobre : prenom.nom@gmail.com. Les autres fautes du CV : police Comic Sans en rose, aucun titre, expériences sans dates ni résultats, compétences génériques.',
    },
  },
];

for (const { moduleId, docId, question } of BATCH) {
  const col = db.collection(`modules/${moduleId}/questions`);
  const snap = await col.get();
  let maxOrder = 0;
  let exists = false;
  snap.forEach((d) => {
    const data = d.data();
    if (typeof data.order === 'number' && data.order > maxOrder) maxOrder = data.order;
    if ((data.text || '').trim() === question.text.trim()) exists = true;
  });
  if (exists) { console.log(`module ${moduleId}: déjà présent`); continue; }
  await col.doc(docId).set({ ...question, order: maxOrder + 1, pool: 'both', addedBatch: '2026-07-practical2' });
  console.log(`module ${moduleId}: épreuve pratique ajoutée (${question.fileUrl})`);
}
console.log('Terminé.');
