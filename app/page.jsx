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
import { useLanguage } from '@/lib/LanguageContext';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { TESTIMONIALS_SEED } from '@/lib/testimonialsSeed';

/* ── Static icons (unchanged across languages) ─────────── */
const MODULE_ICONS = [Monitor, Globe, Mail, FileText, ShieldCheck, Bot, Briefcase];
const MODULE_KEYS  = ['it', 'internet', 'email', 'bureautique', 'cybersec', 'ai', 'emploi'];
const STEP_ICONS   = [BookOpen, Target, Zap];

/**
 * Chiffres STRUCTURELS uniquement (vrais par construction). Les métriques
 * d'usage — nombre d'apprenants, taux de satisfaction — étaient inventées :
 * elles reviendront quand elles seront réellement mesurées.
 * La durée d'évaluation suit lib/examService.js (EVALUATION.DURATION = 45 min).
 */
const bigStats = [
  { value: 7,  suffix: '' },
  { value: 5,  suffix: '' },
  { value: 16, suffix: '' },
  { value: 45, suffix: ' min' },
];

const blogPosts = [
  { href: '/blog/ia-emploi-afrique-2026',              badge: 'IA',            icon: Bot,         titleFr: "IA et emploi en Afrique : menace ou opportunité ?",              excerptFr: "L'IA va-t-elle détruire les emplois africains ou en créer de nouveaux ? Analyse des secteurs concernés.",     titleEn: 'AI & jobs in Africa: threat or opportunity?',      excerptEn: 'Will AI destroy African jobs or create new ones? Analysis of impacted sectors.' },
  { href: '/blog/cybersecurite-pme-afrique',           badge: 'Cybersécurité', icon: ShieldCheck, titleFr: "Cybersécurité pour PME africaines : les 6 erreurs qui coûtent cher", excerptFr: "Arnaques au CEO, phishing WhatsApp, faux virements… comment protéger votre entreprise.",                    titleEn: 'Cybersecurity for African SMEs: 6 costly mistakes', excerptEn: 'CEO fraud, WhatsApp phishing, fake transfers… how to protect your business.' },
  { href: '/blog/mobile-money-competences-numeriques', badge: 'Internet',      icon: Globe,       titleFr: "Mobile Money et compétences numériques : le duo gagnant",        excerptFr: "MTN MoMo, Wave, Orange Money… quelles compétences numériques maîtriser pour en tirer le meilleur parti ?", titleEn: 'Mobile Money & digital skills: the winning duo',   excerptEn: 'MTN MoMo, Wave, Orange Money… what digital skills to master to make the most of them.' },
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
        <p className={`text-lg text-neutral-600 leading-relaxed ${center ? 'max-w-2xl mx-auto' : 'max-w-xl'}`}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

/* ── Page ──────────────────────────────────────────────── */
export default function HomePage() {
  const { locale, t } = useLanguage();
  const h = (k) => t(`home.${k}`);

  const modules = MODULE_KEYS.map((key, i) => ({
    id:          i + 1,
    icon:        MODULE_ICONS[i],
    title:       h(`moduleNames.${key}`),
    description: h(`moduleDescs.${key}`),
  }));

  const steps = [
    { number: '01', icon: STEP_ICONS[0], title: h('howItWorks.step1.title'), desc: h('howItWorks.step1.desc') },
    { number: '02', icon: STEP_ICONS[1], title: h('howItWorks.step2.title'), desc: h('howItWorks.step2.desc') },
    { number: '03', icon: STEP_ICONS[2], title: h('howItWorks.step3.title'), desc: h('howItWorks.step3.desc') },
  ];

  const statLabels = [h('stats.modules'), h('stats.domains'), h('stats.competencies'), h('stats.duration')];

  // Témoignages : source de vérité = Firestore, repli sur le code si injoignable.
  // Le repli est vide tant qu'aucun témoignage RÉEL n'existe — dans ce cas la
  // section entière est masquée plutôt que de montrer des personnes inventées.
  const [testimonials, setTestimonials] = useState(TESTIMONIALS_SEED);

  useEffect(() => {
    let cancelled = false;
    getDocs(collection(db, 'testimonials'))
      .then((snap) => {
        if (cancelled) return;
        const live = snap.docs
          .map((d) => d.data())
          .filter((tm) => tm.published !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (live.length > 0) setTestimonials(live);
      })
      .catch(() => { /* repli déjà en place */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {/* ─── 1. Hero ───────────────────────────────── */}
      <Hero
        title={
          <>
            {h('hero.title1')}<br />
            <span className="gradient-text">{h('hero.title2')}</span>
            {h('hero.title3') ? <><br />{h('hero.title3')}</> : null}
          </>
        }
        subtitle={h('hero.subtitle')}
      />

      {/* ─── 2. Comment ça marche ──────────────────── */}
      <section className="py-24 bg-white">
        <div className="container-max">
          <SectionHeader
            tag={h('howItWorks.tag')}
            title={h('howItWorks.title')}
            subtitle={h('howItWorks.subtitle')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div
              aria-hidden
              className="hidden md:block absolute top-10 left-[calc(33.33%+16px)] right-[calc(33.33%+16px)] h-px bg-gradient-to-r from-accent/20 via-accent/60 to-accent/20"
            />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.number} direction="up" delay={i * 130}>
                  <div className="lift group relative p-6 rounded-2xl bg-surface border border-neutral-100 hover:border-accent/30 hover:shadow-card-hover transition-all duration-300">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-11 h-11 rounded-full border-2 border-accent/25 bg-accent/8 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-accent group-hover:border-accent">
                        <Icon className="w-5 h-5 text-accent group-hover:text-white transition-colors" strokeWidth={2} />
                      </div>
                      <span className="text-4xl font-display font-extrabold text-neutral-100 group-hover:text-accent/20 transition-colors leading-none select-none">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-neutral-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{step.desc}</p>
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
            tag={h('modules.tag')}
            title={h('modules.title')}
            subtitle={h('modules.subtitle')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {modules.map((mod, i) => (
              <Reveal key={mod.id} direction="up" delay={i * 55}>
                <Card
                  icon={mod.icon}
                  title={mod.title}
                  description={mod.description}
                  number={mod.id}
                  className="h-full lift"
                />
              </Reveal>
            ))}
          </div>

          <Reveal direction="up" delay={350} className="mt-12 text-center">
            <CTAButton href="/training" size="lg">
              {h('modules.viewAll')}
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
              <Reveal key={i} direction="scale" delay={i * 90} className="text-center">
                <p className="text-4xl sm:text-5xl font-display font-extrabold text-white mb-2">
                  <CountUp value={s.value} suffix={s.suffix} duration={2100} />
                </p>
                <p className="text-white/45 text-xs uppercase tracking-widest">{statLabels[i]}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Témoignages — masqués tant qu'il n'en existe aucun de réel ── */}
      {testimonials.length > 0 && (
      <section className="py-24 bg-surface-warm">
        <div className="container-max">
          <SectionHeader
            tag={h('testimonials.tag')}
            title={h('testimonials.title')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((tm, i) => (
              <Reveal key={tm.id ?? i} direction="up" delay={i * 110}>
                <div className="lift group relative bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-neutral-100 hover:border-accent/20 flex flex-col h-full">
                  <Quote className="w-8 h-8 text-accent/20 mb-4 flex-shrink-0 group-hover:text-accent/35 transition-colors" strokeWidth={1.5} />
                  <p className="text-neutral-600 text-sm leading-relaxed flex-1 italic mb-6">
                    &ldquo;{locale === 'fr' ? tm.quoteFr : tm.quoteEn}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                    <div className={`w-10 h-10 rounded-full ${tm.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-display font-bold">{tm.initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-display font-semibold text-neutral-900">{tm.name}</p>
                      <p className="text-xs text-neutral-400">{tm.role} · {tm.location}</p>
                    </div>
                  </div>
                  <div aria-hidden className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-accent/0 via-accent to-accent/0 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ─── 6. Blog & Actualités ──────────────────── */}
      <section id="actualites" className="py-24 bg-white">
        <div className="container-max">
          <SectionHeader
            tag={h('blog.tag')}
            title={h('blog.title')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map(({ href, badge, icon: Icon, titleFr, excerptFr, titleEn, excerptEn }, i) => {
              const postTitle   = locale === 'fr' ? titleFr   : titleEn;
              const postExcerpt = locale === 'fr' ? excerptFr : excerptEn;
              return (
                <Reveal key={href} direction="up" delay={i * 100}>
                  <Link href={href} className="group block h-full rounded-2xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                    <div className="lift h-full bg-white rounded-2xl shadow-card border border-neutral-100 hover:border-accent/30 hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
                      <div className="h-1 bg-gradient-to-r from-accent to-accent-light flex-shrink-0" />
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-5">
                          <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                            <Icon className="w-5 h-5 text-accent" strokeWidth={1.75} />
                          </div>
                          <span className="px-2.5 py-1 bg-accent/10 text-accent text-xs font-display font-semibold rounded-full">{badge}</span>
                        </div>
                        <h3 className="font-display font-bold text-base text-neutral-900 mb-2 group-hover:text-accent transition-colors leading-snug">{postTitle}</h3>
                        <p className="text-neutral-600 text-sm leading-relaxed flex-1">{postExcerpt}</p>
                        <div className="mt-5 flex items-center gap-1.5 text-accent text-sm font-display font-semibold">
                          {h('blog.cta')}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <Reveal direction="up" delay={280} className="mt-12 text-center">
            <CTAButton href="/blog" variant="outline" size="lg">
              {h('blog.all')}
            </CTAButton>
          </Reveal>
        </div>
      </section>

      {/* ─── 7. CTA Final ──────────────────────────── */}
      <section className="py-24 dark-section relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 hero-dots opacity-20 pointer-events-none" />
        <div aria-hidden className="ph-float absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div aria-hidden className="ph-float-rev absolute bottom-0 left-0 w-60 h-60 bg-secondary/8 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Reveal direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 border border-accent/25 mb-8">
              <span className="w-2 h-2 rounded-full bg-accent" style={{animation:'pulse-dot 1.4s ease-in-out infinite'}} />
              <span className="text-accent text-xs font-display font-semibold tracking-widest uppercase">
                {h('cta.title')}
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-5 leading-tight">
              {h('cta.subtitle')}
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <CTAButton href="/certification" variant="primary" size="lg">
                {h('cta.primary')}
                <ArrowRight className="w-4 h-4" />
              </CTAButton>
              <CTAButton href="/contact" variant="outline-white" size="lg">
                {h('cta.secondary')}
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
