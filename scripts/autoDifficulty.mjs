/**
 * autoDifficulty.mjs — Assigne automatiquement une difficulté (1/2/3) à
 * chaque question Firestore en analysant le texte de la question.
 *
 * Usage :
 *   node scripts/autoDifficulty.mjs           → dry-run (affiche sans écrire)
 *   node scripts/autoDifficulty.mjs --apply   → applique les changements
 *   node scripts/autoDifficulty.mjs --module 0 --apply  → un seul module
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }        from 'fs';
import { resolve, dirname }    from 'path';
import { fileURLToPath }       from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Init Firebase Admin ──────────────────────────────────────────────────────
try {
  const saPath = resolve(__dirname, '../service-account.json');
  const sa = JSON.parse(readFileSync(saPath, 'utf8'));
  initializeApp({ credential: cert(sa) });
} catch {
  initializeApp();
}

const db = getFirestore();

// ── Règles de classification ─────────────────────────────────────────────────

/**
 * Mots-clés qui orientent vers un niveau donné.
 * Les tableaux sont ordonnés du plus discriminant au moins discriminant.
 */
const RULES = {
  // Niveau 3 — concepts avancés, menaces, protocoles, scénarios complexes
  level3: [
    // Cybersécurité avancée
    /phishing|hameçonnage|ransomware|malware|spyware|keylogger|ddos|injection sql|xss|brute.?force/i,
    /chiffrement|cryptage|ssl|tls|https|certificat numérique|2fa|mfa|authentification.?deux/i,
    /firewall|pare.?feu|vpn|proxy|dmz|protocole réseau|tcp.?ip|dns|dhcp|ftp|smtp|imap/i,
    // IA avancée
    /prompt.?engineering|hallucination|biais algorithmique|llm|gpt|transformer|fine.?tuning|rag/i,
    /données.?entraînement|modèle.?langage|réseau.?neurone|apprentissage.?machine|deep learning/i,
    // Bureautique avancée
    /macro|vba|formule.?complexe|tableau.?croisé.?dynamique|vlookup|recherchev|index.?equiv/i,
    /publipostage|styles.?avancés|modèle.?document|protection.?classeur|validation.?données/i,
    // Internet avancé
    /référencement|seo|algorithme.?(google|recherche)|pagerank|métadonnées|balise|robots\.txt/i,
    // Employabilité avancée
    /personal.?branding|elevator.?pitch|networking.?stratégique|kpi|okr|management/i,
    // Général complexe
    /quelle.*(différence|distinction).*(entre|et).*(?:et|ou)/i,
    /dans quel cas|en situation de|scénario|que se passe.?t.?il si|conséquence|risque/i,
    /pourquoi.*(est.?il important|faut.?il|doit.?on)|comment fonctionne/i,
  ],

  // Niveau 2 — application, procédures, bonnes pratiques
  level2: [
    /comment (créer|envoyer|configurer|activer|désactiver|modifier|paramétrer|installer|utiliser|accéder|partager|sauvegarder|télécharger|imprimer|insérer|formater|trier|filtrer)/i,
    /quelle.*(bonne pratique|méthode|étape|procédure|manière|façon)/i,
    /pour (créer|envoyer|configurer|activer|modifier|paramétrer|partager|sauvegarder|insérer)/i,
    /quel (raccourci|paramètre|réglage|bouton|menu|outil|format|type de)/i,
    /laquelle.*(option|action|méthode|réponse).*(correcte|recommandée|appropriée)/i,
    /que (faire|doit.?on|faut.?il) (si|lorsque|quand|pour|avant|après)/i,
    /dans (quel ordre|quelle étape|quel onglet|quel menu)/i,
    /avantage|inconvénient|bénéfice|utilité de|rôle de/i,
    /comment (éviter|prévenir|protéger|sécuriser|reconnaître|identifier|détecter)/i,
    /quel est (le moyen|la façon|le meilleur|l.?objectif|l.?avantage)/i,
  ],

  // Niveau 1 — définitions, reconnaissance, questions basiques
  level1: [
    /qu.?(est.?ce qu.?|est) (un|une|le|la|l.?) /i,
    /que signifie|que veut dire|définition de|définir/i,
    /quel est (le nom|le terme|le mot|la définition|le sigle|l.?acronyme)/i,
    /parmi (les|ces|les choix), (quel|lequel|laquelle).*(est|désigne|représente|correspond)/i,
    /à quoi sert|quel est le rôle de|quelle est la fonction de/i,
    /lequel.*(est|n.?est pas).*(un|une|le|la) (type|exemple|outil|logiciel|navigateur|application)/i,
    /quel (est|sont) (le|les|un|des) (principal|exemple|type|logiciel|outil|navigateur)/i,
    /vrai ou faux|est.?il vrai|correct ou incorrect/i,
    /combien de|en quelle année|depuis quand|qui a créé|qui a inventé/i,
  ],
};

// ── Scoring ──────────────────────────────────────────────────────────────────

function scoreLine(text, patterns) {
  let score = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) score++;
  }
  return score;
}

function classifyQuestion(question = '', options = [], explanation = '') {
  const fullText = [question, ...options, explanation].join(' ');

  const s3 = scoreLine(fullText, RULES.level3);
  const s2 = scoreLine(fullText, RULES.level2);
  const s1 = scoreLine(fullText, RULES.level1);

  // Longueur de la question comme signal secondaire
  const wordCount = question.trim().split(/\s+/).length;
  const lengthBonus = wordCount > 20 ? 1 : 0; // questions longues → plus dur

  // Règles de décision
  if (s3 >= 1) return 3;
  if (s2 >= 2) return 3; // beaucoup d'indices d'application = assez avancé
  if (s2 >= 1) return 2;
  if (s1 >= 1) return 1;

  // Fallback sur la longueur
  if (wordCount > 25 + lengthBonus) return 2;
  return 1;
}

// ── Affichage ────────────────────────────────────────────────────────────────
const DIFF_LABEL = { 1: '🟢 Facile', 2: '🟡 Intermédiaire', 3: '🔴 Avancé' };
const DIFF_COLOR = { 1: '\x1b[32m', 2: '\x1b[33m', 3: '\x1b[31m' };
const RESET = '\x1b[0m';

function truncate(str = '', n = 90) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = !args.includes('--apply');
const moduleFilter = (() => {
  const idx = args.indexOf('--module');
  return idx !== -1 ? String(args[idx + 1]) : null;
})();

async function run() {
  console.log(`\n🤖 autoDifficulty — ${DRY_RUN ? 'DRY-RUN (aucune écriture)' : '⚡ APPLY MODE'}\n`);

  const modulesRef = db.collection('modules');
  const modulesSnap = moduleFilter
    ? await modulesRef.doc(moduleFilter).get().then((d) => ({ docs: d.exists ? [d] : [] }))
    : await modulesRef.get();

  if (!modulesSnap.docs.length) {
    console.log('Aucun module trouvé.');
    return;
  }

  let totalUpdated = 0;
  let totalUnchanged = 0;
  const distribution = { 1: 0, 2: 0, 3: 0 };

  for (const moduleDoc of modulesSnap.docs) {
    const qSnap = await moduleDoc.ref.collection('questions').get();
    if (qSnap.empty) continue;

    console.log(`\n📦 Module ${moduleDoc.id} — ${qSnap.size} questions`);
    console.log('─'.repeat(110));

    const batch = db.batch();
    let moduleUpdated = 0;

    for (const qDoc of qSnap.docs) {
      const data = qDoc.data();
      const questionText = data.question ?? data.text ?? '';
      const options = data.options ?? data.choices ?? [];
      const explanation = data.explanation ?? data.explication ?? '';

      const newDiff = classifyQuestion(questionText, options, explanation);
      const oldDiff = data.difficulty ?? 1;
      const changed = newDiff !== oldDiff;

      distribution[newDiff]++;

      const color = DIFF_COLOR[newDiff];
      const changeTag = changed ? ` \x1b[36m(était ${oldDiff}→${newDiff})\x1b[0m` : '';
      console.log(
        `  ${color}${DIFF_LABEL[newDiff].padEnd(20)}${RESET}` +
        `${qDoc.id.slice(0, 20).padEnd(22)}` +
        `${truncate(questionText)}` +
        changeTag
      );

      if (!DRY_RUN && changed) {
        batch.update(qDoc.ref, { difficulty: newDiff });
        moduleUpdated++;
      }
    }

    if (!DRY_RUN && moduleUpdated > 0) {
      await batch.commit();
      console.log(`  → ${moduleUpdated} questions mises à jour`);
      totalUpdated += moduleUpdated;
    } else if (!DRY_RUN) {
      console.log(`  → Aucun changement`);
    }

    totalUnchanged += qSnap.size - moduleUpdated;
  }

  console.log('\n' + '═'.repeat(110));
  console.log('📊 Distribution finale :');
  console.log(`   🟢 Facile        : ${distribution[1]} questions`);
  console.log(`   🟡 Intermédiaire : ${distribution[2]} questions`);
  console.log(`   🔴 Avancé        : ${distribution[3]} questions`);

  if (!DRY_RUN) {
    console.log(`\n✅ ${totalUpdated} questions mises à jour, ${totalUnchanged} inchangées.`);
  } else {
    console.log(`\n💡 Mode dry-run — relance avec --apply pour appliquer ces changements.`);
  }
}

run().catch((err) => {
  console.error('Erreur :', err.message);
  process.exit(1);
});
