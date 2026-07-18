'use client';

import Link from 'next/link';
import CTAButton from '@/components/CTAButton';
import Reveal from '@/components/Reveal';
import { useLanguage } from '@/lib/LanguageContext';
import { ArrowRight, Handshake } from 'lucide-react';

// Chiffres STRUCTURELS uniquement — vrais par construction.
const STAT_VALUES = ['7', '21', '32', '1h45'];
const STAT_ICONS  = ['📚', '🎯', '📝', '⏱️'];

export default function AboutPage() {
  const { t } = useLanguage();
  const ab = (k) => t(`about.${k}`);

  const STATS = [
    { value: STAT_VALUES[0], label: ab('stats.modules'),      icon: STAT_ICONS[0] },
    { value: STAT_VALUES[1], label: ab('stats.competencies'), icon: STAT_ICONS[1] },
    { value: STAT_VALUES[2], label: ab('stats.questions'),    icon: STAT_ICONS[2] },
    { value: STAT_VALUES[3], label: ab('stats.duration'),     icon: STAT_ICONS[3] },
  ];

  const APPROACH = ab('approach.items');
  const VALUES   = ab('values.items');

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Hero */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-primary to-[#283593] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium mb-6">
            <span>🌍</span> {ab('missionTag')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-6 leading-tight">
            {ab('hero.title')}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {ab('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Chiffres structurels */}
      <section className="py-14 bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-4xl font-heading font-extrabold text-primary mb-1">{s.value}</p>
                <p className="text-sm text-neutral-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20 space-y-20">

        {/* Le constat / mission */}
        <Reveal direction="up">
          <section className="max-w-3xl">
            <h2 className="text-3xl font-heading font-bold text-primary mb-6">{ab('why.title')}</h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-lg">
              <p>{ab('why.p1')}</p>
              <p>{ab('why.p2')}</p>
              <p className="text-primary font-medium">{ab('why.p3')}</p>
            </div>
          </section>
        </Reveal>

        {/* Notre approche */}
        <section>
          <Reveal direction="up">
            <h2 className="text-3xl font-heading font-bold text-primary mb-10">{ab('approach.title')}</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-6">
            {APPROACH.map((item, i) => (
              <Reveal key={item.title} direction="up" delay={i * 90}>
                <div className="lift h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-card flex gap-4">
                  <div className="text-3xl flex-shrink-0" aria-hidden="true">{item.icon}</div>
                  <div>
                    <h3 className="font-heading font-bold text-primary mb-2">{item.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Nos valeurs */}
        <section>
          <Reveal direction="up">
            <h2 className="text-3xl font-heading font-bold text-primary mb-10">{ab('values.title')}</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} direction="up" delay={i * 90}>
                <div className="text-center p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm h-full">
                  <div className="text-4xl mb-4" aria-hidden="true">{v.icon}</div>
                  <h3 className="font-heading font-bold text-primary mb-2">{v.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Où en sommes-nous — transparence sur le stade */}
        <Reveal direction="up">
          <section className="rounded-2xl border border-accent/20 bg-accent-pale/50 p-8 sm:p-10">
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">{ab('stage.title')}</h2>
            <p className="text-neutral-700 leading-relaxed max-w-3xl mb-6">{ab('stage.text')}</p>
            <Link
              href="/partenariats"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-display font-semibold hover:bg-primary-light transition-colors min-h-[44px]"
            >
              <Handshake className="w-4 h-4" aria-hidden="true" />
              {ab('stage.partnerCta')}
            </Link>
          </section>
        </Reveal>

        {/* CTA apprenant */}
        <Reveal direction="up">
          <section className="bg-primary rounded-2xl p-10 text-center text-white">
            <h3 className="text-2xl sm:text-3xl font-heading font-bold mb-3">{ab('cta.title')}</h3>
            <p className="text-white/75 mb-8 max-w-lg mx-auto leading-relaxed">{ab('cta.desc')}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <CTAButton href="/auth/signup" variant="primary" size="lg">
                {ab('cta.primary')}
                <ArrowRight className="w-4 h-4" />
              </CTAButton>
              <CTAButton href="/certification/presentation" variant="outline-white" size="lg">
                {ab('cta.cert')}
              </CTAButton>
            </div>
          </section>
        </Reveal>

      </div>
    </div>
  );
}
