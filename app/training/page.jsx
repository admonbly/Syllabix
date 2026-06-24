'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

import { MODULE_COMPETENCIES } from '@/lib/moduleCompetencies';
import { getAllModules } from '@/lib/quizService';

export default function TrainingPage() {
  const { locale, t } = useLanguage();
  const tr = (k) => t(`training.${k}`);
  const [questionCounts, setQuestionCounts] = useState({});

  useEffect(() => {
    getAllModules().then((modules) => {
      const counts = {};
      modules.forEach((m) => { counts[m.id] = m.questions?.length ?? 0; });
      setQuestionCounts(counts);
    });
  }, []);

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-heading font-bold text-primary mb-4">{tr('title')}</h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">{tr('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Canal 1 */}
          <Card className="p-7 border-2 border-secondary/40 bg-green-50 flex flex-col">
            <div className="text-4xl mb-3">📚</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-secondary text-white text-xs font-bold rounded-full">{tr('canal1.label')}</span>
              <span className="text-xs text-secondary font-semibold">{tr('canal1.tag')}</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-primary mb-2">{tr('canal1.title')}</h2>
            <p className="text-sm text-neutral-600 mb-4 flex-1">{tr('canal1.desc')}</p>
            <ul className="space-y-1 text-sm text-neutral-600 mb-5">
              <li>{tr('canal1.feat1')}</li>
              <li>{tr('canal1.feat2')}</li>
              <li>{tr('canal1.feat3')}</li>
              <li>{tr('canal1.feat4')}</li>
            </ul>
            <CTAButton href="#modules" variant="secondary" size="md" className="w-full">{tr('canal1.cta')}</CTAButton>
          </Card>

          {/* Canal 2 */}
          <Card className="p-7 border-2 border-accent/40 bg-orange-50 flex flex-col">
            <div className="text-4xl mb-3">📊</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-accent text-white text-xs font-bold rounded-full">{tr('canal2.label')}</span>
              <span className="text-xs text-accent font-semibold">{tr('canal2.tag')}</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-primary mb-2">{tr('canal2.title')}</h2>
            <p className="text-sm text-neutral-600 mb-4 flex-1">{tr('canal2.desc')}</p>
            <ul className="space-y-1 text-sm text-neutral-600 mb-5">
              <li>{tr('canal2.feat1')}</li>
              <li>{tr('canal2.feat2')}</li>
              <li>{tr('canal2.feat3')}</li>
              <li>{tr('canal2.feat4')}</li>
            </ul>
            <CTAButton href="/evaluation" variant="primary" size="md" className="w-full">{tr('canal2.cta')}</CTAButton>
          </Card>

          {/* Canal 3 */}
          <Card className="p-7 border-2 border-primary/40 bg-blue-50 flex flex-col">
            <div className="text-4xl mb-3">🏆</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">{tr('canal3.label')}</span>
              <span className="text-xs text-primary font-semibold">{tr('canal3.tag')}</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-primary mb-2">{tr('canal3.title')}</h2>
            <p className="text-sm text-neutral-600 mb-4 flex-1">{tr('canal3.desc')}</p>
            <ul className="space-y-1 text-sm text-neutral-600 mb-5">
              <li>{tr('canal3.feat1')}</li>
              <li>{tr('canal3.feat2')}</li>
              <li>{tr('canal3.feat3')}</li>
              <li>{tr('canal3.feat4')}</li>
            </ul>
            <CTAButton href="/certification" variant="outline" size="md" className="w-full">{tr('canal3.cta')}</CTAButton>
          </Card>
        </div>

        {/* ─── Modules + compétences — section unique ─────── */}
        <div id="modules">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-primary mb-2">{tr('modules.title')}</h2>
            <p className="text-neutral-500 text-sm">
              {locale === 'fr'
                ? 'Chaque module développe 3 compétences concrètes, validées par un examen officiel.'
                : 'Each module develops 3 concrete competencies, validated by an official exam.'}
            </p>
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
                        {questionCounts[mod.moduleId] != null
                          ? `${questionCounts[mod.moduleId]} ${tr('modules.available')}`
                          : '…'}{' '}
                        · {locale === 'fr' ? '3 compétences' : '3 competencies'}
                      </p>
                    </div>
                    <Link
                      href={`/training/module/${mod.moduleId}`}
                      className={`flex-shrink-0 text-xs font-bold px-5 py-2.5 rounded-xl ${mod.color.badge} hover:opacity-80 transition-opacity`}
                    >
                      {locale === 'fr' ? "S'entraîner →" : 'Practice →'}
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
    </section>
  );
}
