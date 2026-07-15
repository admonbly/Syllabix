/**
 * Migration des témoignages de l'accueil vers Firestore — AJOUT UNIQUEMENT.
 * Ne remplace jamais un témoignage déjà présent (édition possible via /admin/temoignages).
 *
 * Usage : node scripts/seed-testimonials.mjs
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { TESTIMONIALS_SEED } from '../lib/testimonialsSeed.js';

const sa = JSON.parse(readFileSync(new URL('../service-account.json', import.meta.url), 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

let added = 0, skipped = 0;

for (const tm of TESTIMONIALS_SEED) {
  const ref = db.doc(`testimonials/${tm.id}`);
  if ((await ref.get()).exists) {
    console.log(`⏭️  ${tm.name} — déjà présent, ignoré`);
    skipped++;
    continue;
  }
  await ref.set({ ...tm, createdAt: new Date().toISOString(), createdBy: 'seed-script' });
  console.log(`✅ ${tm.name} — ajouté`);
  added++;
}

console.log(`\n${added} ajouté(s), ${skipped} ignoré(s).`);
process.exit(0);
