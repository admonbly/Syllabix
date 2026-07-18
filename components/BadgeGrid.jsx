'use client';

import { useLanguage } from '@/lib/LanguageContext';
import { MODULE_COMPETENCIES } from '@/lib/moduleCompetencies';
import { badgeLevelOf, badgeStyleOf, badgeLevelLabel, BADGE_LEVELS } from '@/lib/badges';

// Priorité d'affichage quand un module a plusieurs badges : la certification
// prime sur l'apprentissage (on montre le plus haut niveau atteint).
const LEVEL_RANK = {
  [BADGE_LEVELS.LEARNING]: 1,
  [BADGE_LEVELS.MODULE]: 2,
  [BADGE_LEVELS.GLOBAL]: 3,
};

// Noms bilingues et icônes dérivés de la source unique du référentiel
const MODULES = MODULE_COMPETENCIES.map((m) => ({
  id: m.moduleId, icon: m.icon, nameFr: m.nameFr, nameEn: m.nameEn,
}));

function formatDate(isoStr, locale) {
  if (!isoStr) return '';
  try {
    return new Date(isoStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return ''; }
}

/**
 * @param {{ badges: Array, compact?: boolean }} props
 * badges = [{ moduleId, moduleName, score, earnedAt }]
 * compact = true → bandeau horizontal (profil), false → grille complète (dashboard/certification)
 */
export default function BadgeGrid({ badges = [], compact = false }) {
  const { locale } = useLanguage();

  // Un badge par module = le plus haut niveau atteint (certif > apprentissage).
  // Les badges globaux (moduleId null) ne sont pas rendus dans cette grille par
  // module ; ils sont mis en avant ailleurs (certificat global).
  const earnedMap = {};
  badges.forEach((b) => {
    if (b == null || b.moduleId == null) return;
    const prev = earnedMap[b.moduleId];
    if (!prev || LEVEL_RANK[badgeLevelOf(b)] >= LEVEL_RANK[badgeLevelOf(prev)]) {
      earnedMap[b.moduleId] = b;
    }
  });

  if (compact) {
    const earned = MODULES.filter((m) => earnedMap[m.id]);
    if (earned.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-3">
        {earned.map((mod) => {
          const badge = earnedMap[mod.id];
          const st = badgeStyleOf(badge);
          return (
            <div
              key={mod.id}
              title={`${locale === 'fr' ? mod.nameFr : mod.nameEn} — ${badge.score}% · ${badgeLevelLabel(badge, locale)}`}
              className={`flex items-center gap-2 px-3 py-2 ${st.bg} border ${st.ring} rounded-xl`}
            >
              <div className={`w-8 h-8 rounded-full ${st.dot} flex items-center justify-center text-base flex-shrink-0`}>
                {mod.icon}
              </div>
              <div>
                <p className={`text-xs font-display font-bold ${st.chipText} leading-tight`}>
                  {locale === 'fr' ? mod.nameFr : mod.nameEn}
                </p>
                <p className="text-[10px] text-neutral-500">{badge.score}%</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {MODULES.map((mod) => {
        const badge = earnedMap[mod.id];
        const earned = !!badge;
        const st = earned ? badgeStyleOf(badge) : null;

        return (
          <div
            key={mod.id}
            className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all duration-200 ${
              earned
                ? `${st.ring} ${st.bg}`
                : 'border-neutral-200 bg-neutral-50 opacity-40'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 shadow-sm ${
              earned ? st.dot : 'bg-neutral-200'
            }`}>
              {earned ? mod.icon : '🔒'}
            </div>

            <p className={`text-xs font-display font-bold leading-tight mb-1 ${
              earned ? 'text-primary' : 'text-neutral-400'
            }`}>
              {locale === 'fr' ? mod.nameFr : mod.nameEn}
            </p>

            {earned ? (
              <>
                <span className={`text-[11px] font-bold ${st.chipText}`}>{badge.score}%</span>
                <span className={`text-[9px] font-semibold mt-0.5 px-1.5 py-0.5 rounded-full ${st.chipBg} ${st.chipText}`}>
                  {badgeLevelLabel(badge, locale)}
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5">
                  {formatDate(badge.earnedAt, locale)}
                </span>
              </>
            ) : (
              <span className="text-[10px] text-neutral-400">
                {locale === 'fr' ? 'Non obtenu' : 'Not earned'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
