# Spec — Dashboard Organisation (écoles & entreprises)

**Date** : 2026-07-15
**Statut** : Design validé
**Sous-projet** : 2 — fusionne les anciens sous-projets 2 (dashboard écoles) et 3 (dashboard entreprises + reporting compétences).
**Prérequis livré** : [Fondation Organisations](./2026-07-14-organisations-fondation-design.md) (commits `1f6d0ee`, `4ecccfc`, déployée).

---

## 1. Contexte & décision de fusion

Les besoins « école » et « entreprise » demandent le **même écran** : liste des membres rattachés, progression par module, niveau par compétence, qui décroche. Les différences sont le **vocabulaire** (élèves/employés) et l'**accent** (progression dans le temps vs écarts de compétences à combler).

**Décision** : un **dashboard unique adaptatif** piloté par `org.type`, plutôt que deux écrans jumeaux qui divergeraient. Les deux publics sont servis d'un coup, reporting Pix inclus.

### Décisions produit validées

1. **Un seul dashboard adaptatif** (`/org`), vocabulaire selon `org.type`.
2. **Détail individuel nominatif** : l'organisation voit nom, email, scores, certificats. Légitime — le membre a consenti en saisissant le code, et peut partir à tout moment (coupure nette).
3. **Export CSV** des membres et de leurs résultats.
4. **Consultation seule** : l'`ORG_ADMIN` ne peut ni ajouter ni retirer un membre. Seul l'apprenant décide de rejoindre ou de quitter. Cohérent avec la fondation.

---

## 2. Données disponibles (vérifiées en base)

| Source | Contenu | Usage |
|---|---|---|
| `users/{uid}` | firstName, lastName, displayName, email, createdAt, **badges[]** | Identité + scores par module |
| `users/{uid}.badges[]` | `{ moduleId, moduleName, score, earnedAt }` | Modules validés + scores, **sans requête supplémentaire** |
| `certificates/{certId}` | `{ userId, moduleId, examType, score, issuedAt }` | Certifications (le champ `userId` permet une requête groupée) |
| `users/{uid}/progress/{moduleId}` | `{ moduleId, score, completedAt }` | Détail (fiche membre uniquement) |

### Limite assumée
Les **échecs ne sont pas tracés côté serveur** : seuls les modules réussis créent un badge/progress. Le dashboard affiche donc « validé » vs « pas encore validé », **jamais** « a échoué N fois ». Tracer les tentatives serait un lot séparé.

---

## 3. Performance (contrainte forte : 100+ membres sans lag)

L'approche naïve (1 requête membres + 1 requête progression par membre) ferait ~101 requêtes. Rejetée.

**Approche retenue** — environ **5 requêtes pour 100 membres**, sans dénormalisation ni migration :

1. `users where orgId == X` → 1 requête. Fournit identité **et** `badges[]` (donc les scores par module).
2. `certificates where userId in [chunk]` → lots de 30 (limite Firestore `in`), soit `ceil(N/30)` requêtes (4 pour 100 membres).
3. Les agrégats (moyennes, couverture Pix) sont **calculés en mémoire** côté serveur, pas en base.

La fiche membre détaillée charge à la demande la progression de **ce seul utilisateur** (2 requêtes), jamais pour toute la liste.

**Garde-fou** : si une organisation dépasse `MAX_MEMBERS_PER_PAGE` (200), la liste est paginée. Au-delà, on réévaluera une dénormalisation.

---

## 4. Contenu de l'écran `/org`

### Bloc 1 — Vue d'ensemble
- Nombre de membres rattachés
- Taux de certification (membres ayant ≥ 1 certificat / total)
- Score moyen de l'organisation
- Membres actifs (ayant validé un module dans les 30 derniers jours)

### Bloc 2 — Couverture par compétence (le cœur de la valeur)
Les **5 domaines Pix** avec le niveau moyen de l'organisation, calculé en remontant les scores des modules via `lib/pixMapping.js` (`getModulesForDomain`). Détail dépliable par compétence (16).

Lecture visée : *« mes équipes sont faibles en Protection & sécurité »* → on sait quoi former.

### Bloc 3 — Liste des membres
Colonnes : nom, email, modules validés (x/7), score moyen, dernière activité.
Tri par défaut : dernière activité décroissante. Recherche par nom/email.
Clic → **fiche membre** : scores par module, certificats obtenus, badges, dates.

### Bandeau
Nom de l'organisation, type, et **le code d'accès à diffuser** (avec bouton copier) — c'est l'action principale d'un ORG_ADMIN qui veut recruter ses membres.

### Vocabulaire adaptatif
| | SCHOOL | COMPANY |
|---|---|---|
| Membres | élèves | employés |
| Entité | établissement | société |
| Accent | progression | niveau & écarts à combler |

---

## 5. API

| Route | Rôle |
|---|---|
| `GET /api/org/dashboard` | Agrégats + liste des membres (ORG_ADMIN de l'orga uniquement) |
| `GET /api/org/member/[uid]` | Fiche détaillée d'UN membre (vérifie qu'il est bien de l'orga) |

### Sécurité (règle centrale)
Les deux routes vérifient, **côté serveur** :
1. l'utilisateur est authentifié ;
2. son `role === 'ORG_ADMIN'` ;
3. son `orgId` correspond à l'organisation demandée **et** son uid est dans `org.adminUids`.

L'orgId n'est **jamais** pris depuis la requête : il est lu depuis le profil serveur de l'appelant. Un ORG_ADMIN ne peut donc pas lire les données d'une autre organisation, même en forgeant la requête.

`GET /api/org/member/[uid]` refuse (404) si le membre visé n'a pas le même `orgId` que l'appelant — un ORG_ADMIN ne peut pas piocher un utilisateur au hasard.

Aucune règle Firestore à modifier : tout passe par l'Admin SDK.

---

## 6. Export CSV

Bouton dans le bloc « membres ». Colonnes : nom, email, modules validés, score moyen, certifications, dernière activité. Généré côté client depuis les données déjà chargées (même mécanique que l'export newsletter), avec BOM UTF-8 pour Excel.

---

## 7. Périmètre — ce qui N'EST PAS dans ce lot

- Retrait d'un membre par l'organisation (consultation seule assumée)
- Traçage des échecs / nombre de tentatives
- Invitations automatiques par email ou SMS
- Comparaison entre organisations, classements
- Graphiques d'évolution temporelle (courbes) — on reste sur des indicateurs et des barres
- Dénormalisation des scores (inutile à l'échelle visée)

---

## 8. Critères de validation

1. Un `ORG_ADMIN` voit le dashboard de **son** organisation.
2. Un `LEARNER` rattaché est redirigé (pas d'accès).
3. Un `ORG_ADMIN` ne peut **pas** lire les données d'une **autre** organisation (test de forge).
4. `GET /api/org/member/[uid]` refuse un uid hors de l'organisation.
5. Les agrégats sont justes (vérifiés sur un jeu de données seedé connu).
6. La couverture Pix couvre les 5 domaines et remonte correctement les scores modules.
7. Le vocabulaire s'adapte (SCHOOL → élèves, COMPANY → employés).
8. Export CSV correct (accents lisibles dans Excel).
9. Charge : 100 membres rendus sans lag, ~5 requêtes Firestore.
10. Non-régression : `/dashboard` apprenant, rattachement/détachement, back-office admin inchangés.
