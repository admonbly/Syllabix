'use client';

import CTAButton from '@/components/CTAButton';
import Card from '@/components/Card';
import Link from 'next/link';

const modules = [
  {
    id: 1,
    emoji: '💻',
    title: 'IT & Ordinateur',
    description: 'Architecture, système d\'exploitation, gestion des fichiers et maintenance.',
    topics: [
      'Architecture d\'un ordinateur (processeur, RAM, stockage)',
      'Systèmes d\'exploitation (Windows, macOS, Linux)',
      'Installation et gestion de logiciels',
      'Organisation des fichiers et dossiers',
      'Maintenance et optimisation basique',
    ],
  },
  {
    id: 2,
    emoji: '🌐',
    title: 'Internet & Navigation',
    description: 'Navigation, recherche avancée et sécurité web.',
    topics: [
      'Navigation web et comprendre les URLs',
      'Moteurs de recherche et recherche avancée',
      'Sécurité des sites web (HTTPS, certificats SSL)',
      'Gestion des favoris et de l\'historique',
      'Téléchargements sécurisés',
    ],
  },
  {
    id: 3,
    emoji: '📧',
    title: 'Email & Communication',
    description: 'Maîtrise complète de la messagerie professionnelle.',
    topics: [
      'Création et gestion d\'un compte email',
      'Rédaction et envoi d\'emails professionnels',
      'Gestion des pièces jointes',
      'Organisation des emails (dossiers, filtres)',
      'Signature professionnelle et contacts',
    ],
  },
  {
    id: 4,
    emoji: '📊',
    title: 'Bureautique',
    description: 'Traitement de texte, tableurs et présentations.',
    topics: [
      'Traitement de texte (Word, Google Docs)',
      'Feuilles de calcul (Excel, Google Sheets)',
      'Présentations (PowerPoint, Google Slides)',
      'Mise en page et formatage professionnel',
      'Collaboration et partage de documents',
    ],
  },
  {
    id: 5,
    emoji: '🛡️',
    title: 'Cybersécurité',
    description: 'Protéger ses données et identifier les menaces en ligne.',
    topics: [
      'Mots de passe forts et gestionnaires',
      'Hameçonnage (phishing) et arnaques en ligne',
      'Malware, virus et ransomware',
      'Sauvegarde et récupération des données',
      'Confidentialité et vie privée en ligne',
    ],
  },
  {
    id: 6,
    emoji: '🤖',
    title: 'Intelligence Artificielle',
    description: 'Comprendre et utiliser les outils IA au quotidien.',
    topics: [
      'Principes fondamentaux de l\'IA',
      'Assistants IA (ChatGPT, Claude, Gemini)',
      'Génération d\'images et de contenus',
      'Applications pratiques de l\'IA au travail',
      'Éthique et limites de l\'IA',
    ],
  },
  {
    id: 7,
    emoji: '💼',
    title: 'Employabilité Numérique',
    description: 'Valoriser ses compétences et travailler à l\'ère digitale.',
    topics: [
      'Profil LinkedIn et personal branding',
      'CV numérique et lettre de motivation',
      'Communication professionnelle en ligne',
      'Visiophonie et réunions à distance (Zoom, Teams)',
      'Outils collaboratifs et travail en équipe',
    ],
  },
];

const steps = [
  {
    number: '01',
    emoji: '🏋️',
    title: 'S\'entraîner',
    description: 'Accédez aux modules d\'entraînement gratuitement. 5 questions par module, sans limite de tentatives.',
  },
  {
    number: '02',
    emoji: '📝',
    title: 'Passer l\'examen',
    description: '35 questions en 35 minutes. Les questions sont tirées aléatoirement pour chaque tentative.',
  },
  {
    number: '03',
    emoji: '🏆',
    title: 'Obtenir le certificat',
    description: 'Un score ≥ 60% vous délivre un certificat numérique unique, vérifiable en ligne.',
  },
];

export default function PresentationPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">

      {/* Hero */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-white/80 rounded-full text-sm font-semibold mb-6 tracking-wide uppercase">
            Certification Syllabix
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
            7 modules pour maîtriser<br />les compétences numériques
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
            Une certification concrète, vérifiable, reconnue — pensée pour les professionnels et étudiants africains.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <CTAButton href="/training/mixed" variant="white">
              S'entraîner gratuitement
            </CTAButton>
            <CTAButton href="/certification" variant="outline-white">
              Passer la certification
            </CTAButton>
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="py-12 bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '7', label: 'Modules' },
              { value: '35', label: 'Questions' },
              { value: '35 min', label: 'Durée' },
              { value: '60%', label: 'Score requis' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-heading font-bold text-primary">{value}</p>
                <p className="text-sm text-neutral-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-primary text-center mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-neutral-500 text-center mb-12">Trois étapes simples pour obtenir votre certification.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/8 text-3xl mb-4">
                  {step.emoji}
                </div>
                <p className="text-xs font-bold text-accent uppercase tracking-widest mb-2">{step.number}</p>
                <h3 className="text-lg font-heading font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-primary text-center mb-4">
            Les 7 modules de certification
          </h2>
          <p className="text-neutral-500 text-center mb-12">
            Chaque module est évalué sur 5 questions ciblées.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod) => (
              <div key={mod.id} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 hover:border-accent/30 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{mod.emoji}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-accent uppercase tracking-widest">Module {mod.id}</span>
                    </div>
                    <h3 className="text-lg font-heading font-bold text-primary mb-1">{mod.title}</h3>
                    <p className="text-sm text-neutral-500 mb-4">{mod.description}</p>
                    <ul className="space-y-1.5">
                      {mod.topics.map((topic, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                          <span className="text-accent font-bold mt-0.5 flex-shrink-0">✓</span>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold mb-4">Prêt à vous certifier ?</h2>
          <p className="text-white/70 mb-8">
            Commencez par vous entraîner gratuitement, passez l'examen quand vous êtes prêt.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <CTAButton href="/training/mixed" variant="white">
              S'entraîner d'abord
            </CTAButton>
            <CTAButton href="/certification" variant="outline-white">
              Passer l'examen
            </CTAButton>
          </div>
        </div>
      </section>

    </div>
  );
}
