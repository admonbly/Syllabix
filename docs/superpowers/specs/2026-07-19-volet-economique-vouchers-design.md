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

### 2.2 Trois sources de codes
1. **Individuel — newsletter** : l'inscription à la newsletter déclenche l'envoi
   d'un **code personnel gratuit** par email **ET l'affiche directement à l'écran**
   juste après l'inscription (double livraison, robuste même si l'email tarde ou
   échoue). L'utilisateur le **saisit manuellement** sur la page de certification.
   *Aujourd'hui.*
2. **Partenaire — dotation gratuite** : chaque organisation reçoit un **petit lot
   de vouchers offerts** (ex. 10–20) pour un pilote (classe / équipe). *Aujourd'hui.*
3. **Partenaire — lots payants** : l'organisation **achète** des lots
   supplémentaires (Mobile Money). *Phase 1 — agrégateur.*

### 2.3 Gating de la certification (décision : code obligatoire, saisie manuelle)
Avant de lancer la certification, l'apprenant **saisit un code**. Validation
**côté serveur** (Admin SDK, transaction anti-double-usage) : le code existe, est
`active` (non utilisé), non expiré. À la validation → le code passe `redeemed`
(lié à l'uid + horodatage) et l'examen peut démarrer.

Effet de bord assumé : léger frein au volume de certifiés, compensé par la capture
d'email (newsletter) et la préparation du modèle payant.

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
  'newsletter'|'partner_free'|'partner_paid'|'admin', orgId: string|null,
  batchId: string|null, createdAt, createdBy, redeemedBy: uid|null,
  redeemedAt: string|null, expiresAt: string|null }`
- `voucherBatches/{batchId}` :
  `{ orgId, source, count, redeemedCount, label, createdAt, createdBy }`
- `certificates/{id}` (existant) : ajout de `expiresAt` et `voucherCode`.

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

---

## 5. API & flux

**Phase 0 (buildable maintenant, sans agrégateur) :**
- `POST /api/voucher/redeem` — valide + réserve un code pour l'uid courant
  (transaction). Retourne l'autorisation de démarrer la certification.
- Génération newsletter : à l'inscription, le serveur crée un code
  `source:'newsletter'` et l'envoie par email (Resend — dépend de la vérification
  du domaine, cf. §7).
- **Admin** : `POST /api/admin/voucher/batch` — crée un lot (free) pour une org ;
  `GET /api/admin/voucher/list` — suivi. UI back-office minimale.
- **Certification** : ajout d'une **étape « saisir votre code »** avant le démarrage.
  L'API `exam/questions` exige un code réservé/valide pour l'uid.
- **Org dashboard** : endpoint de stats vouchers (alloués/utilisés/restants).
- Certificat : pose `expiresAt` (+2 ans) et `voucherCode` à l'émission.

**Phase 1 (cadrage séparé — agrégateur Mobile Money) :**
- Achat de lots payants par les partenaires ; éventuel achat individuel.
- Agrégateur : **CinetPay / PayDunya / Paystack / Flutterwave** (pas Stripe en CI).
- Facturation / reçus. Webhook de confirmation → génération des vouchers payés.

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

- **Livraison des codes newsletter (décidé)** : **double livraison** — par email
  (Resend) **et** affichage à l'écran juste après l'inscription. L'affichage écran
  garantit le code même si l'email tarde/échoue ; l'envoi email dépend de la
  vérification du domaine Resend (déjà signalée) mais **n'est plus bloquant**.
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
- L'inscription newsletter délivre un code utilisable.
- Un admin crée un lot de vouchers gratuits pour une org ; l'org voit la
  consommation dans son dashboard.
- Un certificat émis porte une **date d'expiration à 2 ans** et l'affiche
  publiquement.
- Aucun code n'est réutilisable ni devinable ; aucune règle Firestore existante
  n'est modifiée (ajout seul).
