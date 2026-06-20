'use client';

import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { quizData } from '@/lib/quizData';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Search, Database, BarChart2, Mail, Share2, Users, Briefcase,
  FileText, Image, Code2, ShieldCheck, Laptop, Heart,
  Wrench, Building2, Smartphone,
} from 'lucide-react';

const DOMAINS = [
  {
    id: 1,
    color: 'bg-blue-50 border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-800',
    titleColor: 'text-blue-800',
    fr: 'Informations & données',
    en: 'Information & data',
    competences: [
      { icon: Search,    fr: 'Recherche & veille d\'information', en: 'Research & information monitoring' },
      { icon: Database,  fr: 'Gestion des données',               en: 'Data management' },
      { icon: BarChart2, fr: 'Traitement & analyse',              en: 'Processing & analysis' },
    ],
  },
  {
    id: 2,
    color: 'bg-green-50 border-green-200',
    badgeColor: 'bg-green-100 text-green-800',
    titleColor: 'text-green-800',
    fr: 'Communication & collaboration',
    en: 'Communication & collaboration',
    competences: [
      { icon: Mail,      fr: 'Email & messagerie',                    en: 'Email & messaging' },
      { icon: Share2,    fr: 'Partage & publication',                 en: 'Sharing & publishing' },
      { icon: Users,     fr: 'Collaboration à distance',              en: 'Remote collaboration' },
      { icon: Briefcase, fr: 'Insertion professionnelle numérique',   en: 'Digital career readiness' },
    ],
  },
  {
    id: 3,
    color: 'bg-orange-50 border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-800',
    titleColor: 'text-orange-800',
    fr: 'Création de contenu',
    en: 'Content creation',
    competences: [
      { icon: FileText, fr: 'Documents & présentations',         en: 'Documents & presentations' },
      { icon: Image,    fr: 'Contenus visuels & médias',         en: 'Visual content & media' },
      { icon: Code2,    fr: 'Automatisation & notions de code',  en: 'Automation & coding basics' },
    ],
  },
  {
    id: 4,
    color: 'bg-red-50 border-red-200',
    badgeColor: 'bg-red-100 text-red-800',
    titleColor: 'text-red-800',
    fr: 'Protection & sécurité',
    en: 'Protection & security',
    competences: [
      { icon: ShieldCheck, fr: 'Vie privée & données personnelles', en: 'Privacy & personal data' },
      { icon: Laptop,      fr: 'Sécurité des équipements',          en: 'Device security' },
      { icon: Heart,       fr: 'Bien-être numérique',               en: 'Digital wellbeing' },
    ],
  },
  {
    id: 5,
    color: 'bg-purple-50 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-800',
    titleColor: 'text-purple-800',
    fr: 'Environnement numérique',
    en: 'Digital environment',
    competences: [
      { icon: Wrench,     fr: 'Résolution de problèmes techniques',            en: 'Technical problem solving' },
      { icon: Building2,  fr: 'Services publics numériques',                   en: 'Digital public services' },
      { icon: Smartphone, fr: 'Écosystème numérique africain (Mobile Money…)', en: 'African digital ecosystem (Mobile Money…)' },
    ],
  },
];

const MODULE_ICONS = ['💻', '🌐', '📧', '📊', '🔒', '🤖', '💼'];

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

        {/* ─── Référentiel des 16 compétences ─────────────── */}
        <div className="mt-20 pt-16 border-t border-neutral-200">
          <div className="text-center mb-12">
            <span className="section-tag bg-primary/10 text-primary mb-4 inline-block">
              {locale === 'fr' ? 'Référentiel complet' : 'Full competency framework'}
            </span>
            <h2 className="text-3xl font-heading font-bold text-primary mb-3">
              {locale === 'fr' ? '16 compétences numériques' : '16 digital competencies'}
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto text-sm">
              {locale === 'fr'
                ? 'Notre référentiel complet, adapté au contexte africain. Ces modules arrivent bientôt.'
                : 'Our full competency framework, adapted for the African context. These modules are coming soon.'}
            </p>
          </div>

          <div className="space-y-8">
            {DOMAINS.map((domain) => (
              <div key={domain.id}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${domain.color} ${domain.badgeColor}`}>
                    {locale === 'fr' ? domain.fr : domain.en}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {domain.competences.length} {locale === 'fr' ? 'compétences' : 'competencies'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {domain.competences.map((comp, idx) => {
                    const Icon = comp.icon;
                    return (
                      <div
                        key={idx}
                        className={`relative p-5 rounded-xl border-2 ${domain.color} opacity-60 cursor-not-allowed select-none`}
                      >
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 bg-neutral-200 text-neutral-500 text-[10px] font-semibold rounded-full">
                            {locale === 'fr' ? 'Bientôt' : 'Coming soon'}
                          </span>
                        </div>
                        <Icon className="w-6 h-6 mb-3 text-neutral-400" strokeWidth={1.5} />
                        <p className={`font-display font-semibold text-sm ${domain.titleColor} leading-snug pr-12`}>
                          {locale === 'fr' ? comp.fr : comp.en}
                        </p>
                      </div>
                    );
                  })}
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
