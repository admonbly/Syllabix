# Syllabix

Plateforme de certification des compétences numériques en Afrique. 7 modules, résultats en moins de 30 minutes, certificat PDF généré automatiquement.

**Stack** : Next.js 14 App Router · Firebase Auth + Firestore · Tailwind CSS · JavaScript/JSX

---

## Prérequis

- Node.js 18+
- Compte Firebase (Auth + Firestore activés)

## Installation

```bash
npm install
cp .env.example .env.local   # puis remplir les variables Firebase
npm run dev                  # → http://localhost:3000
```

### Variables d'environnement (`.env.local`)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## Structure du projet

```
app/
├── page.jsx                          # Accueil
├── layout.tsx                        # Layout global (Header, Footer, Providers)
├── globals.css                       # Design tokens + animations
│
├── (marketing)/
│   ├── about/page.jsx
│   ├── contact/page.jsx
│   └── partenariats/page.jsx
│
├── auth/
│   ├── login/page.jsx                # Email/password + téléphone + Google OAuth
│   ├── signup/page.jsx
│   ├── verify-email/page.jsx
│   ├── verify-phone/page.jsx
│   └── complete-profile/page.jsx     # Complément profil après OAuth
│
├── training/
│   ├── page.jsx                      # Hub formation — 7 modules + mixte
│   ├── module/[id]/page.jsx          # Quiz d'entraînement par module
│   └── mixed/page.jsx                # Quiz mixte tous modules
│
├── evaluation/
│   ├── page.jsx                      # Hub évaluation diagnostique
│   └── module/[id]/page.jsx          # Évaluation par module
│
├── certification/
│   ├── page.jsx                      # Page de présentation de la certification
│   └── presentation/page.jsx
│
├── exam/
│   ├── global/page.jsx               # Examen de certification global (protégé)
│   └── module/[id]/page.jsx          # Examen par module
│
├── certificate/[id]/page.jsx         # Certificat public (partageable)
├── dashboard/page.jsx                # Tableau de bord utilisateur (protégé)
├── profile/page.jsx                  # Profil et paramètres (protégé)
│
├── blog/
│   ├── page.jsx
│   └── [slug]/page.jsx
│
├── actualites/page.jsx
├── cgu/page.jsx
├── privacy/page.jsx
│
└── api/
    └── notify/certificate/route.js  # Envoi email après certificat généré

components/
├── layout/
│   ├── Header.jsx                    # Nav + sélecteur langue + barre accessibilité
│   └── Footer.jsx
├── TrainingQuizComponent.jsx         # Quiz entraînement (feedback immédiat)
├── EvaluationQuizComponent.jsx       # Quiz diagnostique (timer 10 min, niveaux)
├── CertificationQuizComponent.jsx    # Examen officiel (timer, cooldown 7j, certificat)
├── Hero.jsx
├── Card.jsx
├── CTAButton.jsx
├── Reveal.jsx                        # Scroll-reveal animation wrapper
├── CountUp.jsx                       # Compteur animé
└── JsonLd.jsx                        # SEO structured data

lib/
├── firebase.js                       # Config Firebase + authFunctions
├── LanguageContext.jsx               # Contexte FR/EN + hook useLanguage()
├── i18n.js                           # Dictionnaire FR/EN complet
├── AccessibilityContext.jsx          # Taille texte, contraste élevé, police dyslexie
├── examService.js                    # Chargement questions Firestore, calcul scores
├── quizService.js                    # Helpers quiz (randomisation, timer)
├── quizData.js                       # Questions statiques de secours
└── articlesSeed.js                   # Articles blog statiques

middleware.ts                         # Protection routes authentifiées
```

---

## Authentification

Routes protégées (redirigent vers `/auth/login?redirect=…`) :

```
/dashboard  /profile  /training  /evaluation  /exam  /certification
```

Exception publique : `/certification/presentation`

Méthodes disponibles :

```js
import { authFunctions } from '@/lib/firebase';

await authFunctions.signUp(email, password);
await authFunctions.signIn(email, password);
await authFunctions.signInWithGoogle();          // → { profileComplete }
await authFunctions.sendPhoneLoginSMS(phone, 'recaptcha-id');
await authFunctions.confirmPhoneLogin(code);
await authFunctions.signOut();
```

---

## Internationalisation (FR/EN)

Toute l'UI est bilingue via `lib/i18n.js` + `lib/LanguageContext.jsx`. Les questions de quiz restent en français.

```jsx
import { useLanguage } from '@/lib/LanguageContext';

export default function MyComponent() {
  const { locale, t } = useLanguage();
  // t('section.key') → string dans la langue active
}
```

Sections couvertes : `nav`, `a11y`, `home`, `training`, `certification`, `dashboard`, `auth.login`, `quiz`, `quiz.eval`, `quiz.cert`, `quiz.results`, `certificate`.

Le sélecteur de langue est dans le Header. La préférence est persistée en `localStorage`.

---

## Système de quiz

Trois composants distincts partagent la même source de questions Firestore.

| Composant | Mode | Timer | Feedback | Résultat |
|---|---|---|---|---|
| `TrainingQuizComponent` | Entraînement | Non | Immédiat (bonne/mauvaise) | Récap détaillé |
| `EvaluationQuizComponent` | Diagnostic | 10 min | Auto-avance | Niveau (Débutant → Avancé) |
| `CertificationQuizComponent` | Examen officiel | 30 min | Aucun pendant l'examen | Certificat PDF ou échec |

Les questions sont stockées dans Firestore (collection `questions`). Pour en ajouter :

```bash
node scripts/seedFirestore.mjs          # questions initiales
node scripts/seedNewQuestions.mjs       # 30 nouvelles questions avec images
```

### Cooldown certification

Après un échec, l'utilisateur ne peut pas repasser l'examen pendant 7 jours. Le cooldown est stocké dans Firestore sur le document utilisateur.

---

## Design system

### Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `--primary` | `#1A237E` | Titres, éléments de marque |
| `--primary-vivid` | `#2235CC` | Gradient-text, accents UI |
| `--accent` | `#E85D04` | CTA, liens actifs (contraste 4.6:1 ✓ AA) |
| `--secondary` | `#27AE60` | Succès, validation |
| `--surface` | `#F5F6FF` | Fond sections alternées (teinté primary) |
| `--surface-warm` | `#FFF8F0` | Fond sections chaudes (teinté accent) |
| `--dark` | `#0A0F2E` | Section hero foncée, footer |

### Typographie

| Rôle | Police | Variable |
|---|---|---|
| Titres / Display | Plus Jakarta Sans | `--font-display` |
| Corps / UI | DM Sans | `--font-body` |
| Dyslexie (a11y) | OpenDyslexic | Activé via `html.dyslexia-font` |

### Classes utilitaires

```css
.gradient-text        /* titre dégradé primary-vivid → accent */
.hero-bg              /* fond hero avec radial gradients */
.dark-section         /* section CTA sombre */
.container-max        /* max-w-7xl centré avec padding responsive */
.section-tag          /* badge de section (tag pill) */
.card-shine           /* effet shimmer au hover sur carte */
.btn-shine            /* effet shimmer au hover sur bouton */
```

### Accessibilité

Trois options disponibles dans la barre d'accessibilité du Header (persistées en `localStorage`) :

- **Taille du texte** : normal / +10% / +25%
- **Contraste élevé** : `filter: contrast(1.5)` + fond noir
- **Police dyslexie** : OpenDyslexic sur tout le texte de l'interface

---

## Déploiement

### Vercel (recommandé)

```bash
npx vercel
```

Ajouter les variables d'environnement Firebase dans le dashboard Vercel.

### Build de production

```bash
npm run build
npm run start
```

---

## Scripts

```bash
scripts/seedFirestore.mjs          # Initialise les questions Firestore
scripts/seedNewQuestions.mjs       # Ajoute 30 questions avec images
scripts/questions-completes.md     # Référence complète de toutes les questions
```

---

## Limitations connues

- `firebase.json` configuré pour Firebase Hosting statique — non utilisé (Vercel). À ignorer.
- `app/exam/module/[id]` et `app/training/module/[id]` ont des doublons `.tsx` + `.jsx` — le `.tsx` prend la priorité ; supprimer le `.jsx` redondant.
- Pas de tests automatisés — à mettre en place (Jest / Playwright).
- Blog : articles statiques via `lib/articlesSeed.js`, pas de CMS connecté.
