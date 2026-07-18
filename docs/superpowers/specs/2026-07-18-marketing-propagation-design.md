# Stratégie go-to-market & propagation de Syllabix — Design

**Date :** 2026-07-18
**Stade :** POC / pilote assumé
**Auteur :** cadrage collaboratif (fondateur + assistant)

---

## 1. Contexte et contrainte fondatrice

Syllabix est une plateforme EdTech de certification des compétences numériques,
au stade **pilote**. Le fondateur est **seul** sur le projet, **sans réseau
ouvert** (écoles/entreprises/institutions), avec un **petit budget** mobilisable
en publicité ciblée.

**Contrainte rouge, non négociable (cf. mémoire `site-verite-poc`) :** posture
pilote assumée, **ne rien affirmer sans preuve**. Aucune caution institutionnelle,
aucun chiffre d'usage, aucun logo partenaire n'apparaît tant qu'il n'est pas
**réel et documenté**. Cette honnêteté est un atout stratégique, pas une faiblesse :
les institutions sérieuses se méfient du bluff et valorisent les co-constructeurs.

**Objectif :** obtenir les premiers partenariats et une première reconnaissance
institutionnelle, via une approche virale et impactante, sans se ruiner ni
s'épuiser.

---

## 2. Principe directeur : la cascade

Les 4 cibles ne se travaillent **pas en parallèle**. Elles s'enchaînent : chaque
étage fabrique la preuve qui arme l'étage suivant.

```
Utilisateurs libres (apprenants)      →  la BASE : carburant viral + preuve sociale
        ↓  (nombre réel, badges partagés, histoires, liste email)
Écoles / universités + Entreprises    →  pilotes qui amènent des cohortes
        ↓  (pilotes mesurés, avant/après chiffré, témoignages)
Reconnaissance institutionnelle       →  se décroche SUR la preuve, jamais sur promesse
```

Règle : **on n'approche jamais personne les mains vides.** C'est ce qui dispense
d'avoir un réseau au départ.

**Beachhead géographique : Abidjan.** On concentre tout sur Abidjan au démarrage
pour créer une densité qui rend le bouche-à-oreille possible. Élargissement
seulement une fois la boucle amorcée.

**Moteur principal retenu :** acquisition apprenant par **contenu + défi viral +
newsletter** (organique), avec **2-3 écoles pilotes en fond** (sans en dépendre)
et **publicité payante uniquement comme amplificateur** ponctuel de l'accroche.

---

## 3. Le moteur viral apprenant

### 3.1 L'entonnoir, en 4 temps

```
1. ACCROCHE   Défi gratuit SANS COMPTE (« Teste ton niveau en 15 min »)
      ↓  résultat + envie de prouver
2. CAPTURE    Voir le score détaillé / obtenir le badge → email (newsletter)
      ↓  contact récupéré (réactivable à vie)
3. PARTAGE    Badge/certificat BEAUX et publics → 1 clic WhatsApp / LinkedIn / Facebook
      ↓  chaque partage = pub gratuite vers l'accroche
4. BOUCLE     Les contacts voient le badge d'un proche → refont le défi → …
```

La publicité payante ne sert qu'à **allumer la première mèche** (les premiers
apprenants). Ensuite la boucle 3→4→1 tourne d'elle-même.

### 3.2 Ce qu'on RÉUTILISE (déjà en place)

- **Entraînement par module** : niveau adaptatif. C'est le moteur du « défi ».
  **Passe à 10 questions / 15 min** (était 5 questions / ~8 min) dans le cadre de
  ce lot.
- Système de **badges par module** (données + affichage profil/dashboard/certif).
- **Certificat** `/certificate/[id]`.
- **Newsletter**, **articles de blog** (Mobile Money, cybersécurité PME, IA & emploi
  — parfaits comme contenu d'accroche), **back-office admin**.

### 3.3 Ce qu'on AJOUTE (briques produit à construire)

1. **Mode défi public** : exposer l'entraînement existant **sans authentification**
   (aujourd'hui il exige un compte). Point d'entrée sans friction.
2. **Écran de résultat partageable** en fin de défi : score + comparaison
   (« 7/10 — mieux que X% ») + appel à créer un compte (capture email / code promo).
3. **Pages publiques** de badge et de certificat, consultables **sans compte**,
   avec mention « Vérifié ✓ ».
4. **Images d'aperçu dynamiques (Open Graph)** : quand on colle le lien sur
   WhatsApp/LinkedIn/Facebook, une belle carte s'affiche (nom, module, score, marque
   Syllabix). Généré nativement par Next.js. **C'est la brique qui fait la différence**
   entre un lien ignoré et un lien cliqué.
5. **Boutons de partage** : WhatsApp (n°1 en CI), LinkedIn (« Ajouter à mon profil »
   via URL), Facebook, copier le lien.
6. **Newsletter renforcée en lead magnet** : accès offert / code promo contre email.

### 3.4 Le système de badges à 3 niveaux (couleurs distinctes)

| Niveau | Obtention | Récompense | Couleur |
|---|---|---|---|
| **Apprentissage** | Réussir un entraînement / défi (10 q. / 15 min) | Badge seul | Neutre / bronze |
| **Certification module** | Valider la certification d'un module (1h45) | Badge **+ certificat** | Accent (orange) |
| **Certification globale** | Valider les 7 modules (1h45) | Badge **+ certificat** | Primary (bleu) ou or |

Le badge d'apprentissage est **partageable** (carburant viral) mais visuellement
« plus léger » que ceux de certification — le badge officiel garde toute sa valeur.
Équilibre viralité / crédibilité.

### 3.5 Capture email et conservation de l'historique (anonyme → compte)

**Capture email.** On capture le contact **à l'écran de résultat**, au pic de
motivation : *« Tu as X/10 ! Pour garder ton badge et voir tes réponses détaillées
→ crée ton compte gratuit. »* **Décision : création de compte en principal** (c'est
ce qui construit la vraie base d'utilisateurs) ; créer le compte EST la capture
d'email.

**Conservation de l'historique — auth anonyme + linking Firebase.** Problème à
résoudre : l'utilisateur fait le défi sans compte, puis s'inscrit ; il ne doit RIEN
perdre. Solution native et robuste :

1. À l'arrivée sur le défi, création silencieuse d'une **session anonyme** Firebase
   (identifiant temporaire, aucune action utilisateur).
2. Résultat du défi + badge d'apprentissage enregistrés **sous cet identifiant
   anonyme**.
3. À la création de compte, on **lie (`linkWithCredential`)** le compte permanent
   (email / Google / téléphone) à la session anonyme.
4. L'identifiant (uid) **ne change pas** → badge et historique restent attachés
   automatiquement, sans recopie ni bricolage.

L'alternative localStorage + « réclamation » à l'inscription est écartée : fragile
(perdue si changement d'appareil ou vidage du cache).

### 3.6 Badges maison, compatibles Open Badges

**Décision : ne PAS payer Credly / Accredible à ce stade.**

- Credly : gratuit pour celui qui **reçoit**, mais **payant et cher** (tarif
  entreprise) pour celui qui **émet** (Syllabix). Inadapté au stade POC solo.
- Le standard sous-jacent, **Open Badges** (1EdTech, ex-Mozilla), est **ouvert et
  gratuit** : un badge = une image + des métadonnées (récipiendaire, critère,
  émetteur, lien de vérification).

On construit donc les **badges partageables en interne, compatibles Open Badges**.
Bénéfices : 0 € d'émission, contrôle total (URLs, design, **données email** —
précieuses), partage social identique voire meilleur (page à la marque). Le standard
laisse l'option d'un branchement Credly/Badgr **plus tard** si un partenaire
institutionnel l'exige, sans tout refaire.

L'intégration LinkedIn « Ajouter à mon profil » se fait via une **URL générée
nous-mêmes** — couvre l'essentiel du besoin sans dépendance payante.

---

## 4. Calendrier 30 / 60 / 90 jours

Principe : **ne rien lancer en marketing tant que les briques de partage ne sont
pas prêtes.** On construit le « produit viral », ensuite on l'allume.

### Jours 0-30 — Armer le moteur (produit + fondations)
- Ouvrir l'entraînement en **mode défi public** (sans compte).
- **Écran de résultat partageable** + capture email.
- **Pages publiques** badge/certificat + **images d'aperçu (OG)** + **boutons de partage**.
- **Badge d'apprentissage** (niveau 1) + couleurs des 3 niveaux.
- Muscler **newsletter / code promo** (lead magnet).
- Préparer **10-15 posts** de contenu (à partir des articles existants).

### Jours 30-60 — Allumer la mèche (Abidjan)
- Lancer le **défi** publiquement ; mobiliser le réseau personnel du fondateur pour
  les premiers partages LinkedIn/WhatsApp.
- **Petit budget pub** ciblé Abidjan (18-30 ans, emploi/étudiants) → vers le défi.
- Publier **2-3 contenus/semaine**.
- Objectif : les **premières centaines** d'apprenants + emails.

### Jours 60-90 — Transformer la preuve en partenariats
- Avec les premiers chiffres réels → approcher **2-3 écoles** + **1-2 entreprises**
  à Abidjan (pilotes).
- Produire le **pitch deck / one-pager** (nourris de vrais chiffres).
- Identifier les **bons interlocuteurs institutionnels**.

---

## 5. La cascade vers les partenariats et l'institutionnel

### 5.1 Étage 1 → 2 : de l'apprenant vers écoles & entreprises

Actifs disponibles au bout de 60-90 jours : nombre réel d'apprenants à Abidjan,
badges partagés publiquement, liste email qualifiée, 2-3 histoires réelles
(« a décroché un stage après sa certif »).

- **Écoles / universités / grandes écoles.** Argument : *« Vos étudiants se
  certifient déjà chez nous à titre individuel. Offrons-leur un cadre : une cohorte,
  un tableau de bord de progression, un certificat qui valorise votre établissement.
  Gratuit en phase pilote. »* Produit **déjà prêt** (dashboard organisation,
  rattachement par code, unités classe/filière). Viser une **classe pilote**, pas
  l'école entière.

- **Entreprises.** Argument **ROI** : *« Testez le niveau numérique réel de vos
  candidats ou employés en 1h45, avec un reporting par compétence. »* Un **logo
  d'entreprise connue** vaut plus que le volume. Viser 1-2 pilotes, très accompagnés.

Cette étape est surtout **commerciale**, pas technique (back-office partenariat,
formulaire « Devenir partenaire », reporting par module : déjà en place). D'où le
besoin du **pitch deck + one-pager**.

### 5.2 Étage 2 → 3 : des pilotes vers la reconnaissance institutionnelle

Le plus lent et le plus exigeant. La posture pilote assumée devient l'atout décisif :
*« voici un pilote qui marche, avec des chiffres, dans votre écosystème —
construisons ensemble »*, et non *« reconnaissez-moi »*.

1. **Un pilote mesuré** (école + entreprise, avant/après chiffré) = le dossier.
2. **Les bons interlocuteurs** — pas « le Ministère » en bloc, mais : agences
   emploi des jeunes / numérique / formation professionnelle ; incubateurs ;
   programmes bailleurs (GIZ, AFD, PNUD, Orange Digital Center, Banque mondiale —
   ils financent ce type d'initiatives).
3. **Ce qu'on demande** : pas un blanc-seing, mais un **partenariat cadre** ou un
   **label pilote** (« reconnu comme outil pilote dans le cadre de tel programme »).
   Vrai, atteignable, évolutif.

**Règle rouge :** aucune mention institutionnelle sur le site tant qu'elle n'est pas
réelle et signée. Ce qui protège Syllabix et, paradoxalement, inspire confiance.

Livrables de cet étage (plus tard, quand les pilotes tourneront) : **dossier
institutionnel** formel (4-6 pages, .docx) et éventuellement un **deck** dédié.

---

### 3.7 Surfaces impactées (ce n'est pas que le dashboard)

Ajouter le badge d'apprentissage, le défi public et le passage 10 q / 15 min touche
plusieurs endroits :

| Surface | Ce qui change |
|---|---|
| `lib/examService.js` | Entraînement : 5→**10 questions**, durée → **15 min** |
| Attribution des badges (`api/exam/submit`) | L'entraînement **donne un badge** (niveau apprentissage) — avant, seule la certif en donnait |
| Modèle de badge | Ajouter le **niveau** (apprentissage / cert. module / cert. globale) pour les 3 couleurs |
| `BadgeGrid` + profil + dashboard apprenant + certificat | Afficher les 3 niveaux / couleurs partout |
| Défi public (nouveau) | Version sans login de l'entraînement + **auth anonyme** |
| Écran de résultat partageable (nouveau) | Score + capture email + création de compte + linking |
| Pages publiques badge/certif + OG + boutons de partage (nouveau) | La couche virale |
| Règles Firestore | Autoriser proprement l'écriture d'une tentative en session anonyme, sans ouvrir de faille |
| **Dashboard organisation** | **Inchangé** : reporting sur la **certification seulement** (1h45). Les badges d'apprentissage restent côté apprenant / viral. |

## 6. Périmètre

### Dans le périmètre de ce spec (à implémenter)
Briques produit du moteur viral (§3.3), système de badges 3 niveaux (§3.4),
compatibilité Open Badges + partage LinkedIn par URL (§3.5). Ce sont les seuls
éléments « code » ; le reste (calendrier, pub, prospection) est opérationnel.

### Hors périmètre (cadrages séparés)
- **Agrégateur de paiement** (CinetPay / PayDunya / Wave / Orange Money — pas Stripe
  en CI) : cadrage dédié, à ouvrir dès réception de la documentation par le fondateur.
  Nécessaire pour le modèle « certificat payant plus tard ».
- Augmentation de la durée / du nombre de questions de l'entraînement.
- Production des assets marketing (pitch deck, one-pager, dossier institutionnel) :
  livrables à produire au fil des étages, pas du code.

### Modèle économique apprenant (décision cadre)
Gratuit maintenant (pas d'agrégateur intégré), **payant plus tard** — probablement
avec **codes promo d'accès gratuit contre inscription newsletter** pour les premiers
utilisateurs (lead magnet). À figer lors du cadrage agrégateur.

---

## 7. Critères de succès

- **0-30 j :** briques de partage en production ; un lien de badge collé sur WhatsApp
  affiche une belle carte d'aperçu ; le défi est jouable sans compte.
- **30-60 j :** premières centaines d'apprenants à Abidjan ; liste email qui grossit ;
  badges effectivement partagés (traçable).
- **60-90 j :** au moins 1 école pilote + 1 entreprise pilote engagées ; pitch deck
  prêt avec de vrais chiffres.
- **Transverse :** aucune affirmation non prouvée publiée à aucun moment.
