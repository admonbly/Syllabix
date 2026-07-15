# Spec — Rendre le site vrai + refonte de l'accueil

**Date** : 2026-07-15
**Statut** : Design validé
**Déclencheur** : présentation imminente à des partenaires potentiels (ministères, universités, grandes écoles, entreprises) et ouverture au grand public. La plateforme est au stade POC.

---

## 1. Le problème (constat, pas opinion)

Le site affirme aujourd'hui des choses fausses. Inventaire établi le 2026-07-15 :

| Affirmation | Emplacement | Réalité |
|---|---|---|
| « 5000+ apprenants certifiés » | `components/Hero.jsx`, `app/page.jsx` | Inventé |
| « 98 % de satisfaction » | `components/Hero.jsx`, `app/page.jsx` | Inventé |
| « Durée max d'évaluation : 30 min » | `app/page.jsx` | Faux : l'évaluation dure **45 min** |
| « Plateforme leader en Afrique » | `components/Hero.jsx` | Superlatif invérifiable |
| 3 témoignages nommés (Amara Traoré, Samuel Adeyemi, Zainab Mohamed) | collection `testimonials` | **Personnes inventées** |
| Logos MENA, MESRS, Min. Numérique, Agence Emploi Jeunes sous « Partenaires Institutionnels » | `lib/partners.js` → accueil, `/partenariats`, **certificats** | **Aucun contact n'existe avec ces organismes** |
| « Reconnue par les ministères partenaires », « reconnaissance officielle » | `/partenariats`, `lib/i18n.js` | Aucune reconnaissance |

Le point le plus grave n'est pas les chiffres : c'est l'**affirmation d'une caution officielle inexistante**, avec des emblèmes d'État utilisés sans autorisation, jusque **sur les certificats délivrés aux utilisateurs**. Présenter cette page au MENA ou au MESRS reviendrait à leur montrer leur propre logo utilisé sans leur accord — ce qui détruirait le partenariat recherché.

**Décision** : tout ce qui est faux disparaît avant la moindre présentation.

---

## 2. Décisions validées

1. **Un seul lot** : nettoyage de vérité **et** refonte de l'accueil, pour présenter sur une base saine.
2. **Posture pilote assumée** : le site dit qu'il est en lancement et invite à rejoindre les premiers certifiés / à devenir établissement pilote. Aucun chiffre d'usage.
3. **Apprenant d'abord** (stratégie Pix) : pas d'entrée dédiée aux organisations. Écoles, universités, grandes écoles et entreprises sont un **canal de croissance de la communauté de certifiés**, présent en une section discrète.
4. **`/partenariats` devient « Devenir partenaire »** : la page explique ce qu'on gagne à rejoindre et propose un formulaire, au lieu d'exhiber des partenaires inexistants.
5. **Certificat** : identité Syllabix seule + mention du référentiel couvert.
6. **Formulaire partenaire dédié**, stocké en base et consultable dans le back-office.

---

## 3. Ce qui disparaît

- `lib/partners.js` : les 4 partenaires institutionnels sont retirés de l'affichage. **Les fichiers logos restent dans `/public`** — ils seront réactivables le jour où un partenariat est signé.
- Les mentions « reconnu par les ministères partenaires », « reconnaissance officielle », « certification officielle » → reformulées en « certificat Syllabix », « épreuve certifiante ».
- `bigStats` (`app/page.jsx`) et `heroStats` (`components/Hero.jsx`) : chiffres d'usage supprimés.
- Badge « Plateforme leader en Afrique » → badge factuel.
- Les 3 témoignages fictifs : supprimés de la collection `testimonials` **et** de `lib/testimonialsSeed.js` (sinon le fallback les réaffiche).
- La section « Témoignages » de l'accueil disparaît tant qu'il n'existe aucun témoignage réel. Le back-office `/admin/temoignages` permettra d'en ajouter de vrais plus tard : la section réapparaîtra automatiquement quand la collection sera non vide.

> **Note** : les certificats sont rendus dynamiquement (pas d'image stockée). Retirer les logos du code corrige donc **rétroactivement** tous les certificats déjà émis.

---

## 4. Ce qui remplace la preuve

Aucun chiffre d'usage. On montre **ce que la plateforme fait**, vérifiable dans le produit :

- **7 modules → 5 domaines / 16 compétences** du référentiel Pix / CRCN (source : `lib/pixMapping.js`)
- **Épreuves pratiques** : téléchargement d'un vrai fichier (Excel, Word, e-mail piégé…), manipulation, réponse vérifiée
- **Certification exigeante** : 1h45, 32 questions, notation serveur infalsifiable (score calculé par valeur, anti-rejeu)
- **Espace établissement / entreprise** : suivi par classe ou direction, reporting par compétence

Les seuls « chiffres » affichés sont **structurels** (7 modules, 5 domaines, 16 compétences, 1h45), pas des métriques d'usage. Ils sont vrais par construction.

---

## 5. Structure de l'accueil

| # | Section | État |
|---|---|---|
| 1 | **Hero** — « Certifiez vos compétences numériques » + badge factuel + CTA gratuit | Modifié (stats retirées) |
| 2 | **Le référentiel** — 5 domaines / 16 compétences | **Nouveau** |
| 3 | **Les 7 modules** | Conservé |
| 4 | **Comment ça marche** | Conservé |
| 5 | **Les épreuves pratiques** — le différenciateur, aujourd'hui invisible | **Nouveau** |
| 6 | **Bandeau pilote** — « Votre école, université ou entreprise peut rejoindre le programme pilote » → Devenir partenaire | **Nouveau**, discret, en bas |
| 7 | **Blog** | Conservé |
| — | ~~Témoignages~~ | Retiré (réapparaît si témoignages réels) |

Le bandeau pilote est **une seule section discrète** : les organisations sont un canal, pas la cible principale de la page.

---

## 6. Page « Devenir partenaire » (`/partenariats`)

Contenu : ce qu'une organisation gagne à rejoindre — code d'accès pour ses membres, dashboard de suivi par classe/direction, reporting par compétence aligné sur le référentiel.

**Formulaire** :
- Type d'organisation : école / université / grande école / entreprise / autre
- Nom de l'organisation, nom du contact, e-mail, téléphone (optionnel), message

**Stockage** : collection `partnershipRequests` — écriture **exclusivement Admin SDK** via `POST /api/partnership/request` (le client ne peut pas écrire directement), lecture interdite au client. Règle Firestore à **AJOUTER** (jamais écraser l'existant).

**Back-office** : onglet `/admin/partenaires` — liste des demandes + export CSV, même mécanique que la newsletter, garde `PLATFORM_ADMIN_UIDS`.

**Anti-abus** : le formulaire est public (une organisation n'a pas de compte). Validation stricte des champs côté serveur + limite de taille. Pas de captcha à ce stade.

---

## 7. Le certificat

- Logos ministériels retirés (`PARTNERS_ON_CERTIFICATE` devient vide).
- Identité Syllabix conservée : bande kente, panneau bleu nuit, anneau de progression, QR de vérification, signature.
- **Ajout** : mention du référentiel couvert (5 domaines / 16 compétences) — le certificat dit ce qui a été évalué plutôt que qui le cautionne.

---

## 8. Hors périmètre

- Refonte visuelle profonde (le design actuel convient)
- Nouveaux modules, tarification, page « À propos »
- Captcha / anti-spam avancé sur le formulaire
- Traduction de nouveaux contenus au-delà du FR/EN existant
- Réintégration de partenaires (se fera quand un accord sera signé)

---

## 9. Critères de validation

1. **Zéro occurrence** de `MENA`, `MESRS`, `Agence Emploi Jeunes`, `ministere_numerique` dans le rendu du site et des certificats.
2. **Zéro occurrence** de « reconnu par les ministères », « reconnaissance officielle », « 5000 », « 98 % », « leader en Afrique » — vérifié dans le code **et en production**.
3. Collection `testimonials` vide de personnes inventées ; section témoignages absente de l'accueil ; `lib/testimonialsSeed.js` ne les réintroduit pas.
4. Durée d'évaluation affichée = **45 min** (cohérente avec `lib/examService.js`).
5. Certificat : aucun logo ministériel, mention du référentiel présente, QR et vérification toujours fonctionnels.
6. Accueil : sections référentiel et épreuves pratiques présentes ; bandeau pilote menant à `/partenariats`.
7. Formulaire partenaire : enregistre en base, visible dans `/admin/partenaires`, export CSV correct (BOM UTF-8) ; écriture client directe en Firestore **refusée** par les règles.
8. Non-régression : inscription, connexion, certification, dashboard organisation, rattachement par code, back-office.
9. Vérifié **en production** après déploiement.
