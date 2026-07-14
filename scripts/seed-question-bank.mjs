/**
 * Seed de la banque de questions vers Firestore — AJOUT UNIQUEMENT.
 * - Ne remplace ni ne supprime jamais de question existante
 * - Déduplique par texte de question
 * - Continue la numérotation `order` du module
 *
 * Usage : node scripts/seed-question-bank.mjs
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { QUESTION_BANK } from '../data/question-bank-2026-07.mjs';

const sa = JSON.parse(readFileSync(new URL('../service-account.json', import.meta.url), 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

// Validation avant écriture — on ne seed pas une question mal formée
function validate(q, moduleId) {
  const errors = [];
  const type = q.type || 'single';
  if (!q.text) errors.push('text manquant');
  if (!q.explanation) errors.push('explanation manquante (exigence pédagogique)');
  if (!q.competency?.fr) errors.push('competency manquante');
  if (![1, 2, 3].includes(q.difficulty)) errors.push('difficulty invalide');
  if (type === 'single' && (!Array.isArray(q.options) || typeof q.correct !== 'number')) errors.push('single: options/correct invalides');
  if (type === 'multi' && (!Array.isArray(q.options) || !Array.isArray(q.correct))) errors.push('multi: options/correct invalides');
  if (type === 'input' && !q.correct && !q.acceptableAnswers) errors.push('input: correct manquant');
  if (type === 'calculation' && isNaN(Number(q.correct))) errors.push('calculation: correct non numérique');
  if (q.practical && !Array.isArray(q.instructions)) errors.push('practical: instructions manquantes');
  if (errors.length) throw new Error(`Module ${moduleId} — "${(q.text || '?').slice(0, 50)}..." : ${errors.join(', ')}`);
}

let totalAdded = 0;
for (const mod of QUESTION_BANK) {
  mod.questions.forEach((q) => validate(q, mod.moduleId));

  const col = db.collection(`modules/${mod.moduleId}/questions`);
  const snap = await col.get();

  let maxOrder = 0;
  const existingTexts = new Set();
  snap.forEach((d) => {
    const data = d.data();
    if (typeof data.order === 'number' && data.order > maxOrder) maxOrder = data.order;
    existingTexts.add((data.text || '').trim());
  });

  let added = 0;
  for (const [i, q] of mod.questions.entries()) {
    if (existingTexts.has(q.text.trim())) {
      console.log(`  module ${mod.moduleId}: déjà présent — "${q.text.slice(0, 45)}..."`);
      continue;
    }
    maxOrder += 1;
    await col.doc(`bank202607-${mod.moduleId}-${i + 1}`).set({
      ...q,
      order: maxOrder,
      pool: 'both',
      addedBatch: '2026-07',
    });
    added++;
  }
  totalAdded += added;
  console.log(`Module ${mod.moduleId}: ${added} question(s) ajoutée(s) — total module: ${snap.size + added}`);
}
console.log(`\nTerminé : ${totalAdded} questions ajoutées.`);
