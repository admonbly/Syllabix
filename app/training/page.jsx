'use client';

import CTAButton from '@/components/CTAButton';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { MODULE_COMPETENCIES } from '@/lib/moduleCompetencies';

export default function TrainingPage() {
  const { locale, t } = useLanguage();
  const tr = (k) => t(`training.${k}`);

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title={tr('title')}
        subtitle={tr('subtitle')}
        icon="🏋️"
        badge={tr('badgeFree')}
      />

      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* ─── Les 2 modes ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">

          {/* Entraînement */}
          <div className="rounded-2xl border-2 border-secondary/30 bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-br from-secondary/10 to-green-50 px-7 pt-7 pb-5">
              <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                </svg>
              </div>
              <span className="inline-block px-2.5 py-0.5 bg-secondary text-white text-[11px] font-bold rounded-full uppercase tracking-wide mb-2">{tr('practice.badge')}</span>
              <h2 className="text-2xl font-heading font-bold text-primary mb-1">
                {tr('practice.title')}
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {tr('practice.desc')}
              </p>
            </div>
            <div className="px-7 py-5 flex-1 flex flex-col">
              <ul className="space-y-2.5 mb-6 flex-1">
                {[tr('practice.feat1'), tr('practice.feat2'), tr('practice.feat3'), tr('practice.feat4')].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-700">
                    <svg className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <CTAButton href="#modules" variant="secondary" size="md" className="w-full">
                {tr('practice.cta')}
              </CTAButton>
            </div>
          </div>

          {/* Évaluation de niveau */}
          <div className="rounded-2xl border-2 border-accent/30 bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-br from-accent/10 to-orange-50 px-7 pt-7 pb-5">
              <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2.5 py-0.5 bg-accent text-white text-[11px] font-bold rounded-full uppercase tracking-wide">{tr('evaluation.badge')}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-semibold rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  {tr('evaluation.recommend')}
                </span>
              </div>
              <h2 className="text-2xl font-heading font-bold text-primary mb-1">
                {tr('evaluation.title')}
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {tr('evaluation.desc')}
              </p>
            </div>
            <div className="px-7 py-5 flex-1 flex flex-col">
              <ul className="space-y-2.5 mb-6 flex-1">
                {[tr('evaluation.feat1'), tr('evaluation.feat2'), tr('evaluation.feat3'), tr('evaluation.feat4')].map((feat, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-sm ${i === 3 ? 'text-neutral-400' : 'text-neutral-700'}`}>
                    <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${i === 3 ? 'text-neutral-300' : 'text-accent'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <CTAButton href="/evaluation" variant="primary" size="md" className="w-full">
                {tr('evaluation.cta')}
              </CTAButton>
            </div>
          </div>

        </div>

        {/* ─── Modules + compétences — section unique ─────── */}
        <div id="modules">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-primary mb-2">{tr('modulesTitle')}</h2>
            <p className="text-neutral-500 text-sm">{tr('modulesSubtitle')}</p>
          </div>

          <div className="space-y-4">
            {MODULE_COMPETENCIES.map((mod) => {
              return (
                <div
                  key={mod.moduleId}
                  className={`rounded-2xl border-2 ${mod.color.bg} ${mod.color.border} overflow-hidden hover:shadow-md transition-shadow`}
                >
                  {/* En-tête : navigation */}
                  <div className="flex items-center gap-4 px-6 py-4 border-b border-black/5">
                    <span className="text-3xl flex-shrink-0">{mod.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-heading font-bold text-base ${mod.color.text}`}>
                        {locale === 'fr' ? mod.nameFr : mod.nameEn}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {t('training.module.competenciesLabel')}
                      </p>
                    </div>
                    <Link
                      href={`/training/module/${mod.moduleId}`}
                      className={`flex-shrink-0 text-xs font-bold px-5 py-2.5 rounded-xl ${mod.color.badge} hover:opacity-80 transition-opacity`}
                    >
                      {t('training.module.practice')}
                    </Link>
                  </div>

                  {/* Compétences */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/5">
                    {mod.competences.map((comp, i) => (
                      <div key={i} className="px-6 py-4 flex gap-3 items-start">
                        <span className="text-xl flex-shrink-0 mt-0.5">{comp.emoji}</span>
                        <div>
                          <p className={`text-sm font-semibold ${mod.color.text} leading-snug mb-0.5`}>
                            {locale === 'fr' ? comp.fr : comp.en}
                          </p>
                          <p className="text-xs text-neutral-500 leading-relaxed">
                            {locale === 'fr' ? comp.desc_fr : comp.desc_en}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Mode mixte */}
            <Link href="/training/mixed" className="group block">
              <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 group-hover:border-accent group-hover:bg-orange-50 transition-all overflow-hidden">
                <div className="flex items-center gap-4 px-6 py-5">
                  <span className="text-3xl flex-shrink-0">🎲</span>
                  <div className="flex-1">
                    <p className="font-heading font-bold text-primary">{tr('modules.mixed.title')}</p>
                    <p className="text-xs text-neutral-500">{tr('modules.mixed.subtitle')}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-bold px-5 py-2.5 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    {tr('modules.mixed.cta')} →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <p className="text-center text-xs text-neutral-400 mt-10">
            {locale === 'fr'
              ? '✦ Référentiel inspiré du cadre européen DigComp, adapté aux réalités numériques africaines'
              : '✦ Framework inspired by the European DigComp standard, adapted to African digital realities'}
          </p>

        </div>

      </div>
    </div>
  );
}
