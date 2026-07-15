/**
 * Création d'une organisation (école ou entreprise) — AJOUT UNIQUEMENT.
 * Idempotent : si une orga du même nom + type existe déjà, elle est réutilisée
 * (le code d'accès existant est réaffiché, jamais régénéré silencieusement).
 *
 * Usage :
 *   node scripts/seed-organization.mjs --name "Lycée Moderne de Cocody" --type SCHOOL --city Abidjan
 *   node scripts/seed-organization.mjs --name "Orange CI" --type COMPANY --promote <uid>
 *   node scripts/seed-organization.mjs --list
 *
 * Options :
 *   --name <nom>      Nom de l'organisation (requis sauf --list)
 *   --type <type>     SCHOOL | COMPANY (requis sauf --list)
 *   --city <ville>    Ville (optionnel)
 *   --promote <uid>   Promeut cet UID en ORG_ADMIN de l'orga et l'y rattache
 *   --list            Liste les organisations existantes et sort
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('../service-account.json', import.meta.url), 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

// ── Parsing des arguments ────────────────────────────────────────────
function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
const wantsList = process.argv.includes('--list');
const name = arg('--name');
const type = arg('--type');
const city = arg('--city') ?? null;
const promoteUid = arg('--promote');

const ORG_TYPES = ['SCHOOL', 'COMPANY'];

function generateAccessCode(orgName) {
  const slug = String(orgName || 'ORG')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-').filter(Boolean).slice(0, 3).join('-');
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${slug || 'ORG'}-${year}-${rand}`;
}

/** Garantit l'unicité du code (retente si collision). */
async function uniqueAccessCode(orgName) {
  for (let i = 0; i < 10; i++) {
    const code = generateAccessCode(orgName);
    const clash = await db.collection('organizations').where('accessCode', '==', code).limit(1).get();
    if (clash.empty) return code;
  }
  throw new Error('Impossible de générer un code unique après 10 tentatives');
}

// ── --list ───────────────────────────────────────────────────────────
if (wantsList) {
  const snap = await db.collection('organizations').orderBy('createdAt', 'desc').get();
  if (snap.empty) {
    console.log('Aucune organisation.');
  } else {
    console.log(`${snap.size} organisation(s) :\n`);
    snap.forEach((d) => {
      const o = d.data();
      console.log(`  ${o.name}`);
      console.log(`    type=${o.type}  code=${o.accessCode}  actif=${o.accessCodeActive}  membres=${o.memberCount ?? 0}`);
      console.log(`    id=${d.id}\n`);
    });
  }
  process.exit(0);
}

// ── Validation ───────────────────────────────────────────────────────
if (!name)                  { console.error('❌ --name est requis'); process.exit(1); }
if (!ORG_TYPES.includes(type)) { console.error(`❌ --type doit valoir ${ORG_TYPES.join(' ou ')}`); process.exit(1); }

// ── Création (ou réutilisation si déjà présente) ─────────────────────
const existing = await db.collection('organizations')
  .where('name', '==', name)
  .where('type', '==', type)
  .limit(1)
  .get();

let orgId, accessCode;

if (!existing.empty) {
  const doc = existing.docs[0];
  orgId = doc.id;
  accessCode = doc.data().accessCode;
  console.log(`ℹ️  Organisation déjà existante — réutilisée (aucune modification).`);
} else {
  accessCode = await uniqueAccessCode(name);
  const ref = db.collection('organizations').doc();
  orgId = ref.id;
  await ref.set({
    type,
    name,
    country: 'CI',
    city,
    accessCode,
    accessCodeActive: true,
    adminUids: [],
    memberCount: 0,
    createdAt: new Date().toISOString(),
    createdBy: 'seed-script',
  });
  console.log('✅ Organisation créée.');
}

console.log(`\n  Nom   : ${name}`);
console.log(`  Type  : ${type}`);
console.log(`  ID    : ${orgId}`);
console.log(`  CODE  : ${accessCode}   ← à communiquer aux membres\n`);

// ── Promotion optionnelle en ORG_ADMIN ───────────────────────────────
if (promoteUid) {
  const userRef = db.doc(`users/${promoteUid}`);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    console.error(`❌ Utilisateur ${promoteUid} introuvable — promotion annulée.`);
    process.exit(1);
  }

  const previousOrgId = userSnap.data().orgId ?? null;
  await userRef.set({
    role: 'ORG_ADMIN',
    orgId,
    orgType: type,
    orgJoinedAt: new Date().toISOString(),
  }, { merge: true });

  await db.doc(`organizations/${orgId}`).update({
    adminUids: [...new Set([...(existing.empty ? [] : existing.docs[0].data().adminUids ?? []), promoteUid])],
  });

  // Compteur : on n'incrémente que si l'utilisateur n'était pas déjà membre de cette orga
  if (previousOrgId !== orgId) {
    const { FieldValue } = await import('firebase-admin/firestore');
    await db.doc(`organizations/${orgId}`).update({ memberCount: FieldValue.increment(1) });
  }

  console.log(`✅ ${promoteUid} est maintenant ORG_ADMIN de « ${name} ».`);
  if (previousOrgId && previousOrgId !== orgId) {
    console.log(`⚠️  Cet utilisateur était rattaché à l'orga ${previousOrgId} — le rattachement a été remplacé.`);
  }
}

process.exit(0);
