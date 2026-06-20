import clsx from 'clsx';

export default function Hero({
  title,
  subtitle,
  cta,
  stats,
  variant = 'default',
}) {
  const backgrounds = {
    default:   'bg-gradient-to-br from-primary-dark via-primary to-primary-light',
    accent:    'bg-gradient-to-br from-accent-dark via-accent to-accent-light',
    secondary: 'bg-gradient-to-br from-secondary-dark via-secondary to-secondary-light',
  };

  return (
    <section
      className={clsx('relative py-20 sm:py-28 overflow-hidden', backgrounds[variant])}
      aria-label="En-tête principal"
    >
      {/* Decorative blobs */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight animate-fade-in">
            {title}
          </h1>

          {subtitle && (
            <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed animate-slide-up">
              {subtitle}
            </p>
          )}

          {cta && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              {cta}
            </div>
          )}

          {/* Optional stats bar */}
          {stats && (
            <div className="mt-14 grid grid-cols-3 gap-4 border-t border-white/20 pt-10 animate-fade-in">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl font-heading font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/60 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
