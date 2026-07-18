'use client';

import Link from 'next/link';
import { MODULE_COMPETENCIES } from '@/lib/moduleCompetencies';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Point d'entrée public du DÉFI — accroche sans friction du moteur viral.
 * Aucune inscription requise : l'utilisateur choisit un thème et teste son niveau.
 */
export default function DefiLandingPage() {
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary to-[#283593] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium mb-6">
            <span>⚡</span> {locale === 'fr' ? 'Sans inscription · Gratuit' : 'No sign-up · Free'}
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold mb-5 leading-tight">
            {locale === 'fr'
              ? 'Teste ton niveau numérique en 15 min'
              : 'Test your digital skills in 15 min'}
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
            {locale === 'fr'
              ? 'Choisis un thème, réponds à 10 questions, et décroche ton badge. Crée ensuite ton compte gratuit pour le garder.'
              : 'Pick a topic, answer 10 questions, earn your badge. Then create your free account to keep it.'}
          </p>
        </div>
      </section>

      {/* Choix du thème */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-xl font-heading font-bold text-primary mb-6 text-center">
          {locale === 'fr' ? 'Choisis ton défi' : 'Pick your challenge'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULE_COMPETENCIES.map((mod) => (
            <Link
              key={mod.moduleId}
              href={`/defi/${mod.moduleId}`}
              className="group bg-white rounded-2xl border border-neutral-100 p-6 shadow-card hover:shadow-card-hover hover:border-accent/30 transition-all flex items-center gap-4"
            >
              <span className="text-3xl flex-shrink-0">{mod.icon}</span>
              <div className="flex-1">
                <p className="font-heading font-bold text-primary leading-tight">
                  {locale === 'fr' ? mod.nameFr : mod.nameEn}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {locale === 'fr' ? '10 questions · ~15 min' : '10 questions · ~15 min'}
                </p>
              </div>
              <span className="text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all">→</span>
            </Link>
          ))}
        </div>

        <p className="text-center text-sm text-neutral-500 mt-10">
          {locale === 'fr' ? 'Déjà un compte ?' : 'Already have an account?'}{' '}
          <Link href="/auth/login" className="text-accent font-semibold hover:underline">
            {locale === 'fr' ? 'Se connecter' : 'Log in'}
          </Link>
        </p>
      </section>
    </div>
  );
}
