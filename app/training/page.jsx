'use client';

import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { quizData } from '@/lib/quizData';
import { useLanguage } from '@/lib/LanguageContext';

const MODULE_ICONS = ['💻', '🌐', '📧', '📊', '🔒', '🤖', '💼'];

export default function TrainingPage() {
  const { t } = useLanguage();
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
            {quizData.map((module) => (
              <Link key={module.id} href={`/training/module/${module.id}`} className="group">
                <Card className="p-6 h-full cursor-pointer border-2 border-neutral-200 group-hover:border-secondary group-hover:shadow-lg transition-all">
                  <div className="text-3xl mb-3">{MODULE_ICONS[module.id] ?? '📖'}</div>
                  <p className="font-heading font-bold text-primary mb-1">{module.module}</p>
                  <p className="text-xs text-neutral-500 mb-4">{module.questions.length} {tr('modules.available')}</p>
                  <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-full group-hover:bg-secondary group-hover:text-white transition-colors">
                    {tr('modules.train')}
                  </span>
                </Card>
              </Link>
            ))}

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

      </div>
    </section>
  );
}
