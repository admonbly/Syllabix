'use client';

import Link from 'next/link';
import Hero from '@/components/Hero';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Reveal from '@/components/Reveal';
import CountUp from '@/components/CountUp';
import {
  Monitor, Globe, Mail, FileText, ShieldCheck, Bot, Briefcase,
  BookOpen, Target, Zap, ArrowRight, Quote,
} from 'lucide-react';

/* ── Data ──────────────────────────────────────────────── */
const modules = [
  { id: 1, icon: Monitor,     title: 'IT & Ordinateur',          description: "Bases informatiques et utilisation efficace de l'ordinateur." },
  { id: 2, icon: Globe,       title: 'Internet & Google',        description: 'Navigation web, recherche et outils Google.' },
  { id: 3, icon: Mail,        title: 'Email',                    description: 'Créer et gérer vos communications email professionnellement.' },
  { id: 4, icon: FileText,    title: 'Bureautique',              description: 'Traitement de texte, tableurs et présentations.' },
  { id: 5, icon: ShieldCheck, title: 'Cybersécurité',            description: 'Protéger vos données et comptes en ligne.' },
  { id: 6, icon: Bot,         title: 'Intelligence Artificielle',description: "L'IA et ses applications pratiques au quotidien." },
  { id: 7, icon: Briefcase,   title: 'Employabilité',            description: 'Compétences numériques recherchées par les employeurs.' },
];

const steps = [
  {
    number: '01', icon: BookOpen,
    title: 'Choisissez votre parcours',
    desc:  'Sélectionnez un ou plusieurs modules selon vos besoins. Formation libre ou certification complète.',
  },
  {
    number: '02', icon: Target,
    title: "Passez l'évaluation",
    desc:  'Répondez à nos questions adaptatives. Moins de 30 minutes pour l\'évaluation complète.',
  },
  {
    number: '03', icon: Zap,
    title: 'Obtenez votre certificat',
    desc:  'Téléchargez votre certificat PDF reconnu. Partagez sur LinkedIn et dans vos candidatures.',
  },
];

const bigStats = [
  { value: 5000, suffix: '+',    label: 'Apprenants certifiés' },
  { value: 7,    suffix: '',     label: 'Modules disponibles'  },
  { value: 30,   suffix: ' min', label: "Durée max d'évaluation" },
  { value: 98,   suffix: '%',    label: 'Taux de satisfaction' },
];

const testimonials = [
  {
    quote:    "Syllabix m'a permis de certifier mes compétences numériques. Le certificat a vraiment fait la différence dans ma recherche d'emploi.",
    name:     'Amara Traoré',
    role:     'Assistant administratif',
    location: 'Dakar, Sénégal',
    initials: 'AT',
    color:    'bg-primary',
  },
  {
    quote:    "Interface simple et modules très bien structurés. J'ai pu former toute mon équipe en quelques semaines. Vraiment recommandé !",
    name:     'Samuel Adeyemi',
    role:     'Manager RH',
    location: 'Lagos, Nigeria',
    initials: 'SA',
    color:    'bg-accent',
  },
  {
    quote:    "En tant que jeune diplômée, ce certificat m'a aidée à montrer concrètement mes compétences aux recruteurs. Merci Syllabix !",
    name:     'Zainab Mohamed',
    role:     'Chargée de communication',
    location: 'Kigali, Rwanda',
    initials: 'ZM',
    color:    'bg-secondary',
  },
];

const blogPosts = [
  {
    href:    '/blog/ia-chat-gpt-2024',
    badge:   'IA',
    icon:    Bot,
    title:   "ChatGPT et l'IA en 2024",
    excerpt: 'Comment utiliser les assistants IA dans votre quotidien professionnel et personnel.',
  },
  {
    href:    '/blog/securite-mots-passe',
    badge:   'Sécurité',
    icon:    ShieldCheck,
    title:   'Mots de passe : les bonnes pratiques',
    excerpt: 'Les méthodes pour créer et gérer des mots de passe solides en 2024.',
  },
  {
    href:    '/blog/google-avancee',
    badge:   'Internet',
    icon:    Globe,
    title:   'Maîtriser la recherche Google',
    excerpt: 'Les opérateurs avancés qui vous feront gagner des heures de recherche.',
  },
];

/* ── Composant section header ──────────────────────────── */
function SectionHeader({ tag, title, subtitle, center = true }) {
  return (
    <Reveal direction="up" className={`mb-14 ${center ? 'text-center' : ''}`}>
      {tag && (
        <span className="section-tag bg-accent/10 text-accent mb-4 block w-fit mx-auto">
          {tag}
        </span>
      )}
      <h2 className={`text-3xl sm:text-4xl font-display font-bold text-primary mt-3 mb-4 ${center ? '' : ''}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg text-neutral-500 leading-relaxed ${center ? 'max-w-2xl mx-auto' : 'max-w-xl'}`}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

/* ── Page ──────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* ─── 1. Hero ───────────────────────────────── */}
      <Hero
        title={
          <>
            Certifiez vos<br />
            <span className="gradient-text">compétences</span><br />
            numériques
          </>
        }
        subtitle="La plateforme de référence pour évaluer et certifier vos compétences numériques en Afrique. Passez l'évaluation, obtenez votre certificat reconnu."
      />

      {/* ─── 2. Comment ça marche ──────────────────── */}
      <section className="py-24 bg-white">
        <div className="container-max">
          <SectionHeader
            tag="Simple et rapide"
            title="Comment ça marche ?"
            subtitle="Trois étapes pour valider vos compétences et obtenir votre certificat numérique."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line on desktop */}
            <div
              aria-hidden
              className="hidden md:block absolute top-10 left-[calc(33.33%+16px)] right-[calc(33.33%+16px)] h-px bg-gradient-to-r from-accent/20 via-accent/60 to-accent/20"
            />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.number} direction="up" delay={i * 130}>
                  <div className="group relative p-6 rounded-2xl bg-surface border border-neutral-100 hover:border-accent/30 hover:shadow-card-hover transition-all duration-300">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-11 h-11 rounded-full border-2 border-accent/25 bg-accent/8 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-accent group-hover:border-accent">
                        <Icon className="w-5 h-5 text-accent group-hover:text-white transition-colors" strokeWidth={2} />
                      </div>
                      <span className="text-4xl font-display font-extrabold text-neutral-100 group-hover:text-accent/20 transition-colors leading-none select-none">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-neutral-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>

                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl bg-gradient-to-r from-accent to-accent-light origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-350" />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 3. Les 7 Modules ──────────────────────── */}
      <section className="py-24 bg-surface">
        <div className="container-max">
          <SectionHeader
            tag="7 modules"
            title="Évaluez toutes vos compétences"
            subtitle="Chaque module couvre un domaine essentiel du numérique. Passez-les tous ou sélectionnez les plus pertinents."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {modules.map((mod, i) => (
              <Reveal key={mod.id} direction="up" delay={i * 55}>
                <Link
                  href={`/training/module/${mod.id}`}
                  className="block h-full rounded-2xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  <Card
                    icon={mod.icon}
                    title={mod.title}
                    description={mod.description}
                    number={mod.id}
                    className="h-full cursor-pointer"
                  />
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal direction="up" delay={350} className="mt-12 text-center">
            <CTAButton href="/training" size="lg">
              S&apos;entraîner sur les modules
              <ArrowRight className="w-4 h-4" />
            </CTAButton>
          </Reveal>
        </div>
      </section>

      {/* ─── 4. Stats strip ────────────────────────── */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 hero-dots opacity-30 pointer-events-none" />
        <div className="container-max relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {bigStats.map((s, i) => (
              <Reveal key={s.label} direction="scale" delay={i * 90} className="text-center">
                <p className="text-4xl sm:text-5xl font-display font-extrabold text-white mb-2">
                  <CountUp value={s.value} suffix={s.suffix} duration={2100} />
                </p>
                <p className="text-white/45 text-xs uppercase tracking-widest">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Témoignages ────────────────────────── */}
      <section className="py-24 bg-surface-warm">
        <div className="container-max">
          <SectionHeader
            tag="Témoignages"
            title="Ils ont certifié leurs compétences"
            subtitle="Des milliers de professionnels africains font confiance à Syllabix pour valider et valoriser leurs compétences numériques."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={i} direction="up" delay={i * 110}>
                <div className="group relative bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-neutral-100 hover:border-accent/20 flex flex-col h-full">
                  <Quote className="w-8 h-8 text-accent/20 mb-4 flex-shrink-0 group-hover:text-accent/35 transition-colors" strokeWidth={1.5} />

                  <p className="text-neutral-600 text-sm leading-relaxed flex-1 italic mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-display font-bold">{t.initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-display font-semibold text-neutral-900">{t.name}</p>
                      <p className="text-xs text-neutral-400">{t.role} · {t.location}</p>
                    </div>
                  </div>

                  {/* Bottom line reveal */}
                  <div
                    aria-hidden
                    className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-accent/0 via-accent to-accent/0 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. Blog & Actualités ──────────────────── */}
      <section id="actualites" className="py-24 bg-white">
        <div className="container-max">
          <SectionHeader
            tag="Blog & Actualités"
            title="Restez informé"
            subtitle="Articles, guides pratiques et actualités du monde numérique africain."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map(({ href, badge, icon: Icon, title, excerpt }, i) => (
              <Reveal key={href} direction="up" delay={i * 100}>
                <Link
                  href={href}
                  className="group block h-full rounded-2xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  <div className="h-full bg-white rounded-2xl shadow-card border border-neutral-100 hover:border-accent/30 hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
                    {/* Top color bar */}
                    <div className="h-1 bg-gradient-to-r from-accent to-accent-light flex-shrink-0" />

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                          <Icon className="w-5 h-5 text-accent" strokeWidth={1.75} />
                        </div>
                        <span className="px-2.5 py-1 bg-accent/10 text-accent text-xs font-display font-semibold rounded-full">
                          {badge}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-base text-neutral-900 mb-2 group-hover:text-accent transition-colors leading-snug">
                        {title}
                      </h3>
                      <p className="text-neutral-500 text-sm leading-relaxed flex-1">{excerpt}</p>

                      <div className="mt-5 flex items-center gap-1.5 text-accent text-sm font-display font-semibold">
                        Lire l&apos;article
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal direction="up" delay={280} className="mt-12 text-center">
            <CTAButton href="/blog" variant="outline" size="lg">
              Voir tous les articles
            </CTAButton>
          </Reveal>
        </div>
      </section>

      {/* ─── 7. CTA Final ──────────────────────────── */}
      <section className="py-24 dark-section relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 hero-dots opacity-20 pointer-events-none" />
        <div aria-hidden className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div aria-hidden className="absolute bottom-0 left-0 w-60 h-60 bg-secondary/8 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Reveal direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 border border-accent/25 mb-8">
              <span className="w-2 h-2 rounded-full bg-accent" style={{animation:'pulse-dot 1.4s ease-in-out infinite'}} />
              <span className="text-accent text-xs font-display font-semibold tracking-widest uppercase">
                Prêt à commencer ?
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-5 leading-tight">
              Certifiez vos compétences<br />
              <span className="gradient-text">en moins de 30 minutes</span>
            </h2>

            <p className="text-lg text-white/55 mb-10 max-w-xl mx-auto leading-relaxed">
              Aucune inscription préalable requise. Commencez l&apos;évaluation maintenant et obtenez votre certificat immédiatement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <CTAButton href="/certification" variant="primary" size="lg">
                Passer l&apos;examen maintenant
                <ArrowRight className="w-4 h-4" />
              </CTAButton>
              <CTAButton href="/contact" variant="outline-white" size="lg">
                Des questions ?
              </CTAButton>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-white/35 text-sm">
              {['✓ Certificat PDF immédiat', '✓ Aucune inscription requise', '✓ 100 % en ligne'].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
