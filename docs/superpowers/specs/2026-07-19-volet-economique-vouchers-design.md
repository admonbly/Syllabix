# Volet économique — Vouchers, codes & certification payante — Design

**Date :** 2026-07-19
**Stade :** POC / pilote assumé
**Réf. amont :** `2026-07-18-marketing-propagation-design.md` (moteur viral),
`2026-07-14-organisations-fondation-design.md` (organisations)

---

## 1. Principe directeur

On ne fait jamais payer ce qui alimente la viralité ; on fait payer **le résultat
qui a de la valeur**.

- **Gratuit (le carburant)** : défi, entraînement, évaluation de niveau, badges
  d'apprentissage.
- **Payant à terme (le péage)** : la **certification** — examen certifiant +
  **certificat vérifiable valable 2 ans** + badge de certification.

**Le mécanisme unique : la certification est débloquée par un CODE.** Le code peut
être gratuit (aujourd'hui) ou payant (plus tard). Seul le mode d'obtention change ;
le mécanisme de déblocage, lui, ne change pas → la bascule vers le payant est
indolore (rien à reconstruire).

**Stratégie retenue : B2B voucher-first**, avec une petite dotation de vouchers
**gratuits** offerte aux partenaires, et une certification individuelle **gratuite
via codes** au démarrage (revenu réel en Phase 1 avec l'agrégateur).

---

## 2. Le modèle « vouchers & codes »

### 2.1 Qu'est-ce qu'un voucher / code
Un **code** unique, saisissable à la main (ex. `SYX-XXXX-XXXX`, haute entropie),
qui **débloque UNE tentative de certification**. Si réussie → certificat valable
2 ans + badge de certification. Consommé à la **soumission** de l'examen (réussite
OU échec) ; une reprise nécessite un nouveau code. La tentative non soumise (souci
technique) ne consomme pas le code.

### 2.2 Sources de codes
1. **Individuel — code offert à l'inscription (200 premiers)** : à la création de
   compte, l'utilisateur reçoit **1 code gratuit**, mais **uniquement tant qu'un
   compteur global de codes offerts est < 200**. Au-delà de 200 → plus de code
   automatique. Le code s'**affiche dans son espace** (dashboard) ; il le **saisit
   manuellement** sur la page de certification. Effet « membres fondateurs » +
   urgence. *Remplace l'ancien mécanisme newsletter.*
2. **Partenaire — dotation gratuite** : chaque organisation reçoit un **petit lot
   de vouchers offerts** (ex. 10–20) pour un pilote (classe / équipe), via
   l'admin. *Aujourd'hui.*
3. **Codes promo / jeux-concours** : lots créés par l'admin et distribués via les
   campagnes marketing (tirage, concours…) après épuisement des 200. *Aujourd'hui.*
4. **Partenaire / individuel — lots payants** : achat via l'agrégateur.
   *Phase 1 — Jeko.*

### 2.3 Gating de la certification (décision : code obligatoire, saisie manuelle)
Avant de lancer la certification, l'apprenant **saisit un code**. Validation
**côté serveur** (Admin SDK, transaction anti-double-usage) : le code existe, est
`active` (non utilisé), non expiré. À la validation → le code passe `redeemed`
(lié à l'uid + horodatage) et l'examen peut démarrer.

Effet de bord assumé : léger frein au volume de certifiés, compensé par la rareté
maîtrisée des codes (200 offerts, puis promo/payant) et la préparation du modèle
payant.

### 2.4 Validité 2 ans + renouvellement
- Le certificat reçoit `expiresAt = issuedAt + 2 ans`.
- La page publique du certificat affiche la validité et l'état **« expiré »** au-delà.
- **Renouvellement** : après expiration, un **nouveau code** permet de repasser la
  certification. (Un examen de renouvellement allégé pourra venir plus tard — hors
  périmètre.)

### 2.5 Suivi côté organisation
Le **dashboard org** (déjà construit) affiche : vouchers **alloués / utilisés /
restants**, et qui les a consommés. Réutilise le reporting org existant.

---

## 3. Modèle de données (Firestore)

Écrit **exclusivement par l'Admin SDK** (API routes). Le client ne lit ni n'écrit
la collection `vouchers` (anti-énumération).

- `vouchers/{code}` :
  `{ code, status: 'active'|'redeemed'|'revoked', source:
  'signup_free'|'partner_free'|'promo'|'partner_paid'|'admin', orgId: string|null,
  batchId: string|null, createdAt, createdBy, redeemedBy: uid|null,
  redeemedAt: string|null, expiresAt: string|null }`
- `voucherBatches/{batchId}` :
  `{ orgId, source, count, redeemedCount, label, createdAt, createdBy }`
- `counters/foundingCodes` : `{ issued: number }` — compteur global des codes
  offerts à l'inscription ; l'attribution s'arrête à **200** (transaction).
- `certificates/{id}` (existant) : ajout de `expiresAt` et `voucherCode`.
- `users/{uid}` (existant) : ajout de `signupCodeIssued: bool` (1 code offert max
  par compte).

**Règles Firestore (ADDITIF seulement, jamais de remplacement) :**
```
match /vouchers/{code}      { allow read, write: if false; } // Admin SDK only
match /voucherBatches/{id}  { allow read, write: if false; } // Admin SDK only
```
Diff obligatoire contre la prod live avant déploiement des règles.

---

## 4. Sécurité

- **Codes haute entropie**, non devinables ; validation + consommation dans une
  **transaction** (anti-double-redeem, anti-course), sur le modèle de
  `/api/exam/submit`.
- **Rate-limit** sur la saisie de code (anti-brute-force), sur le modèle
  IP-Firestore existant (`rateLimits/…`).
- **Le lien code → tentative se vérifie côté serveur** : l'API qui délivre la
  session d'examen exige un code `redeemed` par cet uid et non déjà « brûlé » sur
  une session soumise.
- Aucune donnée de voucher exposée au client.

### 4.1 Anti-abus (résistance au farming de codes)
La rareté des codes règle l'essentiel : plus de robinet self-service infini, cadeau
**plafonné à 200**, puis codes uniquement via admin (promo/partenaire) ou payant.
La rareté protège aussi l'**intégrité du certificat** (on ne peut plus « mitrailler »
l'examen jusqu'à passer par chance). Ceinture de sécurité complémentaire :

- **1 code offert par compte** (`users/{uid}.signupCodeIssued`), jamais deux.
- **Compteur global des 200** en transaction : au-delà, plus d'attribution auto.
- **Email vérifié** exigé avant que le code offert soit utilisable.
- **Blocklist des domaines d'email jetables** (yopmail, mailinator, 10minutemail…).
- **Rate-limit par IP** à la création de compte / réclamation du code.
- **Limite de tentatives par compte** (défense en profondeur) : après un échec, un
  cooldown s'applique même avec un nouveau code (réutilise le cooldown 24 h existant,
  allongeable si abus constaté).
- **SMS en réserve** : vérification téléphone (l'app gère déjà l'auth téléphone),
  activée seulement si un abus réel est observé.

---

## 5. API & flux

**Phase 0 (buildable maintenant, sans agrégateur) :**
- `POST /api/voucher/redeem` — valide + réserve un code pour l'uid courant
  (transaction). Retourne l'autorisation de démarrer la certification.
- Code offert à l'inscription : à la création de compte, le serveur tente
  d'attribuer un code `source:'signup_free'` **en transaction** (compteur global
  < 200, `signupCodeIssued` false, email vérifié). Le code est affiché dans le
  dashboard de l'utilisateur.
- **Admin** : `POST /api/admin/voucher/batch` — crée un lot (free) pour une org ;
  `GET /api/admin/voucher/list` — suivi. UI back-office minimale.
- **Certification** : ajout d'une **étape « saisir votre code »** avant le démarrage.
  L'API `exam/questions` exige un code réservé/valide pour l'uid.
- **Org dashboard** : endpoint de stats vouchers (alloués/utilisés/restants).
- Certificat : pose `expiresAt` (+2 ans) et `voucherCode` à l'émission.

**Phase 1 (cadrage séparé — agrégateur Mobile Money) :**
- Achat de lots payants par les partenaires ; éventuel achat individuel.
- **Agrégateur retenu : Jeko** (https://developer.jeko.africa) — Orange Money, MTN
  Money, Moov Money, Wave et carte bancaire. API partenaire (`/partner_api/…`,
  ex. `/partner_api/stores`) ; guides Authentification (clés API) et Paiements ;
  index `llms.txt`. Intégration à cadrer **dès réception de la clé API**.
- Flux cible : init paiement → redirection/collecte → **webhook de confirmation**
  (vérif signature) → génération des vouchers payés. Facturation / reçus.

---

## 6. Périmètre

**Dans ce spec (Phase 0, à implémenter) :** modèle voucher/code, gating de la
certification par code obligatoire, sources gratuites (newsletter + dotation
partenaire), validité 2 ans, suivi org, back-office admin de création de lots,
règles Firestore additives, sécurité (transaction + rate-limit).

**Hors périmètre (Phase 1, cadrage séparé) :** agrégateur de paiement, lots payants,
paiement individuel, facturation, examen de renouvellement allégé.

---

## 7. Décisions verrouillées / dépendances

- **Distribution des codes gratuits (décidé)** : **plus de mécanisme newsletter**.
  Un **code offert à la création de compte** (1 par compte), plafonné aux **200
  premiers comptes** (compteur global). Au-delà, les codes gratuits passent par des
  **campagnes marketing / jeux-concours** (lots créés par l'admin). Ce choix règle
  à la fois le farming de codes ET l'intégrité du certificat (rareté des codes).
- **Politique de reprise (décidé)** : **1 code = 1 tentative** (réussite OU échec).
  Une reprise nécessite un nouveau code ; cooldown 24 h déjà en place. Une session
  non soumise (souci technique) ne consomme pas le code.
- **Validité & migration (décidé)** : **toutes les certifications ont une validité
  de 2 ans**, sans exception. Les certificats déjà émis sont des **données de démo**
  — aucun traitement particulier requis ; la règle des 2 ans s'applique
  uniformément (`expiresAt = issuedAt + 2 ans`, calculable à l'affichage).
- **Revenu Phase 0 = 0** (tout est gratuit) : ce spec construit la **machinerie** ;
  le revenu démarre en Phase 1.

---

## 8. Critères de succès (Phase 0)

- Un apprenant ne peut lancer la certification **que** muni d'un code valide.
- Les 200 premiers comptes reçoivent un code offert ; le 201ᵉ n'en reçoit pas.
- Un même compte ne peut obtenir qu'un seul code offert (anti-farming).
- Un admin crée un lot de vouchers gratuits/promo pour une org ; l'org voit la
  consommation dans son dashboard.
- Un certificat émis porte une **date d'expiration à 2 ans** et l'affiche
  publiquement.
- Aucun code n'est réutilisable ni devinable ; aucune règle Firestore existante
  n'est modifiée (ajout seul).
