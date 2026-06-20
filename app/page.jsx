'use client';

import Link from 'next/link';
import Hero from '@/components/Hero';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import {
  Monitor, Globe, Mail, FileText, ShieldCheck, Bot, Briefcase,
  Sparkles, Target, Zap,
  Quote, ArrowRight,
} from 'lucide-react';

const modules = [
  { id: 1, icon: Monitor,     title: 'IT (Ordinateur)',          description: "Maîtrisez les bases de l'informatique et l'utilisation efficace des ordinateurs." },
  { id: 2, icon: Globe,       title: 'Internet & Google',        description: 'Naviguer sur le web, rechercher des informations et utiliser les outils Google.' },
  { id: 3, icon: Mail,        title: 'Email',                    description: 'Créer, gérer et organiser vos communications par courrier électronique.' },
  { id: 4, icon: FileText,    title: 'Bureautique',              description: 'Utiliser les outils de traitement de texte, feuilles de calcul et présentations.' },
  { id: 5, icon: ShieldCheck, title: 'Cybersécurité',            description: 'Protéger vos données et comprendre les risques numériques.' },
  { id: 6, icon: Bot,         title: 'Intelligence Artificielle',description: "Découvrir l'IA et ses applications pratiques au quotidien." },
  { id: 7, icon: Briefcase,   title: 'Employabilité',            description: 'Développer les compétences numériques demandées par les employeurs.' },
];

const whyCards = [
  { icon: Sparkles,  title: 'Simple & Accessible',  description: "Interface intuitive optimisée pour les connexions lentes. Fonctionne sur tous les appareils." },
  { icon: Target,    title: 'Évaluation Fiable',     description: "7 modules couvrant les compétences essentielles. Scoring transparent et certificats reconnus." },
  { icon: Zap,       title: 'Résultats Rapides',     description: "Obtenez votre évaluation en moins de 30 minutes. Certificat immédiat en PDF." },
];

const testimonials = [
  { text: "Syllabix m'a permis de certifier mes compétences numériques. Très utile pour ma recherche d'emploi!", author: 'Amara Traoré',    location: 'Dakar, Sénégal' },
  { text: 'La plateforme est simple à utiliser et les modules sont très bien structurés. Recommandé!',             author: 'Zainab Mohamed', location: 'Kigali, Rwanda' },
  { text: "Excellent outil pour évaluer rapidement les compétences IT. J'utilise cela pour former mon équipe.",   author: 'Samuel Adeyemi', location: 'Lagos, Nigeria' },
];

const blogPosts = [
  { href: '/blog/ia-chat-gpt-2024',       badge: 'IA',            icon: Bot,         title: "ChatGPT et l'IA en 2024",        excerpt: 'Découvrez comment utiliser ChatGPT et les assistants IA dans votre quotidien.' },
  { href: '/blog/securite-mots-passe',    badge: 'Cybersécurité', icon: ShieldCheck, title: 'Mots de passe sécurisés',         excerpt: 'Les meilleures pratiques pour protéger vos comptes en ligne.' },
  { href: '/blog/google-avancee',         badge: 'Internet',      icon: Globe,       title: 'Recherche Google avancée',        excerpt: 'Les opérateurs de recherche qui vous sauveront du temps.' },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────── */}
      <Hero
        title="Évaluez vos compétences numériques"
        subtitle="Syllabix est la plateforme de certification des compétences numériques en Afrique. Passez l'évaluation et obtenez un certificat reconnu."
        stats={[
          { value: '7',     label: 'Modules couverts' },
          { value: '< 30m', label: "Durée de l'examen" },
          { value: '100%',  label: 'Certificat PDF' },
        ]}
        cta={
          <CTAButton href="/certification/presentation" variant="outline" size="lg">
            Découvrir la certification
          </CTAButton>
        }
      />

      {/* ── Pourquoi Syllabix ────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container-max">
          <div className="text-center mb-4">
            <h2 className="section-title">Pourquoi Syllabix&nbsp;?</h2>
          </div>
          <p className="section-subtitle text-center mb-12">
            La plateforme leader pour évaluer et certifier les compétences numériques en Afrique
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyCards.map(({ icon, title, description }) => (
              <Card key={title} icon={icon} title={title} description={description} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7 Modules ───────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="container-max">
          <div className="text-center mb-4">
            <h2 className="section-title">7 Modules d'Évaluation</h2>
          </div>
          <p className="section-subtitle text-center mb-12">
            Couvrez tous les domaines des compétences numériques essentielles
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {modules.map((mod) => (
              <Link
                key={mod.id}
                href={`/training/module/${mod.id}`}
                className="group focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-2xl"
              >
                <Card
                  icon={mod.icon}
                  title={mod.title}
                  description={mod.description}
                  className="h-full cursor-pointer group-hover:border-accent group-hover:shadow-card-hover"
                />
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <CTAButton href="/training" size="lg">
              S'entraîner
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ── Témoignages ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container-max">
          <div className="text-center mb-4">
            <h2 className="section-title">Ce que disent nos utilisateurs</h2>
          </div>
          <p className="section-subtitle text-center mb-12">
            Des milliers de professionnels font confiance à Syllabix
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-4"
              >
                <Quote className="w-8 h-8 text-accent/40" strokeWidth={1.5} />
                <p className="text-neutral-600 text-sm leading-relaxed flex-1 italic">
                  {t.text}
                </p>
                <div className="border-t border-primary/10 pt-4">
                  <p className="font-semibold text-primary text-sm">{t.author}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog ────────────────────────────────────────── */}
      <section id="actualites" className="py-20 bg-surface">
        <div className="container-max">
          <div className="text-center mb-4">
            <h2 className="section-title">Actualités & Blog</h2>
          </div>
          <p className="section-subtitle text-center mb-12">
            Restez informé avec nos derniers articles et actualités numériques
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map(({ href, badge, icon: Icon, title, excerpt }) => (
              <Link key={href} href={href} className="group focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-2xl">
                <div className="h-full p-6 bg-white rounded-2xl shadow-card border border-neutral-200 hover:border-accent hover:shadow-card-hover transition-all duration-200 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-accent" strokeWidth={1.75} />
                  </div>
                  <div>
                    <span className="badge-accent mb-3 inline-flex">{badge}</span>
                    <h3 className="text-base font-heading font-semibold text-neutral-900 mb-2 group-hover:text-accent transition-colors">
                      {title}
                    </h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">{excerpt}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-accent text-sm font-semibold">
                    Lire la suite
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <CTAButton href="/blog" variant="outline" size="lg">
              Voir tous les articles
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────── */}
      <section className="py-20 bg-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Prêt à certifier vos compétences&nbsp;?
          </h2>
          <p className="text-lg text-white/85 mb-10">
            L'évaluation prend moins de 30 minutes. Aucune inscription préalable requise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton href="/certification" variant="dark" size="lg">
              Passer l'examen
            </CTAButton>
            <CTAButton
              href="/contact"
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/15 border border-white/30"
            >
              Des questions&nbsp;?
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ── Newsletter ──────────────────────────────────── */}
      <section className="py-20 bg-primary">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3">
            Rejoignez la communauté Syllabix
          </h2>
          <p className="text-white/60 mb-8">
            Restez informé des nouvelles évaluations, ressources et actualités du monde numérique.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Votre adresse email"
              aria-label="Adresse email"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-accent focus:bg-white/15 transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              S'abonner
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
