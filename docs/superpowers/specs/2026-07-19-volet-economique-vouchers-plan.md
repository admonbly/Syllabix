# Plan d'implémentation — Volet économique Phase 0 (vouchers gratuits)

Réf. spec : `2026-07-19-volet-economique-vouchers-design.md`
Découpage en 3 lots. Commits par étape ; **push/deploy uniquement sur demande
explicite**. Règles Firestore : **ajout seulement**, diff contre la prod live avant
tout déploiement de règles. **Phase 0 = aucun paiement** (agrégateur = Phase 1,
cadrage séparé).

---

## Lot 1 — Fondations vouchers + création de lots (admin)

Objectif : le modèle voucher, la génération sécurisée, la redemption, et un moyen
admin de créer des lots — pour que des codes puissent exister et être testés.

**1.1 `lib/vouchers.js`** — génération de code haute entropie (format
`SYX-XXXX-XXXX`, alphabet sans ambiguïté 0/O/1/I), helpers de normalisation et de
validation de forme. Constantes (préfixe, longueur).

**1.2 Modèle de données** (Admin SDK uniquement) :
- `vouchers/{code}` : status, source, orgId, batchId, createdAt, createdBy,
  redeemedBy, redeemedAt, expiresAt.
- `voucherBatches/{batchId}` : orgId, source, count, redeemedCount, label,
  createdAt, createdBy.

**1.3 Règles Firestore (ADDITIF)** :
`match /vouchers/{code} { allow read, write: if false; }` +
`match /voucherBatches/{id} { allow read, write: if false; }`.
Diff obligatoire contre la prod avant déploiement.

**1.4 `POST /api/voucher/redeem`** — valide + consomme/réserve un code pour l'uid
courant, en **transaction** (anti-double-usage, anti-course). Rate-limit IP
(réutilise le pattern `rateLimits/…`). Ne révèle pas si un code existe (messages
neutres).

**1.5 Admin — création de lots** :
- `POST /api/admin/voucher/batch` (requirePlatformAdmin) : crée N vouchers
  `source:'partner_free'|'admin'` rattachés à une org, génère le batch.
- `GET /api/admin/voucher/list` : liste/suivi.
- UI back-office minimale (`/admin/vouchers`) : créer un lot pour une org, voir les
  lots et leur consommation, export CSV.

**Vérif Lot 1** : un admin crée un lot pour une org ; les codes sont uniques et non
devinables ; `redeem` accepte un code valide une seule fois et refuse un code
inconnu/déjà utilisé ; rate-limit actif.

---

## Lot 2 — Gating de la certification + validité 2 ans

Objectif : la certification n'est accessible qu'avec un code valide, et tout
certificat émis porte une expiration à 2 ans.

**2.1 Étape « saisir votre code »** avant le démarrage de la certification
(`/certification` ou l'écran de lancement). Appelle `/api/voucher/redeem`.

**2.2 Garde serveur** : l'API qui délivre la session d'examen
(`/api/exam/questions`) exige un code réservé/valide pour l'uid, non déjà brûlé sur
une session soumise. Le code est **consommé à la soumission** (`/api/exam/submit`),
réussite ou échec.

**2.3 Certificat** : `/api/exam/submit` pose `expiresAt = issuedAt + 2 ans` et
`voucherCode` sur le certificat (privé + copie publique).

**2.4 Affichage validité** : la page publique `/certificate/[id]` affiche la date
de validité et l'état **« expiré »** au-delà de 2 ans. Calcul à l'affichage si
`expiresAt` absent (certifs de démo antérieures).

**Vérif Lot 2** : impossible de lancer la certification sans code ; un code brûlé ne
relance pas ; le certificat affiche « valable jusqu'au … » ; un certificat daté de
plus de 2 ans s'affiche « expiré ».

---

## Lot 3 — Codes en libre-service (newsletter) + suivi org

Objectif : l'individu obtient un code seul via la newsletter ; l'org suit sa
consommation.

**3.1 Newsletter → code personnel** : à l'inscription newsletter, le serveur crée un
voucher `source:'newsletter'`, l'**affiche à l'écran** immédiatement, et l'**envoie
par email** (Resend ; l'affichage écran rend l'email non bloquant).

**3.2 Suivi côté organisation** : endpoint + bloc dans le dashboard `/org` —
vouchers **alloués / utilisés / restants**, et qui les a consommés (réutilise le
reporting org et le batptahage existants).

**Vérif Lot 3** : s'inscrire à la newsletter fournit un code utilisable
immédiatement (écran + email) ; l'org voit sa dotation et sa consommation à jour.

---

## Ordre & cadence

Lot 1 → 2 → 3. Commit par étape, vérif navigateur en fin de lot. **Aucun
push/deploy sans demande explicite.** Déploiement des règles Firestore : diff
obligatoire contre la prod, ajout seul.

## Hors de ce plan (Phase 1 — cadrage séparé)
Agrégateur **Jeko** (https://developer.jeko.africa ; Orange/MTN/Moov/Wave + carte) :
lots payants, paiement individuel, facturation/reçus, webhook de confirmation.
À cadrer dès réception de la clé API. Plus tard : examen de renouvellement allégé.
