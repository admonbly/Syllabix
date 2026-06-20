'use client';

import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { quizData } from '@/lib/quizData';

const MODULE_ICONS = ['💻', '🌐', '📧', '📊', '🔒', '🤖', '💼'];

export default function TrainingPage() {
  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-heading font-bold text-primary mb-4">📚 Espace d'apprentissage</h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Apprenez à votre rythme, sans pression, sans timer. Explorez les modules, lisez les explications et recommencez autant que vous voulez.
          </p>
        </div>

        {/* 3 canaux visuels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Canal 1 — Entraînement */}
          <Card className="p-7 border-2 border-secondary/40 bg-green-50 flex flex-col">
            <div className="text-4xl mb-3">📚</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-secondary text-white text-xs font-bold rounded-full">CANAL 1</span>
              <span className="text-xs text-secondary font-semibold">Apprentissage</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-primary mb-2">Entraînement</h2>
            <p className="text-sm text-neutral-600 mb-4 flex-1">
              Pratiquez par module, à votre rythme. Chaque réponse est expliquée. Navigation libre entre les questions.
            </p>
            <ul className="space-y-1 text-sm text-neutral-600 mb-5">
              <li>✅ 5 questions par session</li>
              <li>✅ Pas de timer</li>
              <li>✅ Explication après chaque réponse</li>
              <li>✅ Navigation libre</li>
            </ul>
            <CTAButton href="#modules" variant="secondary" size="md" className="w-full">
              Choisir un module ↓
            </CTAButton>
          </Card>

          {/* Canal 2 — Évaluation */}
          <Card className="p-7 border-2 border-accent/40 bg-orange-50 flex flex-col">
            <div className="text-4xl mb-3">📊</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-accent text-white text-xs font-bold rounded-full">CANAL 2</span>
              <span className="text-xs text-accent font-semibold">Évaluation</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-primary mb-2">Évaluation de niveau</h2>
            <p className="text-sm text-neutral-600 mb-4 flex-1">
              Testez votre niveau global avant la certification. 12 questions, 10 minutes. Vous saurez où vous en êtes.
            </p>
            <ul className="space-y-1 text-sm text-neutral-600 mb-5">
              <li>📊 12 questions mixtes</li>
              <li>⏱ 10 minutes chrono</li>
              <li>🎯 Score indicatif de niveau</li>
              <li>❌ Pas de certificat</li>
            </ul>
            <CTAButton href="/evaluation" variant="primary" size="md" className="w-full">
              Démarrer l'évaluation →
            </CTAButton>
          </Card>

          {/* Canal 3 — Certification */}
          <Card className="p-7 border-2 border-primary/40 bg-blue-50 flex flex-col">
            <div className="text-4xl mb-3">🏆</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">CANAL 3</span>
              <span className="text-xs text-primary font-semibold">Certification officielle</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-primary mb-2">Certification</h2>
            <p className="text-sm text-neutral-600 mb-4 flex-1">
              L'examen officiel qui donne droit à votre certificat Syllabix reconnu. 35 questions, 35 minutes.
            </p>
            <ul className="space-y-1 text-sm text-neutral-600 mb-5">
              <li>🏆 35 questions</li>
              <li>⏱ 35 minutes strict</li>
              <li>✅ Certificat si ≥ 60%</li>
              <li>🔐 Connexion requise</li>
            </ul>
            <CTAButton href="/certification" variant="outline" size="md" className="w-full">
              Voir la certification →
            </CTAButton>
          </Card>
        </div>

        {/* Sélection module entraînement */}
        <div id="modules">
          <h2 className="text-3xl font-heading font-bold text-primary mb-2 text-center">
            Choisir un module d'entraînement
          </h2>
          <p className="text-center text-neutral-500 mb-8">Sans timer · Explications incluses · Gratuit</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {quizData.map((module) => (
              <Link key={module.id} href={`/training/module/${module.id}`} className="group">
                <Card className="p-6 h-full cursor-pointer border-2 border-neutral-200 group-hover:border-secondary group-hover:shadow-lg transition-all">
                  <div className="text-3xl mb-3">{MODULE_ICONS[module.id] ?? '📖'}</div>
                  <p className="font-heading font-bold text-primary mb-1">{module.module}</p>
                  <p className="text-xs text-neutral-500 mb-4">{module.questions.length} questions disponibles</p>
                  <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-full group-hover:bg-secondary group-hover:text-white transition-colors">
                    S'entraîner →
                  </span>
                </Card>
              </Link>
            ))}

            {/* Entraînement mixte */}
            <Link href="/training/mixed" className="group">
              <Card className="p-6 h-full cursor-pointer border-2 border-dashed border-neutral-300 group-hover:border-accent group-hover:shadow-lg transition-all bg-neutral-50">
                <div className="text-3xl mb-3">🎲</div>
                <p className="font-heading font-bold text-primary mb-1">Tous les modules</p>
                <p className="text-xs text-neutral-500 mb-4">Questions mélangées</p>
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full group-hover:bg-accent group-hover:text-white transition-colors">
                  Mode mixte →
                </span>
              </Card>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
