# Plan d'implémentation — Marketing & propagation (moteur viral)

Réf. spec : `2026-07-18-marketing-propagation-design.md`
Découpage en 3 lots livrables indépendamment. Commits par étape ; **push/deploy
uniquement sur demande explicite du fondateur**. Règles Firestore : **ajout
seulement, jamais de remplacement** ; diff contre la prod avant tout déploiement de
règles.

État actuel constaté (baseline) :
- Badges : ajoutés à `users/{uid}.badges[]` **uniquement pour la certif module**
  (`api/exam/submit`), forme `{moduleId, moduleName, score, earnedAt}` — **pas de
  champ `level`**. La certif globale ne pose pas de badge ; l'entraînement ne
  persiste rien (`SAVE_RESULTS:false`).
- Certificats : `users/{uid}/certificates/{id}` + copie publique `certificates/{id}`.
- `BadgeGrid.jsx` lit `badges[]` par `moduleId`.
- Entraînement : `EXAM_CONFIG.TRAINING` = 5 q. dans `lib/examService.js`.

---

## Lot A — Fondations badges (socle, sans rien casser)

Objectif : introduire les **3 niveaux de badges** et le **badge d'apprentissage**,
passer l'entraînement à **10 q / 15 min**, afficher les couleurs partout. Aucune
régression sur les badges existants.

**A1. Modèle de badge — champ `level`**
- Ajouter `level` aux badges : `'learning' | 'module' | 'global'`.
- Rétro-compatibilité : un badge sans `level` est traité comme `'module'` (les
  badges déjà en base restent valides).
- Fichier util nouveau `lib/badges.js` : constantes `BADGE_LEVELS`, couleurs par
  niveau, helper `badgeLevelOf(badge)` (défaut `'module'`), libellés FR/EN.

**A2. `lib/examService.js` — entraînement 10 q / 15 min**
- `TRAINING.QUESTIONS_COUNT: 5 → 10`, `SESSION_SIZE: 5 → 10`, `DURATION: null → 900`.
- Vérifier que la banque de questions par module compte ≥10 items ; sinon capper au
  disponible (pas d'erreur si module plus court).

**A3. Attribution du badge d'apprentissage**
- L'entraînement doit pouvoir **persister un badge `learning`** quand l'apprenant
  réussit (seuil à définir, ex. ≥60 %). Deux options d'implémentation à trancher au
  moment du code : (a) un endpoint léger `POST /api/training/badge` protégé, ou
  (b) étendre le flux existant. Choix par défaut : **endpoint dédié** pour ne pas
  mélanger avec la certif (`api/exam/submit` reste la certif).
- Badge `learning` : `{ moduleId, moduleName, score, earnedAt, level:'learning' }`.
- Règle anti-doublon : au plus un badge d'apprentissage par module (on garde le
  meilleur score).

**A4. Certif globale — poser aussi un badge `global`** (cohérence 3 niveaux)
- Dans `api/exam/submit`, quand `moduleId === null` et `passed`, ajouter un badge
  `{ moduleId:null, moduleName:'Certification globale', score, earnedAt, level:'global' }`.
- Le badge module existant reçoit explicitement `level:'module'`.

**A5. Affichage — `BadgeGrid` + profil + dashboard apprenant**
- `BadgeGrid` : couleur/bordure selon `level` (bronze/orange/bleu). Distinguer
  visuellement apprentissage vs certif.
- Profil et dashboard apprenant : afficher les badges d'apprentissage (séparés ou
  tagués), sans casser l'affichage actuel.

**A6. Règles Firestore (ajout seulement)**
- `badges` est déjà dans la whitelist `validUserProfile` — vérifier que la forme
  avec `level` passe (pas de contrainte de forme stricte sur les éléments du
  tableau ; sinon élargir en ADDITIF).
- Si endpoint dédié via Admin SDK : pas de nouvelle règle client nécessaire.
- **Dashboard organisation : NON modifié** (reporting certification only).

**A7. Vérif Lot A** : entraînement 10q/15min jouable ; badge d'apprentissage posé et
affiché avec sa couleur ; badges de certif existants intacts ; globale pose un badge.

---

## Lot B — Défi public (entrée sans friction)

Objectif : rendre l'entraînement jouable **sans compte**, avec **auth anonyme**,
**écran de résultat partageable**, et **conservation de l'historique** au moment de
la création de compte.

**B1. Auth anonyme**
- Activer `signInAnonymously` (Firebase) à l'entrée du défi si pas de session.
- Vérifier que le provider anonyme est activé côté console Firebase (à confirmer
  avec le fondateur).

**B2. Route défi publique**
- Nouvelle page `/(marketing)/defi` (ou `/defi/[moduleId]`) hors `middleware`
  protégé — accessible sans cookie de session.
- Réutilise le moteur de quiz d'entraînement (mêmes questions), pas de nouveau
  contenu.

**B3. Persistance de la tentative en anonyme**
- Enregistrer la tentative/score sous l'uid anonyme (Firestore).
- Règles Firestore : autoriser l'écriture de SA PROPRE tentative pour un utilisateur
  anonyme, sans ouvrir de faille (chemin `users/{uid}/...` avec `request.auth.uid ==
  uid`). Ajout seulement.

**B4. Écran de résultat partageable**
- Score + comparaison (« mieux que X % » — X calculable plus tard, valeur honnête ou
  masquée tant que non mesurée).
- CTA principal : **« Crée ton compte gratuit pour garder ton badge »**.
- CTA secondaire discret : recevoir par email (newsletter).

**B5. Linking anonyme → compte**
- À la création de compte depuis le défi : `linkWithCredential` (email/Google/
  téléphone) sur la session anonyme → uid conservé → badge/historique préservés.
- Gérer le cas « email déjà utilisé » : bascule vers connexion, en préservant au
  mieux la tentative.

**B6. Vérif Lot B** : défi jouable sans compte ; résultat affiché ; création de
compte conserve le badge (même uid) ; aucun impact sur les comptes existants.

---

## Lot C — Couche virale (partage + Open Badges)

Objectif : rendre badges et certificats **publics, beaux et partageables**.

**C1. Pages publiques**
- Badge : page publique `/b/[code]` (ou réutiliser `/certificate/[id]` en public).
- Consultable **sans compte**, mention « Vérifié ✓ », lien vers le défi (boucle).
- Ne pas exposer de données personnelles au-delà du nom + module + score + date.

**C2. Images Open Graph dynamiques**
- Génération d'image OG (Next.js `ImageResponse` / route `opengraph-image`) : carte
  avec nom, module/certif, score, marque Syllabix.
- Balises meta OG + Twitter sur les pages publiques badge/certif.

**C3. Boutons de partage**
- WhatsApp, LinkedIn (« Ajouter à mon profil » via URL), Facebook, copier le lien.
- Composant réutilisable `components/ShareButtons.jsx`.

**C4. Compatibilité Open Badges**
- Exposer une assertion Open Badges (JSON) minimale par badge (récipiendaire,
  critère, émetteur, vérification). Format standard 1EdTech.
- Documenter l'URL d'assertion ; pas de dépendance externe payante.

**C5. Vérif Lot C** : un lien de badge collé sur WhatsApp/LinkedIn affiche la carte
d'aperçu ; page publique consultable sans compte ; assertion Open Badges servie.

---

## Ordre & cadence

A → B → C (chaque lot livrable seul). Commit par étape. Vérif navigateur en fin de
lot. **Aucun push/deploy sans demande explicite.** Aucune métrique inventée exposée.

## Hors de ce plan (rappel)
Agrégateur de paiement (cadrage séparé, en attente doc), augmentation questions au-
delà de 10, production des assets marketing (deck, one-pager, dossier institutionnel).
