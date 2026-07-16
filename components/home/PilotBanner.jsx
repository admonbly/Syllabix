'use client';

import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { GraduationCap, Building2, ArrowRight } from 'lucide-react';

/**
 * Bandeau « programme pilote » — une seule section discrète, en bas de page.
 *
 * Stratégie assumée (inspirée de Pix) : l'accueil parle à l'APPRENANT. Les
 * écoles, universités, grandes écoles et entreprises sont un canal de
 * croissance de la communauté de certifiés, pas la cible de cette page.
 * D'où : une bande, pas une section héroïque.
 *
 * La plateforme est en lancement — on l'assume et on en fait un argument :
 * un partenaire pilote a un statut valorisant.
 */
export default function PilotBanner({ locale = 'fr' }) {
  const isFr = locale === 'fr';

  return (
    <section className="py-16 bg-white border-t border-neutral-100">
      <div className="container-max">
        <Reveal direction="up">
          <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-surface p-8 sm:p-10">
            {/* Halo décoratif discret */}
            <div
              aria-hidden
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"
            />

            <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-display font-semibold uppercase tracking-widest">
                    {isFr ? 'Programme pilote' : 'Pilot programme'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-3 leading-tight">
                  {isFr
                    ? 'Votre école, université ou entreprise peut rejoindre le programme pilote'
                    : 'Your school, university or company can join the pilot programme'}
                </h2>

                <p className="text-neutral-600 leading-relaxed max-w-2xl">
                  {isFr
                    ? 'Syllabix est en lancement. Les premiers établissements et entreprises partenaires reçoivent un code d’accès pour leurs membres, un tableau de bord de suivi par classe ou direction, et un reporting par compétence.'
                    : 'Syllabix is launching. Our first partner institutions and companies get an access code for their members, a dashboard to follow progress by class or department, and competency-level reporting.'}
                </p>

                <div className="flex flex-wrap gap-4 mt-5 text-sm text-neutral-500">
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" aria-hidden="true" />
                    {isFr ? 'Écoles, universités, grandes écoles' : 'Schools, universities, higher education'}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" aria-hidden="true" />
                    {isFr ? 'Entreprises' : 'Companies'}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Link
                  href="/partenariats"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-display font-semibold hover:bg-primary-light transition-colors active:scale-[0.98] min-h-[44px]"
                >
                  {isFr ? 'Devenir partenaire' : 'Become a partner'}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
