/**
 * Script interactif : affiche les questions d'un module et permet de
 * modifier leur difficulté une par une ou en batch.
 *
 * Usage :
 *   node scripts/setDifficulty.mjs                      → menu interactif
 *   node scripts/setDifficulty.mjs list <moduleId>      → liste les questions
 *   node scripts/setDifficulty.mjs set <moduleId> <questionId> <1|2|3>
 *   node scripts/setDifficulty.mjs batch <moduleId> <1|2|3> <id1,id2,id3,...>
 *
 * Exemples :
 *   node scripts/setDifficulty.mjs list 0
 *   node scripts/setDifficulty.mjs set 0 abc123 2
 *   node scripts/setDifficulty.mjs batch 0 3 abc123,def456,ghi789
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }        from 'fs';
import { resolve, dirname }    from 'path';
import { fileURLToPath }       from 'url';
import * as readline           from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Init Firebase Admin ──────────────────────────────────────────────────────
let serviceAccount;
try {
  const saPath = resolve(__dirname, '../service-account.json');
  serviceAccount = JSON.parse(readFileSync(saPath, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
} catch {
  initializeApp();
}

const db = getFirestore();

// ── Helpers ──────────────────────────────────────────────────────────────────
const DIFFICULTY_LABELS = { 1: '🟢 Facile', 2: '🟡 Intermédiaire', 3: '🔴 Avancé' };

function truncate(str = '', len = 80) {
  return str.length > len ? str.slice(0, len) + '…' : str;
}

async function listQuestions(moduleId) {
  const snap = await db
    .collection('modules')
    .doc(String(moduleId))
    .collection('questions')
    .orderBy('difficulty')
    .get();

  if (snap.empty) {
    console.log(`Aucune question dans le module ${moduleId}.`);
    return [];
  }

  console.log(`\n📋 Module ${moduleId} — ${snap.size} questions :\n`);
  console.log('ID'.padEnd(24) + 'Diff'.padEnd(6) + 'Question');
  console.log('─'.repeat(100));

  const rows = [];
  snap.forEach((doc) => {
    const d = doc.data();
    const diff = d.difficulty ?? 1;
    const label = DIFFICULTY_LABELS[diff] ?? String(diff);
    console.log(doc.id.padEnd(24) + label.padEnd(22) + truncate(d.question ?? d.text ?? ''));
    rows.push({ id: doc.id, ...d });
  });

  console.log('');
  return rows;
}

async function setDifficulty(moduleId, questionId, difficulty) {
  const ref = db
    .collection('modules')
    .doc(String(moduleId))
    .collection('questions')
    .doc(questionId);

  const snap = await ref.get();
  if (!snap.exists) {
    console.error(`❌ Question ${questionId} introuvable dans le module ${moduleId}.`);
    return false;
  }

  await ref.update({ difficulty: Number(difficulty) });
  const d = snap.data();
  console.log(`✅ ${questionId} → ${DIFFICULTY_LABELS[difficulty]} : "${truncate(d.question ?? d.text ?? '', 60)}"`);
  return true;
}

async function batchSet(moduleId, difficulty, ids) {
  console.log(`\n🔄 Mise à jour de ${ids.length} questions → ${DIFFICULTY_LABELS[difficulty]}\n`);
  let ok = 0;
  for (const id of ids) {
    const success = await setDifficulty(moduleId, id.trim(), difficulty);
    if (success) ok++;
  }
  console.log(`\n✅ ${ok}/${ids.length} questions mises à jour.`);
}

// ── Mode interactif ──────────────────────────────────────────────────────────
async function interactiveMode() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((res) => rl.question(q, res));

  console.log('\n🎯 setDifficulty — Mode interactif');
  console.log('Modules disponibles : 0 (IT) | 1 (Internet) | 2 (Email) | 3 (Bureautique) | 4 (Cybersécurité) | 5 (IA) | 6 (Employabilité)\n');

  const moduleId = await ask('Module à modifier (0-6) : ');
  const rows = await listQuestions(moduleId);

  if (rows.length === 0) { rl.close(); return; }

  console.log('Options :');
  console.log('  • Entrez un ID de question pour modifier sa difficulté');
  console.log('  • Entrez plusieurs IDs séparés par des virgules pour un batch');
  console.log('  • Entrez "q" pour quitter\n');

  while (true) {
    const input = await ask('ID(s) de question (ou "q") : ');
    if (input.trim() === 'q') break;

    const ids = input.split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) continue;

    const diffInput = await ask('Difficulté (1=Facile, 2=Intermédiaire, 3=Avancé) : ');
    const diff = Number(diffInput);
    if (![1, 2, 3].includes(diff)) {
      console.log('❌ Valeur invalide — entrez 1, 2 ou 3.');
      continue;
    }

    for (const id of ids) {
      await setDifficulty(moduleId, id, diff);
    }

    const again = await ask('\nModifier d\'autres questions du même module ? (o/n) : ');
    if (again.trim().toLowerCase() !== 'o') break;
  }

  rl.close();
  console.log('\n👋 Terminé.');
}

// ── Point d'entrée ───────────────────────────────────────────────────────────
const [,, command, ...args] = process.argv;

async function main() {
  switch (command) {
    case 'list': {
      const [moduleId] = args;
      if (moduleId === undefined) { console.error('Usage : node scripts/setDifficulty.mjs list <moduleId>'); process.exit(1); }
      await listQuestions(moduleId);
      break;
    }
    case 'set': {
      const [moduleId, questionId, difficulty] = args;
      if (!moduleId || !questionId || !difficulty) {
        console.error('Usage : node scripts/setDifficulty.mjs set <moduleId> <questionId> <1|2|3>');
        process.exit(1);
      }
      if (![1, 2, 3].includes(Number(difficulty))) {
        console.error('Difficulté invalide — valeurs acceptées : 1, 2, 3');
        process.exit(1);
      }
      await setDifficulty(moduleId, questionId, Number(difficulty));
      break;
    }
    case 'batch': {
      const [moduleId, difficulty, idsStr] = args;
      if (!moduleId || !difficulty || !idsStr) {
        console.error('Usage : node scripts/setDifficulty.mjs batch <moduleId> <1|2|3> <id1,id2,...>');
        process.exit(1);
      }
      const ids = idsStr.split(',').filter(Boolean);
      await batchSet(moduleId, Number(difficulty), ids);
      break;
    }
    default:
      await interactiveMode();
  }
}

main().catch((err) => {
  console.error('Erreur :', err.message);
  process.exit(1);
});
