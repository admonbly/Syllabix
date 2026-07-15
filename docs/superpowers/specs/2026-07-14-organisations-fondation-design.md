# Spec — Écoles & Entreprises : Fondation « Organisations »

**Date** : 2026-07-14
**Statut** : Design validé (en attente de relecture avant plan d'implémentation)
**Sous-projet** : 1/3 — Fondation. (2) Dashboard écoles, (3) Dashboard entreprises + reporting compétences viendront ensuite, chacun avec son propre spec.

---

## 1. Contexte & objectif

Syllabix passe d'un produit purement B2C (apprenants individuels) à une brique B2B2C : les **écoles** peuvent recommander la certification et suivre leurs élèves ; les **entreprises** peuvent tester leurs employés, connaître leur niveau et les accompagner. Chaque entité aura à terme un tableau de bord de suivi.

Ce sous-projet livre **uniquement la fondation** : le modèle de données « organisation », le rattachement et le détachement d'un utilisateur par code d'accès, et le rôle `ORG_ADMIN`. Aucun dashboard visuel n'est livré ici (sous-projets 2 & 3).

### Règles produit (contraintes fortes, validées avec l'utilisateur)

1. **Inscription 100 % libre par défaut.** N'importe qui s'inscrit seul, sans code. Le code n'est jamais une barrière à l'entrée.
2. **Rattachement optionnel, à l'initiative de l'utilisateur.** L'orga communique son code à ses membres ; renseigner le code = autoriser l'orga à voir ses données. Pas de code → compte perso invisible pour toute orga.
3. **Pas de rattachement par domaine email** (les écoles africaines n'ont pas d'email étudiant). Le code d'accès est le seul mécanisme.
4. **Détachement en libre-service.** L'utilisateur peut quitter son école/entreprise via un bouton dans son profil, à tout moment.
5. **Coupure nette au départ.** Dès le détachement, l'orga ne voit plus rien de cet utilisateur — ni historique, ni progression future.

---

## 2. Modèle de données (Firestore)

### 2.1 Nouvelle collection `organizations/{orgId}`

```
organizations/{orgId}
  type            : 'SCHOOL' | 'COMPANY'
  name            : string          // "Lycée Moderne de Cocody"
  country         : string          // 'CI' par défaut
  city            : string | null
  accessCode      : string          // unique, ex. "LYCEE-COCODY-2026"
  accessCodeActive: boolean          // révoquer sans supprimer l'orga
  adminUids       : string[]         // qui verra le dashboard (sous-projets 2/3)
  memberCount     : number           // maintenu par le serveur (transaction)
  createdAt       : timestamp
  createdBy       : string           // uid admin ou 'seed-script'
```

- `accessCode` est **unique** (vérifié à la création). Format libre mais lisible/partageable par WhatsApp.
- `accessCodeActive: false` empêche tout nouveau rattachement sans casser les rattachements existants.

### 2.2 Champs ajoutés à `users/{uid}`

```
orgId       : string | null   // null = apprenant grand public
orgType     : 'SCHOOL' | 'COMPANY' | null   // dénormalisé pour l'affichage
orgJoinedAt : timestamp | null
role        : peut désormais valoir 'ORG_ADMIN' (en plus de LEARNER / PROFESSIONAL)
```

> **Modèle mono-rattachement** : un utilisateur appartient à **une** organisation à la fois (une école OU une entreprise). Rejoindre une nouvelle orga alors qu'on en a déjà une est refusé tant qu'on n'a pas quitté la première. (Le multi-rattachement est hors périmètre ; à réévaluer si un besoin réel émerge.)

### 2.3 Index

- Index simple sur `users.orgId` (nécessaire pour lister les membres d'une orga de façon scalable — cible 100+ membres sans lag). À ajouter dans `firestore.indexes.json`.

---

## 3. Sécurité (le cœur du sous-projet)

**Principe** : comme pour `role`, `badges`, `certificates` aujourd'hui, le client **ne peut jamais** écrire lui-même son `orgId`. Sinon n'importe qui se déclarerait membre de n'importe quelle orga (faux rattachements) et accéderait à des dashboards.

### 3.1 Règles Firestore (à AJOUTER, ne pas écraser l'existant)

- `organizations/{orgId}` : `allow read: if false` côté client (les infos orga transitent par les API routes). `allow write: if false` (Admin SDK uniquement).
- `users/{uid}` update : durcir la règle existante pour que `orgId`, `orgType`, `orgJoinedAt` soient **non modifiables par le client** (mêmes garde-fous que `role` et `badges`).

### 3.2 Toutes les écritures passent par l'Admin SDK

Aucune écriture de rattachement côté client. Trois API routes authentifiées :

| Route | Rôle |
|---|---|
| `POST /api/org/join` | Valide un code, rattache l'utilisateur (transaction) |
| `POST /api/org/leave` | Détache l'utilisateur en libre-service (transaction) |
| `GET  /api/org/me` | Renvoie l'orga courante de l'utilisateur (nom, type) pour l'affichage |

---

## 4. Flux fonctionnels

### 4.1 Rejoindre une organisation (`POST /api/org/join`)

Entrée : `{ code }` + auth (session cookie / idToken).

1. Authentifier l'utilisateur (Admin SDK `verifyIdToken` / session existante).
2. Chercher l'orga par `accessCode == code` **et** `accessCodeActive == true`.
   - Introuvable / inactif → `404` « Code invalide ou expiré ».
3. Si l'utilisateur a déjà un `orgId` → `409` « Vous appartenez déjà à une organisation. Quittez-la d'abord. »
4. Transaction Firestore :
   - `users/{uid}` ← `{ orgId, orgType: org.type, orgJoinedAt: now }`
   - `organizations/{orgId}.memberCount` ← incrément +1
5. Réponse `200 { orgName, orgType }`.

Points de saisie du code :
- **À l'inscription** : champ facultatif « Code établissement/entreprise (optionnel) ». S'il est rempli et valide, on appelle `/api/org/join` juste après la création du compte. S'il est invalide, le compte est **quand même créé** (le rattachement échoue en douceur avec un message, il pourra réessayer depuis son profil).
- **Depuis le dashboard/profil** : bouton « Rejoindre mon établissement » → modale de saisie du code.

### 4.2 Quitter une organisation (`POST /api/org/leave`)

Entrée : auth uniquement.

1. Authentifier.
2. Si pas d'`orgId` → `400` « Vous n'appartenez à aucune organisation ».
3. Transaction :
   - `users/{uid}` ← `{ orgId: null, orgType: null, orgJoinedAt: null }`
   - `organizations/{orgId}.memberCount` ← décrément −1 (borné à 0)
4. Réponse `200`.

**Coupure nette** : aucune donnée n'est copiée/figée. Les dashboards (sous-projets 2/3) liront `users where orgId == X` ; un partant disparaît donc mécaniquement de toutes les vues de l'orga, historique compris. Rien à purger.

### 4.3 Rôle ORG_ADMIN

- Attribué **par l'admin** (script de seed / Admin SDK) au moment où une école/entreprise signe. Jamais auto-attribuable (la règle Firestore interdit déjà au client de changer son `role`).
- Un `ORG_ADMIN` est un utilisateur normal + accès futur à `/org/**`.
- `middleware.ts` : protéger `/org/**` → exiger `role == 'ORG_ADMIN'` et un `orgId` présent. (La route dashboard elle-même est livrée aux sous-projets 2/3 ; on pose juste la protection.)

---

## 5. Création & administration des organisations

Deux outils, tous deux appuyés sur l'Admin SDK :

### 5.1 Script d'admin (outil de test / seed)
`scripts/seed-organization.mjs` (Admin SDK), idempotent : crée une orga, génère un `accessCode` unique, et optionnellement promeut un uid en `ORG_ADMIN`. Sert aussi de harnais de validation (critères §8).

### 5.2 Interface admin web minimale `/admin/organizations`
Page réservée à l'admin plateforme :
- **Créer** une orga (nom, type SCHOOL/COMPANY, ville) → `accessCode` généré automatiquement.
- **Lister** les orgas avec leur `memberCount`, et **activer/désactiver** le code (`accessCodeActive`).
- **Promouvoir** un utilisateur (recherché par email) en `ORG_ADMIN` d'une orga.

Hors périmètre même avec l'UI : édition avancée, suppression d'orga, analytics.

### 5.3 Sécurité de l'admin plateforme
Rôle admin plateforme **non auto-attribuable** : liste blanche d'UID dans la variable d'env `PLATFORM_ADMIN_UIDS` (séparés par des virgules), vérifiée **côté serveur** dans chaque API route admin. Aucune donnée Firestore ne permet à un client de se déclarer admin.

API routes dédiées (Admin SDK + garde `PLATFORM_ADMIN_UIDS`) :

| Route | Rôle |
|---|---|
| `POST /api/admin/org/create` | Créer une orga + code |
| `GET  /api/admin/org/list` | Lister orgas + memberCount |
| `POST /api/admin/org/toggle-code` | Activer/désactiver un code |
| `POST /api/admin/org/promote` | Promouvoir un email en ORG_ADMIN |

`middleware.ts` protège aussi `/admin/**` (UID dans la liste blanche requis).

### 5.4 Administration de contenu (même socle admin)

Le back-office réutilise exactement la garde `PLATFORM_ADMIN_UIDS` + Admin SDK. Trois zones de contenu éditables **sans toucher au code** :

**A. Blog `/admin/blog`** — les articles sont **déjà** dans Firestore (`articles/{articleId}`, règle : lecture publique, écriture client interdite). On ajoute juste l'éditeur :
- Lister (titre, date, statut publié/brouillon)
- Créer / éditer (titre, contenu, image [chemin/URL], catégorie, statut)
- Publier / dépublier (jamais de suppression dans ce lot)
- Écriture via `/api/admin/blog/*` (Admin SDK). Règles Firestore blog inchangées (client ne peut pas écrire).

**B. Newsletter `/admin/newsletter`** — collection `newsletter` déjà existante :
- Lister les abonnés + date d'inscription
- **Export CSV**
- Lecture seule (pas d'ajout/suppression manuelle dans ce lot). Via `/api/admin/newsletter/list` (Admin SDK).

**C. Témoignages `/admin/temoignages`** — actuellement **en dur** dans `app/page.jsx`. On les **migre vers Firestore** (`testimonials/{id}` : `{ name, role, quoteFr, quoteEn, avatar, order, published }`) + éditeur CRUD. L'accueil lit désormais Firestore (avec fallback code si vide, pour ne pas casser l'affichage). Via `/api/admin/testimonials/*`.

**Images** : pour ce lot, l'admin saisit un **chemin/URL d'image** (fichiers déposés dans `/public`). Pas d'upload de fichier — viendra dans un lot ultérieur.

### 5.5 Partenaires — changement minimal et sûr (PAS de migration)

Les partenaires restent **en code** (`lib/partners.js`) dans ce lot — ils alimentent les **certificats** (fonctionnalité critique qui marche déjà) et sont quasi-figés (ministères).

Seule évolution, sûre : ajout d'un drapeau **`showOnCertificate: boolean`** sur chaque partenaire.
- Le **site** (/partenariats, accueil) affiche **tous** les partenaires.
- Le **certificat** ne rend que ceux `showOnCertificate === true`.

C'est un simple filtre côté certificat, sans base de données, sans risque. La migration Firestore + édition web des partenaires (avec fallback code pour le certificat) est renvoyée à un lot dédié.

---

## 6. Alignement compétences (préparation données uniquement)

Ajout de `lib/pixMapping.js` : table reliant les 7 modules Syllabix aux **5 domaines / 16 compétences du référentiel Pix** (Information & données, Communication & collaboration, Création de contenu, Protection & sécurité, Environnement numérique), avec un libellé adapté au contexte ivoirien. **Rien n'est affiché dans ce sous-projet** — c'est la fondation de données pour le reporting « type CRÉ » des dashboards à venir. S'appuie sur l'existant `lib/moduleCompetencies.js`.

---

## 7. Périmètre — ce qui N'EST PAS dans ce sous-projet

- Dashboard visuel écoles (sous-projet 2)
- Dashboard visuel entreprises + reporting par compétence (sous-projet 3)
- Édition avancée / suppression d'orga, analytics dans l'UI admin
- Multi-rattachement (un user dans plusieurs orgas)
- Invitations par email / SMS automatiques
- Détachement avec conservation d'historique figé (explicitement écarté : coupure nette)
- **Migration des partenaires en Firestore + édition web** (lot dédié ; ici on ajoute seulement le drapeau `showOnCertificate` en code)
- **Upload de fichiers images** dans l'admin (on saisit un chemin/URL pour l'instant)
- Suppression d'articles/témoignages (on publie/dépublie, pas de suppression dans ce lot)

---

## 8. Critères de validation (definition of done)

1. Un compte grand public s'inscrit **sans** code, comme aujourd'hui (non-régression).
2. Script de seed : je crée une orga de test + un code, et je promeus un uid en `ORG_ADMIN`.
2b. Interface `/admin/organizations` (protégée par `PLATFORM_ADMIN_UIDS`) : créer une orga, lister avec memberCount, activer/désactiver un code, promouvoir un email en `ORG_ADMIN`. Accès refusé si l'UID n'est pas dans la liste blanche.
3. Un utilisateur saisit le code (à l'inscription **et** depuis le profil) → `orgId` s'écrit **côté serveur**, `memberCount` s'incrémente.
4. Tentative de forge côté client (écrire `orgId` directement en Firestore) → **refusée** par les règles.
5. Code invalide/inactif → message clair, compte non bloqué.
6. Utilisateur déjà rattaché qui saisit un 2e code → refus explicite.
7. Bouton « Quitter » → `orgId` repasse à `null`, `memberCount` décrémente.
8. `middleware.ts` bloque `/org/**` pour un non-`ORG_ADMIN`.
9. `lib/pixMapping.js` existe et couvre les 7 modules → 16 compétences Pix.
10. `/admin/blog` : je crée un article, le publie → il apparaît sur le blog public ; je le dépublie → il disparaît. Écriture client toujours refusée par les règles.
11. `/admin/newsletter` : liste des abonnés visible + export CSV fonctionnel.
12. `/admin/temoignages` : témoignages migrés en Firestore, éditables ; l'accueil les affiche (fallback code si la collection est vide).
13. Partenaires : drapeau `showOnCertificate` en place — tous sur le site, seuls les marqués sur le certificat. Certificat non cassé.
14. Toutes les routes `/admin/**` refusées si l'UID n'est pas dans `PLATFORM_ADMIN_UIDS`.
15. Non-régression : login, session 3h, examen/certification, page /partenariats inchangés.
