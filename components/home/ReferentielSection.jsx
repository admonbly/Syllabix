'use client';

import Reveal from '@/components/Reveal';
import { PIX_DOMAINS, PIX_COMPETENCIES } from '@/lib/pixMapping';
import { Search, MessagesSquare, PenTool, ShieldCheck, Monitor } from 'lucide-react';

/**
 * Le référentiel d'évaluation — 5 domaines, 16 compétences.
 *
 * C'est la crédibilité réelle de Syllabix : ce qui est évalué, précisément.
 * Cette section remplace les métriques d'usage inventées (« 5000 apprenants »,
 * « 98 % de satisfaction ») par de la matière vérifiable dans le produit.
 * Les données viennent de lib/pixMapping.js — source unique, donc jamais
 * désynchronisée de ce que la plateforme évalue vraiment.
 */

const DOMAIN_ICONS = {
  INFORMATION_DONNEES:         Search,
  COMMUNICATION_COLLABORATION: MessagesSquare,
  CREATION_CONTENU:            PenTool,
  PROTECTION_SECURITE:         ShieldCheck,
  ENVIRONNEMENT_NUMERIQUE:     Monitor,
};

export default function ReferentielSection({ locale = 'fr', tag, title, subtitle }) {
  const isFr = locale === 'fr';

  return (
    <section className="py-24 bg-white">
      <div className="container-max">
        <Reveal direction="up" className="mb-14 text-center">
          <span className="section-tag bg-primary/8 text-primary mb-4 block w-fit mx-auto">
            {tag}
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary mt-3 mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PIX_DOMAINS.map((domain, i) => {
            const Icon = DOMAIN_ICONS[domain.code] ?? Search;
            const competencies = PIX_COMPETENCIES.filter((c) => c.domainId === domain.id);

            return (
              <Reveal key={domain.id} direction="up" delay={i * 80}>
                <div className="lift h-full bg-surface rounded-2xl border border-neutral-100 p-6 hover:border-primary/20 transition-colors">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-primary leading-tight">
                        {isFr ? domain.nameFr : domain.nameEn}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {competencies.length} {isFr ? 'compétences' : 'competencies'}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-1.5">
                    {competencies.map((c) => (
                      <li key={c.code} className="flex gap-2 text-sm text-neutral-600 leading-snug">
                        <span className="font-mono text-xs text-accent flex-shrink-0 pt-0.5">{c.code}</span>
                        <span>{isFr ? c.nameFr : c.nameEn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}

          {/* Carte de synthèse — ferme la grille de 6 cases proprement */}
          <Reveal direction="up" delay={5 * 80}>
            <div className="h-full rounded-2xl p-6 bg-primary text-white flex flex-col justify-center">
              <p className="text-5xl font-display font-extrabold leading-none mb-2">
                {PIX_COMPETENCIES.length}
              </p>
              <p className="text-white/70 text-sm leading-relaxed">
                {isFr
                  ? 'compétences évaluées, réparties sur 5 domaines et 7 modules — avec des épreuves pratiques sur de vrais fichiers.'
                  : 'competencies assessed across 5 domains and 7 modules — including hands-on tasks on real files.'}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
