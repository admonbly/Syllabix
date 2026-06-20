/**
 * Script one-shot : ajoute difficulty: 1 à toutes les questions Firestore
 * qui n'ont pas encore ce champ.
 *
 * Usage : node scripts/migrateDifficulty.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }        from 'fs';
import { resolve, dirname }    from 'path';
import { fileURLToPath }       from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────────────
// Méthode 1 : fichier service account JSON (ne jamais committer ce fichier)
// Méthode 2 : variable d'environnement GOOGLE_APPLICATION_CREDENTIALS
let serviceAccount;
try {
  const saPath = resolve(__dirname, '../service-account.json');
  serviceAccount = JSON.parse(readFileSync(saPath, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
} catch {
  // Utilise GOOGLE_APPLICATION_CREDENTIALS si le fichier n'existe pas
  initializeApp();
}

const db = getFirestore();

// ── Migration ────────────────────────────────────────────────────────────────
async function migrate() {
  const modulesSnap = await db.collection('modules').get();

  if (modulesSnap.empty) {
    console.log('Aucun module trouvé dans Firestore.');
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const moduleDoc of modulesSnap.docs) {
    const questionsSnap = await moduleDoc.ref.collection('questions').get();

    for (const qDoc of questionsSnap.docs) {
      const data = qDoc.data();
      if (data.difficulty !== undefined) {
        skipped++;
        continue;
      }
      await qDoc.ref.update({ difficulty: 1 });
      updated++;
    }

    console.log(`Module ${moduleDoc.id} : ${questionsSnap.size} questions traitées`);
  }

  console.log(`\n✅ Migration terminée — ${updated} mises à jour, ${skipped} déjà à jour.`);
  console.log('Pensez ensuite à définir manuellement difficulty: 2 ou 3 sur les questions avancées.');
}

migrate().catch((err) => {
  console.error('Erreur migration :', err);
  process.exit(1);
});
