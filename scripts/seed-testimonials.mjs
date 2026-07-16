/**
 * Import de témoignages vers Firestore — AJOUT UNIQUEMENT.
 * Ne remplace jamais un témoignage déjà présent.
 *
 * ⚠️ Ce script est aujourd'hui SANS EFFET : la liste source
 * (lib/testimonialsSeed.js) est volontairement vide depuis le 2026-07-15.
 * Elle contenait des personnes inventées, retirées du site et de la base.
 *
 * N'ajoutez ici que des témoignages RÉELS, avec l'accord de la personne.
 * En pratique, préférez le back-office /admin/temoignages : il écrit
 * directement en base, sans passer par le code.
 *
 * Usage : node scripts/seed-testimonials.mjs
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { TESTIMONIALS_SEED } from '../lib/testimonialsSeed.js';

if (TESTIMONIALS_SEED.length === 0) {
  console.log('ℹ️  Aucun témoignage à importer (liste source vide, c\'est voulu).');
  console.log('   Pour en ajouter un réel : /admin/temoignages');
  process.exit(0);
}

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
