/**
 * Membres de DÉMONSTRATION rattachés à une organisation — pour tester le
 * tableau de bord organisation avec des données réalistes.
 *
 * ⚠️ Données de test uniquement. Tous les comptes créés portent le domaine
 * @syllabix-demo.local et sont supprimables d'un coup avec --clean.
 *
 * Usage :
 *   node scripts/seed-org-demo-members.mjs --org <orgId> [--count 12]
 *   node scripts/seed-org-demo-members.mjs --org <orgId> --admin <uid>   (nomme un ORG_ADMIN)
 *   node scripts/seed-org-demo-members.mjs --clean                        (supprime tous les comptes démo)
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('../service-account.json', import.meta.url), 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();
const auth = getAuth();

const DEMO_DOMAIN = '@syllabix-demo.local';
const MODULE_NAMES = ['IT & Ordinateur', 'Internet', 'Email', 'Bureautique', 'Cybersécurité', 'Intelligence Artificielle', 'Employabilité'];

const arg = (f) => { const i = process.argv.indexOf(f); return i !== -1 ? process.argv[i + 1] : undefined; };

// ── --clean ──────────────────────────────────────────────────────────
if (process.argv.includes('--clean')) {
  let removed = 0;
  let pageToken;
  do {
    const list = await auth.listUsers(1000, pageToken);
    for (const u of list.users) {
      if (!u.email?.endsWith(DEMO_DOMAIN)) continue;
      // Sous-collections + certificats publics
      for (const sub of ['progress', 'certificates']) {
        const s = await db.collection(`users/${u.uid}/${sub}`).get();
        await Promise.all(s.docs.map((d) => d.ref.delete()));
      }
      const pub = await db.collection('certificates').where('userId', '==', u.uid).get();
      await Promise.all(pub.docs.map((d) => d.ref.delete()));
      await db.doc(`users/${u.uid}`).delete().catch(() => {});
      await auth.deleteUser(u.uid);
      removed++;
    }
    pageToken = list.pageToken;
  } while (pageToken);

  // Recalage des compteurs
  const orgs = await db.collection('organizations').get();
  for (const o of orgs.docs) {
    const n = (await db.collection('users').where('orgId', '==', o.id).get()).size;
    await o.ref.update({ memberCount: n });
  }
  console.log(`✅ ${removed} compte(s) de démo supprimé(s), compteurs recalés.`);
  process.exit(0);
}

// ── Validation ───────────────────────────────────────────────────────
const orgId = arg('--org');
const count = Number(arg('--count') ?? 12);
const promoteUid = arg('--admin');

if (!orgId) { console.error('❌ --org <orgId> est requis (voir: node scripts/seed-organization.mjs --list)'); process.exit(1); }
const orgSnap = await db.doc(`organizations/${orgId}`).get();
if (!orgSnap.exists) { console.error('❌ Organisation introuvable'); process.exit(1); }
const org = orgSnap.data();

// ── Promotion d'un ORG_ADMIN ─────────────────────────────────────────
if (promoteUid) {
  const uSnap = await db.doc(`users/${promoteUid}`).get();
  if (!uSnap.exists) { console.error(`❌ Utilisateur ${promoteUid} introuvable`); process.exit(1); }
  const had = uSnap.data().orgId === orgId;
  await db.doc(`users/${promoteUid}`).set({
    role: 'ORG_ADMIN', orgId, orgType: org.type, orgJoinedAt: new Date().toISOString(),
  }, { merge: true });
  await orgSnap.ref.update({ adminUids: FieldValue.arrayUnion(promoteUid) });
  if (!had) await orgSnap.ref.update({ memberCount: FieldValue.increment(1) });
  console.log(`✅ ${promoteUid} est ORG_ADMIN de « ${org.name} »\n`);
}

// ── Génération des membres ───────────────────────────────────────────
const PRENOMS = ['Aminata','Kouassi','Fatou','Yao','Adjoua','Ibrahim','Mariam','Koffi','Awa','Seydou','Rokia','Bakary','Nadège','Moussa','Clarisse','Zié','Salimata','Drissa','Affoué','Souleymane'];
const NOMS = ['Traoré','Koné','Diallo','Ouattara','Bamba','Cissé','Sanogo','Yao','Kouamé','Touré','Doumbia','Silué','Coulibaly','Kouadio','Fofana','Diomandé'];

const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

let created = 0;
for (let i = 0; i < count; i++) {
  const firstName = rnd(PRENOMS);
  const lastName = rnd(NOMS);
  const email = `${firstName}.${lastName}.${i}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + DEMO_DOMAIN;

  let uid;
  try { uid = (await auth.getUserByEmail(email)).uid; }
  catch { uid = (await auth.createUser({ email, password: 'Demo-Passw0rd!', displayName: `${firstName} ${lastName}` })).uid; }

  // Profil hétérogène : certains n'ont rien validé, d'autres presque tout.
  const nbModules = Math.floor(Math.random() * 8); // 0..7
  const moduleIds = [...Array(7).keys()].sort(() => Math.random() - 0.5).slice(0, nbModules);
  const badges = moduleIds.map((m) => ({
    moduleId: m,
    moduleName: MODULE_NAMES[m],
    score: 60 + Math.floor(Math.random() * 41), // 60..100 (un badge = module réussi)
    earnedAt: daysAgo(Math.floor(Math.random() * 90)),
  }));

  await db.doc(`users/${uid}`).set({
    email, firstName, lastName, displayName: `${firstName} ${lastName}`,
    role: 'LEARNER', authProvider: 'password',
    orgId, orgType: org.type, orgJoinedAt: daysAgo(Math.floor(Math.random() * 120)),
    badges,
    createdAt: daysAgo(Math.floor(Math.random() * 150)),
  }, { merge: true });

  // Progression miroir des badges
  for (const b of badges) {
    await db.doc(`users/${uid}/progress/${b.moduleId}`).set({
      moduleId: String(b.moduleId), score: b.score, completedAt: b.earnedAt,
    });
  }

  // Certificat de module pour les meilleurs scores, + certificat global si ≥5 modules
  for (const b of badges.filter((x) => x.score >= 80)) {
    const ref = db.collection('certificates').doc();
    const data = { displayName: `${firstName} ${lastName}`, moduleId: b.moduleId, examType: 'MODULE', score: b.score, issuedAt: b.earnedAt, userId: uid, createdAt: b.earnedAt };
    await ref.set(data);
    await db.doc(`users/${uid}/certificates/${ref.id}`).set(data);
  }
  if (badges.length >= 5) {
    const ref = db.collection('certificates').doc();
    const score = Math.round(badges.reduce((a, b) => a + b.score, 0) / badges.length);
    const data = { displayName: `${firstName} ${lastName}`, moduleId: null, examType: 'GLOBAL', score, issuedAt: daysAgo(Math.floor(Math.random() * 30)), userId: uid, createdAt: daysAgo(1) };
    await ref.set(data);
    await db.doc(`users/${uid}/certificates/${ref.id}`).set(data);
  }

  console.log(`  ✅ ${firstName} ${lastName} — ${nbModules} module(s) validé(s)`);
  created++;
}

// Recalage du compteur
const total = (await db.collection('users').where('orgId', '==', orgId).get()).size;
await orgSnap.ref.update({ memberCount: total });

console.log(`\n${created} membre(s) de démo créés dans « ${org.name} ». Total membres : ${total}`);
console.log(`Nettoyage : node scripts/seed-org-demo-members.mjs --clean`);
process.exit(0);
