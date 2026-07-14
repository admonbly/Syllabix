/**
 * seedArticles.mjs
 * Met à jour les articles dans Firestore depuis lib/articlesSeed.js
 *
 * Usage :
 *   node scripts/seedArticles.mjs              → dry-run (affiche ce qui serait écrit)
 *   node scripts/seedArticles.mjs --apply      → écrit dans Firestore (sans supprimer)
 *   node scripts/seedArticles.mjs --apply --clean  → supprime TOUS les articles puis réécrit
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Init Firebase Admin ──────────────────────────────────────────────────────
try {
  const sa = JSON.parse(readFileSync(resolve(__dirname, '../service-account.json'), 'utf8'));
  initializeApp({ credential: cert(sa) });
} catch {
  initializeApp();
}

const db = getFirestore();

// ─── Import des articles depuis le seed local ────────────────────────────────
// On lit le fichier brut et on extrait le tableau avec une regex simple
// (évite les problèmes d'import ESM/CJS entre Next.js et node)
const seedFileContent = readFileSync(resolve(__dirname, '../lib/articlesSeed.js'), 'utf8');

// Évalue le module pour extraire ARTICLES_SEED
// On utilise une approche compatible : créer un module temporaire
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Chargement dynamique via eval sécurisé
let ARTICLES_SEED;
try {
  // Transforme l'export ESM en variable accessible
  const code = seedFileContent
    .replace('export const ARTICLES_SEED', 'globalThis.__ARTICLES_SEED__')
    .replace('export default', '//');
  eval(code);
  ARTICLES_SEED = globalThis.__ARTICLES_SEED__;
} catch (err) {
  console.error('❌ Impossible de charger articlesSeed.js :', err.message);
  process.exit(1);
}

if (!Array.isArray(ARTICLES_SEED) || ARTICLES_SEED.length === 0) {
  console.error('❌ ARTICLES_SEED est vide ou invalide.');
  process.exit(1);
}

// ─── Arguments CLI ────────────────────────────────────────────────────────────
const APPLY = process.argv.includes('--apply');
const CLEAN = process.argv.includes('--clean');

// ─── Fonctions ────────────────────────────────────────────────────────────────

async function deleteAllArticles() {
  const snap = await db.collection('articles').get();
  if (snap.empty) {
    console.log('  ℹ️  Collection "articles" déjà vide.');
    return;
  }
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  console.log(`  🗑️  ${snap.size} ancien(s) article(s) supprimé(s).`);
}

async function writeArticles(articles) {
  const batch = db.batch();
  for (const article of articles) {
    const ref = db.collection('articles').doc(article.slug);
    batch.set(ref, {
      ...article,
      updatedAt: new Date().toISOString(),
    });
  }
  await batch.commit();
  console.log(`  ✅ ${articles.length} articles écrits dans Firestore.`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n📰 Seed Articles Syllabix');
  console.log('─'.repeat(50));
  console.log(`  Articles à traiter : ${ARTICLES_SEED.length}`);
  console.log(`  Mode             : ${APPLY ? (CLEAN ? 'apply + clean' : 'apply') : 'dry-run'}`);
  console.log('─'.repeat(50));

  // Aperçu des articles
  console.log('\n📋 Articles dans le seed :');
  ARTICLES_SEED.forEach((a, i) => {
    console.log(`  ${i + 1}. [${a.category}] ${a.title.substring(0, 60)}...`);
  });

  if (!APPLY) {
    console.log('\n⚠️  Mode dry-run — aucune modification dans Firestore.');
    console.log('   Lance avec --apply pour écrire, --apply --clean pour remplacer.\n');
    return;
  }

  console.log('\n🚀 Écriture dans Firestore...');

  if (CLEAN) {
    console.log('  🧹 Suppression des anciens articles...');
    await deleteAllArticles();
  }

  await writeArticles(ARTICLES_SEED);

  console.log('\n✨ Terminé ! Les nouveaux articles sont disponibles sur /blog.\n');
}

main().catch((err) => {
  console.error('❌ Erreur :', err);
  process.exit(1);
});
