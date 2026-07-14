'use client';

import Link from 'next/link';
import CTAButton from '@/components/CTAButton';
import CertificationUserPanel from '@/components/CertificationUserPanel';
import { useLanguage } from '@/lib/LanguageContext';
import RequireAuth from '@/components/RequireAuth';
import Reveal from '@/components/Reveal';

const MODULE_DATA = [
  { id: 0, icon: '🖥️', key: 'it',         color: '#1A237E', bg: '#f0f3ff' },
  { id: 1, icon: '🌐', key: 'internet',    color: '#0277BD', bg: '#e1f5fe' },
  { id: 2, icon: '📧', key: 'email',       color: '#00695C', bg: '#e0f2f1' },
  { id: 3, icon: '📊', key: 'bureautique', color: '#E65100', bg: '#fff3e0' },
  { id: 4, icon: '🔒', key: 'cybersec',    color: '#B71C1C', bg: '#fde8e8' },
  { id: 5, icon: '🤖', key: 'ai',          color: '#4A148C', bg: '#f3e5f5' },
  { id: 6, icon: '💼', key: 'emploi',      color: '#1B5E20', bg: '#e8f5e9' },
];

export default function CertificationContent() {
  const { t } = useLanguage();
  const c = (k) => t(`certification.${k}`);

  const MODULES = MODULE_DATA.map((m) => ({
    ...m,
    name:        t(`home.moduleNames.${m.key}`),
    description: t(`home.moduleDescs.${m.key}`),
  }));

  const STATS = [
    { label: c('stats.questions'), value: '32'     },
    { label: c('stats.duration'),  value: '1h45'   },
    { label: c('stats.required'),  value: '60%'    },
    { label: c('stats.modules'),   value: '7'      },
  ];

  const GLOBAL_FEATS = [
    { icon: '📋', label: c('global.feat1') },
    { icon: '⏱',  label: c('global.feat2') },
    { icon: '✅', label: c('global.feat3') },
    { icon: '🔀', label: c('global.feat4') },
  ];

  const ATTESTS = [
    c('global.attest1'),
    c('global.attest2'),
    c('global.attest3'),
    c('global.attest4'),
    c('global.attest5'),
  ];

  const LEVELS = [
    { ...c('levels.advanced'), color: '#27AE60', bg: '#f0faf4', icon: '🏆' },
    { ...c('levels.mid'),      color: '#E67E22', bg: '#fff8f0', icon: '✅' },
    { ...c('levels.none'),     color: '#9E9E9E', bg: '#fafafa', icon: '📚' },
  ];

  return (
    <RequireAuth>
    <div className="min-h-screen bg-neutral-50">

      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-primary via-[#1e2d8a] to-[#283593] text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <div aria-hidden className="ph-float absolute -top-24 -right-16 w-80 h-80 bg-accent/25 rounded-full blur-3xl pointer-events-none" />
        <div aria-hidden className="ph-float-rev absolute -bottom-28 left-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="ph-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm font-medium mb-6 backdrop-blur-sm">
            <span>🏆</span> {c('badge')}
          </div>
          <h1 className="ph-in text-5xl font-heading font-bold mb-4 leading-tight" style={{ animationDelay: '80ms' }}>
            {c('title')}
          </h1>
          <p className="ph-in text-xl text-white/80 max-w-2xl mx-auto mb-4" style={{ animationDelay: '140ms' }}>
            {c('subtitle')}
          </p>
          <div className="ph-in flex items-center justify-center gap-1.5 mb-8" style={{ animationDelay: '200ms' }}>
            <span className="h-1 w-12 rounded-full bg-accent" />
            <span className="h-1 w-4 rounded-full bg-[#c9a227]" />
            <span className="h-1 w-2 rounded-full bg-secondary" />
          </div>
          <div className="ph-in flex flex-wrap justify-center gap-8 mt-10" style={{ animationDelay: '260ms' }}>
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-accent">{s.value}</p>
                <p className="text-sm text-white/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Panneau utilisateur */}
      <div className="py-8">
        <CertificationUserPanel />
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-20">

        {/* Certification Globale */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">{c('global.step')}</span>
            <h2 className="text-2xl font-heading font-bold text-primary">{c('global.title')}</h2>
            <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wide">{c('global.badge')}</span>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />
            <div className="p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <div className="text-5xl mb-4">🎓</div>
                  <h3 className="text-2xl font-heading font-bold text-primary mb-2">
                    {c('global.certTitle')}
                  </h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    {c('global.desc')}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {GLOBAL_FEATS.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-sm text-neutral-700">
                        <span>{item.icon}</span><span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <CTAButton href="/exam/global" variant="primary" size="lg">
                    {c('global.cta')}
                  </CTAButton>
                </div>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                    <p className="font-semibold text-blue-800 mb-3">{c('global.attest')}</p>
                    <ul className="space-y-2 text-sm text-blue-700">
                      {ATTESTS.map((a) => (
                        <li key={a} className="flex gap-2"><span>✓</span> {a}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                    💡 <strong>{c('global.tip')}</strong> {c('global.tipText')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications par Module */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">{c('modules.step')}</span>
            <h2 className="text-2xl font-heading font-bold text-primary">{c('modules.title')}</h2>
          </div>
          <p className="text-neutral-500 mb-8 ml-11">{c('modules.subtitle')}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((module, i) => (
              <Reveal
                key={module.id}
                delay={i * 70}
                className="lift bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
              >
                <div className="h-1" style={{ background: module.color }} />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: module.bg }}
                    >
                      {module.icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-neutral-800 leading-tight">{module.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{c('modules.moduleNum')} {module.id + 1}</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 mb-5 leading-relaxed">{module.description}</p>
                  <div className="flex gap-4 text-xs text-neutral-400 mb-5">
                    <span>📋 32 {c('modules.questions')}</span>
                    <span>⏱ 1h45</span>
                    <span>✅ 60% {c('modules.required')}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/exam/module/${module.id}`}
                      className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: module.color }}
                    >
                      {c('modules.take')}
                    </Link>
                    <Link
                      href={`/training/module/${module.id}`}
                      className="px-4 py-2.5 border border-neutral-200 text-neutral-500 rounded-xl text-sm font-medium hover:border-neutral-300 transition-colors"
                      title={t('training.module.practice')}
                    >
                      📚
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Niveaux */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">{c('levels.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LEVELS.map((item) => (
              <div key={item.level} className="rounded-2xl p-6" style={{ background: item.bg, border: `1px solid ${item.color}30` }}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="text-xl font-bold mb-1" style={{ color: item.color }}>{item.range}</p>
                <p className="font-semibold text-neutral-700 mb-2">{item.level}</p>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA bas */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-primary mb-2">{c('bottom.title')}</h3>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">{c('bottom.subtitle')}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <CTAButton href="/training" variant="outline" size="lg">{c('bottom.train')}</CTAButton>
            <CTAButton href="/evaluation" variant="outline" size="lg">{c('bottom.evaluate')}</CTAButton>
          </div>
        </section>

      </div>
    </div>
    </RequireAuth>
  );
}
