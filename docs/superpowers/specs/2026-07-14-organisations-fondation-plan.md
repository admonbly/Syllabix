# Plan d'implémentation — Fondation Organisations

**Spec de référence** : [2026-07-14-organisations-fondation-design.md](./2026-07-14-organisations-fondation-design.md)
**Branche** : `feat/orgs-fondation`

Le plan est ordonné pour que chaque étape soit **livrable et testable** avant la suivante. On construit le socle sécurité en premier, puis les organisations, puis le back-office contenu.

---

## Étape 0 — Socle sécurité admin plateforme

**But** : pouvoir dire « cet UID est admin plateforme » de façon non falsifiable, réutilisé partout ensuite.

- `.env.local` + Vercel : nouvelle variable `PLATFORM_ADMIN_UIDS` (UIDs séparés par virgules).
- `lib/adminAuth.js` (nouveau, server-only) : `requirePlatformAdmin(request)` → vérifie session/idToken via Admin SDK, puis que l'uid ∈ `PLATFORM_ADMIN_UIDS`. Renvoie l'uid ou lève `401/403`.
- `middleware.ts` : ajouter la protection `/admin/**` (présence session ; le contrôle fin liste blanche se fait dans les API routes, le middleware n'a pas accès à l'env admin de façon fiable → il bloque juste les non-connectés et laisse la page cliente appeler une API `/api/admin/me`).
- `GET /api/admin/me` : renvoie `{ isPlatformAdmin: bool }` pour que l'UI `/admin` s'affiche ou redirige.

**Test** : appeler `/api/admin/me` connecté (admin → true, non-admin → false), non connecté → 401.

---

## Étape 1 — Modèle Organisations (données + règles)

**Fichiers** :
- `firestore.rules` : **AJOUTER** (ne pas écraser) le bloc `organizations/{orgId}` (`read/write: if false` côté client) et **durcir** la règle `update` de `users/{userId}` pour rendre `orgId`, `orgType`, `orgJoinedAt` non modifiables par le client (même schéma que `role`/`badges`).
- `firestore.indexes.json` : index simple sur `users.orgId`.
- `lib/orgs.js` (nouveau, partagé) : constantes `ORG_TYPES = ['SCHOOL','COMPANY']`, helper `generateAccessCode(name)` (slug + année + suffixe aléatoire court), validation.

**Test** : déployer les règles en mode test ; vérifier qu'un client ne peut pas écrire `organizations` ni se mettre un `orgId`.

---

## Étape 2 — Rattachement / détachement (API + règles déjà posées)

**Fichiers (API routes, Admin SDK)** :
- `app/api/org/join/route.js` : `{ code }` → cherche orga par `accessCode` actif → refus si déjà rattaché (409) → transaction (écrit `orgId/orgType/orgJoinedAt` + `memberCount +1`).
- `app/api/org/leave/route.js` : transaction inverse (`memberCount -1` borné à 0).
- `app/api/org/me/route.js` : renvoie `{ orgId, orgName, orgType }` de l'utilisateur courant.

**Test** : seed manuel d'une orga (voir étape 5), puis join avec bon code / mauvais code / déjà rattaché ; leave ; vérifier `memberCount`.

---

## Étape 3 — Intégration UI apprenant (inscription + profil)

**Fichiers** :
- `app/auth/signup/page.jsx` : champ facultatif « Code établissement/entreprise (optionnel) ». Après `signUp`, si code rempli → appel `/api/org/join` ; échec = message doux, compte conservé.
- Dashboard/profil (`app/dashboard/…` ou composant profil) : encart « Mon établissement » →
  - si rattaché : nom de l'orga + bouton **« Quitter »** (→ `/api/org/leave`, avec confirmation).
  - si non rattaché : bouton **« Rejoindre mon établissement »** → modale de saisie du code (→ `/api/org/join`).
- i18n : clés FR/EN correspondantes dans `lib/i18n.js`.

**Test** : inscription sans code (non-régression) ; inscription avec code ; rejoindre puis quitter depuis le profil.

---

## Étape 4 — Rôle ORG_ADMIN + protection /org

- `middleware.ts` : protéger `/org/**` (connecté + `role == 'ORG_ADMIN'`). La page dashboard elle-même = sous-projets 2/3 ; on pose juste la garde + une page placeholder `/org` (« Tableau de bord bientôt disponible »).

**Test** : un `ORG_ADMIN` (promu via étape 5) accède à `/org` ; un LEARNER est redirigé.

---

## Étape 5 — Script d'admin (seed + harnais de test)

- `scripts/seed-organization.mjs` (Admin SDK, idempotent) : crée une orga (type, nom, ville) → code unique ; option `--promote <uid>` pour mettre `role: ORG_ADMIN` + `orgId`.
- Documente l'usage en tête de fichier.

**Test** : exécuter → orga créée, code affiché, uid promu. C'est l'outil qui débloque le test des étapes 2–4.

---

## Étape 6 — Back-office admin : Organisations

- `app/admin/layout.jsx` : garde cliente (appelle `/api/admin/me`, redirige si non-admin) + navigation onglets (Organisations, Blog, Newsletter, Témoignages).
- `app/admin/organizations/page.jsx` : liste (nom, type, code, `memberCount`, actif) + formulaire création + toggle code + promotion par email.
- API : `POST /api/admin/org/create`, `GET /api/admin/org/list`, `POST /api/admin/org/toggle-code`, `POST /api/admin/org/promote` (toutes gardées par `requirePlatformAdmin`).

**Test** : créer une orga via l'UI, désactiver le code (join refusé), promouvoir un email.

---

## Étape 7 — Back-office admin : Blog

- `app/admin/blog/page.jsx` : liste articles (titre, date, statut) + éditeur (titre, contenu, image [chemin/URL], catégorie, statut publié/brouillon) + publier/dépublier.
- API : `GET /api/admin/blog/list`, `POST /api/admin/blog/upsert`, `POST /api/admin/blog/toggle-publish` (Admin SDK).
- Vérifier que le blog public (`app/blog`) filtre sur `status == 'published'` (adapter si besoin).

**Test** : créer + publier un article → visible sur /blog ; dépublier → masqué.

---

## Étape 8 — Back-office admin : Newsletter

- `app/admin/newsletter/page.jsx` : liste des abonnés + bouton **Export CSV** (génération côté client à partir des données servies).
- API : `GET /api/admin/newsletter/list` (Admin SDK, lecture seule).

**Test** : abonnés visibles, CSV téléchargeable et correct.

---

## Étape 9 — Back-office admin : Témoignages (avec migration)

- Migration : `scripts/seed-testimonials.mjs` — importe les témoignages actuels de `app/page.jsx` vers `testimonials/{id}` (`name, role, quoteFr, quoteEn, avatar, order, published`).
- `app/page.jsx` : lit `testimonials` depuis Firestore ; **fallback** sur la liste en dur si la collection est vide (pas de régression d'affichage).
- `app/admin/temoignages/page.jsx` : CRUD (créer, éditer, ordre, publier/dépublier).
- API : `GET /api/admin/testimonials/list`, `POST /api/admin/testimonials/upsert`, `POST /api/admin/testimonials/toggle-publish`.
- `firestore.rules` : AJOUTER `testimonials` (lecture publique, écriture client interdite).

**Test** : accueil affiche les témoignages depuis la base ; édition via admin se reflète ; collection vide → fallback code.

---

## Étape 10 — Partenaires : drapeau showOnCertificate

- `lib/partners.js` : ajouter `showOnCertificate: boolean` sur chaque partenaire (true pour les ministères actuels).
- `app/certificate/[id]/page.jsx` : filtrer les partenaires rendus sur `showOnCertificate === true`.
- Page /partenariats + accueil : inchangés (affichent tout).

**Test** : certificat n'affiche que les partenaires marqués ; /partenariats affiche tout ; certificat non cassé.

---

## Étape 11 — Alignement compétences (données)

- `lib/pixMapping.js` : table 7 modules Syllabix → 5 domaines / 16 compétences Pix, libellés adaptés au contexte ivoirien. Rien d'affiché.

**Test** : import du module OK, couverture des 7 modules vérifiée.

---

## Étape 12 — Validation globale + non-régression

Reprendre les critères §8 du spec :
- Inscription sans code (non-régression), avec code, join/leave, forge client refusée, code invalide/inactif, double rattachement refusé, `/org` et `/admin` gardés, blog/newsletter/témoignages fonctionnels, `showOnCertificate` OK, pixMapping présent.
- Non-régression : login, session 3h, examen/certification, /partenariats.
- Build Next.js + test scalabilité léger (liste membres/abonnés sur volume).

---

## Récap des nouveaux fichiers

| Type | Fichiers |
|---|---|
| Lib | `lib/adminAuth.js`, `lib/orgs.js`, `lib/pixMapping.js` |
| API org | `app/api/org/{join,leave,me}/route.js` |
| API admin | `app/api/admin/me/route.js`, `app/api/admin/org/{create,list,toggle-code,promote}/route.js`, `app/api/admin/blog/{list,upsert,toggle-publish}/route.js`, `app/api/admin/newsletter/list/route.js`, `app/api/admin/testimonials/{list,upsert,toggle-publish}/route.js` |
| Admin UI | `app/admin/layout.jsx`, `app/admin/{organizations,blog,newsletter,temoignages}/page.jsx` |
| Org UI | `app/org/page.jsx` (placeholder) |
| Scripts | `scripts/seed-organization.mjs`, `scripts/seed-testimonials.mjs` |
| Modifiés | `firestore.rules`, `firestore.indexes.json`, `middleware.ts`, `app/auth/signup/page.jsx`, dashboard/profil, `app/page.jsx`, `lib/partners.js`, `app/certificate/[id]/page.jsx`, `lib/i18n.js`, `app/blog/*` |
