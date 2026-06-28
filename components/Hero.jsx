'use client';
import CTAButton from '@/components/CTAButton';
import CountUp from '@/components/CountUp';
import { CheckCircle2, Circle, Award, ArrowRight } from 'lucide-react';

const moduleProgress = [
  { label: 'IT & Ordinateur',   done: true  },
  { label: 'Internet', done: true  },
  { label: 'Email',             done: true  },
  { label: 'Bureautique',       done: false, active: true },
  { label: 'Cybersécurité',     done: false },
];

const heroStats = [
  { value: 5000, suffix: '+',   label: 'Apprenants' },
  { value: 7,    suffix: '',    label: 'Modules' },
  { value: 98,   suffix: '%',   label: 'Satisfaction' },
];

export default function Hero({ title, subtitle, cta }) {
  return (
    <section className="relative overflow-hidden hero-bg" aria-label="Bannière principale">
      {/* Dot grid */}
      <div aria-hidden className="absolute inset-0 hero-dots pointer-events-none" />

      {/* Glow center */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-primary-light/25 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── Left: copy ────────────────────────────── */}
          <div>
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 border border-accent/25 mb-8 anim-fade-in delay-0">
              <span className="w-2 h-2 rounded-full bg-accent" style={{animation:'pulse-dot 1.4s ease-in-out infinite'}} />
              <span className="text-accent text-xs font-display font-semibold tracking-widest uppercase">
                Plateforme leader en Afrique
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white leading-[1.04] mb-6 anim-fade-up delay-100">
              {title ?? (
                <>
                  Certifiez vos<br />
                  <span className="gradient-text">compétences</span><br />
                  numériques
                </>
              )}
            </h1>

            {subtitle && (
              <p className="text-lg text-white/65 leading-relaxed mb-10 max-w-lg anim-fade-up delay-200">
                {subtitle}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-14 anim-fade-up delay-300">
              {cta ?? (
                <>
                  <CTAButton href="/certification" variant="primary" size="lg">
                    Passer la certification
                    <ArrowRight className="w-4 h-4" />
                  </CTAButton>
                  <CTAButton href="/certification/presentation" variant="outline-white" size="lg">
                    Découvrir les modules
                  </CTAButton>
                </>
              )}
            </div>

            {/* Stats row — animated counters */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 anim-fade-up delay-400">
              {heroStats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                    <CountUp value={s.value} suffix={s.suffix} duration={2400} />
                  </p>
                  <p className="text-xs text-white/40 mt-0.5 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: floating certificate card ─────── */}
          <div className="hidden lg:flex justify-center items-center relative anim-slide-right delay-300">
            {/* Depth cards behind */}
            <div
              aria-hidden
              className="absolute w-72 rounded-2xl bg-accent/20 border border-accent/20 top-8 right-2 bottom-2"
              style={{ transform: 'rotate(5deg)' }}
            />
            <div
              aria-hidden
              className="absolute w-72 rounded-2xl bg-primary-light/30 border border-white/10 top-4 right-1 bottom-1"
              style={{ transform: 'rotate(2.5deg)' }}
            />

            {/* Main card */}
            <div
              className="relative w-72 bg-white/12 backdrop-blur-xl border border-white/22 rounded-2xl p-5 shadow-glass"
              style={{ animation: 'float 5s ease-in-out infinite' }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/12">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-display font-bold text-sm leading-tight">Syllabix</p>
                  <p className="text-white/45 text-xs">Certificat de compétences</p>
                </div>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-secondary/25 text-secondary text-xs font-display font-semibold">
                  En cours
                </span>
              </div>

              {/* Module list */}
              <div className="space-y-2.5 mb-5">
                {moduleProgress.map((mod, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 transition-opacity ${
                      mod.active ? 'opacity-100' : mod.done ? 'opacity-85' : 'opacity-35'
                    }`}
                  >
                    {mod.done ? (
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                    ) : mod.active ? (
                      <div className="w-4 h-4 flex-shrink-0 rounded-full border-2 border-accent border-t-transparent animate-spin-slow" />
                    ) : (
                      <Circle className="w-4 h-4 text-white/25 flex-shrink-0" />
                    )}
                    <span className={`text-xs leading-tight ${
                      mod.active ? 'text-accent font-display font-semibold' : mod.done ? 'text-white/80' : 'text-white/35'
                    }`}>
                      {mod.label}
                    </span>
                    {mod.done && (
                      <span className="ml-auto text-secondary text-xs font-bold">✓</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="pt-4 border-t border-white/12">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/45 text-xs">Progression</span>
                  <span className="text-white font-display font-bold text-sm">60 %</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-accent progress-fill"
                    style={{ width: '60%' }}
                  />
                </div>
              </div>
            </div>

            {/* Floating notification badge */}
            <div
              className="absolute -bottom-5 -left-6 bg-white rounded-2xl px-3 py-2.5 shadow-card-hover flex items-center gap-2.5 border border-neutral-100"
              style={{ animation: 'float-sm 3.5s ease-in-out infinite' }}
            >
              <div className="w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🎉</span>
              </div>
              <div>
                <p className="text-xs font-display font-bold text-primary leading-tight">Module validé !</p>
                <p className="text-xs text-neutral-400">+ 15 points obtenus</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
