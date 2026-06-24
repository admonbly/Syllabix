'use client';

import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { quizData } from '@/lib/quizData';
import { useLanguage } from '@/lib/LanguageContext';
import { MODULE_COMPETENCIES } from '@/lib/moduleCompetencies';

const COMP_MAP = Object.fromEntries(MODULE_COMPETENCIES.map((m) => [m.moduleId, m]));

export default function TrainingPage() {
  const { locale, t } = useLanguage();
  const tr = (k) => t(`training.${k}`);

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

        <div id="modules">
          <h2 className="text-3xl font-heading font-bold text-primary mb-2 text-center">{tr('modules.title')}</h2>
          <p className="text-center text-neutral-500 mb-8">{tr('modules.subtitle')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {quizData.map((module) => {
              const comp = COMP_MAP[module.id];
              return (
                <Link key={module.id} href={`/training/module/${module.id}`} className="group">
                  <Card className={`p-6 h-full cursor-pointer border-2 border-neutral-200 group-hover:shadow-lg transition-all flex flex-col ${comp ? `group-hover:${comp.color.border}` : 'group-hover:border-secondary'}`}>
                    <div className="text-3xl mb-3">{comp?.icon ?? '📖'}</div>
                    <p className="font-heading font-bold text-primary mb-1">{module.module}</p>
                    <p className="text-xs text-neutral-500 mb-3">{module.questions.length} {tr('modules.available')}</p>

                    {/* Compétences développées */}
                    {comp && (
                      <div className="flex flex-col gap-1.5 mb-4 flex-1">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-0.5">
                          {locale === 'fr' ? 'Tu vas apprendre à' : 'You will learn to'}
                        </p>
                        {comp.competences.map((c, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-sm leading-none mt-0.5">{c.emoji}</span>
                            <span className="text-xs text-neutral-600 leading-snug">
                              {locale === 'fr' ? c.fr : c.en}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full transition-colors mt-auto ${comp ? `${comp.color.badge} group-hover:bg-secondary group-hover:text-white` : 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white'}`}>
                      {tr('modules.train')}
                    </span>
                  </Card>
                </Link>
              );
            })}

            <Link href="/training/mixed" className="group">
              <Card className="p-6 h-full cursor-pointer border-2 border-dashed border-neutral-300 group-hover:border-accent group-hover:shadow-lg transition-all bg-neutral-50">
                <div className="text-3xl mb-3">🎲</div>
                <p className="font-heading font-bold text-primary mb-1">{tr('modules.mixed.title')}</p>
                <p className="text-xs text-neutral-500 mb-4">{tr('modules.mixed.subtitle')}</p>
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full group-hover:bg-accent group-hover:text-white transition-colors">
                  {tr('modules.mixed.cta')}
                </span>
              </Card>
            </Link>
          </div>
        </div>

        {/* ─── Compétences par module ─────────────────────── */}
        <div className="mt-20 pt-16 border-t border-neutral-200">
          <div className="text-center mb-12">
            <span className="section-tag bg-primary/10 text-primary mb-4 inline-block">
              {locale === 'fr' ? '21 compétences certifiées' : '21 certified competencies'}
            </span>
            <h2 className="text-3xl font-heading font-bold text-primary mb-3">
              {locale === 'fr' ? 'Ce que tu vas maîtriser' : 'What you will master'}
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto text-sm">
              {locale === 'fr'
                ? 'Chaque module développe 3 compétences concrètes, validées par un examen officiel.'
                : 'Each module develops 3 concrete competencies, validated by an official exam.'}
            </p>
          </div>

          <div className="space-y-5">
            {MODULE_COMPETENCIES.map((mod) => (
              <div
                key={mod.moduleId}
                className={`rounded-2xl border-2 ${mod.color.bg} ${mod.color.border} overflow-hidden`}
              >
                {/* En-tête module */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-black/5">
                  <span className="text-2xl">{mod.icon}</span>
                  <div className="flex-1">
                    <p className={`font-heading font-bold ${mod.color.text}`}>
                      {locale === 'fr' ? mod.nameFr : mod.nameEn}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {locale === 'fr' ? '3 compétences' : '3 competencies'}
                    </p>
                  </div>
                  <Link
                    href={`/training/module/${mod.moduleId}`}
                    className={`text-xs font-semibold px-4 py-2 rounded-lg ${mod.color.badge} hover:opacity-80 transition-opacity`}
                  >
                    {locale === 'fr' ? "S'entraîner →" : 'Practice →'}
                  </Link>
                </div>

                {/* Grille des compétences */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-black/5">
                  {mod.competences.map((comp, i) => (
                    <div key={i} className="px-6 py-4 flex gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">{comp.emoji}</span>
                      <div>
                        <p className={`text-sm font-semibold ${mod.color.text} leading-snug mb-1`}>
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
            ))}
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
