'use client';

import Link from 'next/link';
import CTAButton from '@/components/CTAButton';
import { useLanguage } from '@/lib/LanguageContext';

// Chiffres STRUCTURELS uniquement — vrais par construction. Les métriques
// d'usage (apprenants, satisfaction, pays) étaient inventées : la plateforme
// est en lancement. Elles reviendront quand elles seront mesurées.
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

  const TEAM        = ab('team.members');
  const RECOGNITION = ab('recognition.items');
  const VALUES      = ab('values.items');
  const FEATURES    = ab('why.features');
  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary to-[#283593] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium mb-6">
            <span>🌍</span> {ab('missionTag')}
          </div>
          <h1 className="text-5xl font-heading font-bold mb-6 leading-tight">
            {ab('hero.title')}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {ab('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Chiffres */}
      <section className="py-16 bg-white border-b border-neutral-100">
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

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* Mission */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-heading font-bold text-primary mb-4">{ab('why.title')}</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">{ab('why.p1')}</p>
            <p className="text-neutral-600 leading-relaxed mb-4">{ab('why.p2')}</p>
            <p className="text-neutral-600 leading-relaxed">{ab('why.p3')}</p>
          </div>
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border border-primary/10">
            <div className="space-y-4">
              {FEATURES.map((item) => (
                <p key={item} className="text-neutral-700 font-medium">{item}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Équipe */}
        <section>
          <h2 className="text-3xl font-heading font-bold text-primary mb-3">{ab('team.title')}</h2>
          <p className="text-neutral-500 mb-10">{ab('team.subtitle')}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                <div className="text-4xl mb-4">{member.icon}</div>
                <h3 className="font-heading font-bold text-primary mb-1">{member.name}</h3>
                <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-3">{member.role}</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reconnaissance des certificats */}
        <section>
          <h2 className="text-3xl font-heading font-bold text-primary mb-3">{ab('recognition.title')}</h2>
          <p className="text-neutral-500 mb-10">{ab('recognition.subtitle')}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {RECOGNITION.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex gap-4">
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-heading font-bold text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <p className="text-amber-800 font-medium">{ab('recognition.disclaimer')}</p>
          </div>
        </section>

        {/* Valeurs */}
        <section>
          <h2 className="text-3xl font-heading font-bold text-primary mb-10">{ab('values.title')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="text-center p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-heading font-bold text-primary mb-2">{v.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-10 text-center shadow-sm">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-2xl font-heading font-bold text-primary mb-3">{ab('cta.title')}</h3>
          <p className="text-neutral-600 mb-6 max-w-lg mx-auto">{ab('cta.desc')}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <CTAButton href="/contact" variant="primary" size="lg">{ab('cta.contact')}</CTAButton>
            <CTAButton href="/certification" variant="outline" size="lg">{ab('cta.cert')}</CTAButton>
          </div>
        </section>

      </div>
    </div>
  );
}
