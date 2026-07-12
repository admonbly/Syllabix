export default function PageHeader({ icon, title, subtitle, badge, children }) {
  return (
    <div className="relative bg-gradient-to-br from-primary via-[#1e2d8a] to-[#283593] text-white overflow-hidden">
      {/* Grille de points */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
      {/* Halos colorés flottants */}
      <div aria-hidden className="ph-float absolute -top-24 -right-16 w-80 h-80 bg-accent/25 rounded-full blur-3xl pointer-events-none" />
      <div aria-hidden className="ph-float-rev absolute -bottom-28 left-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {badge && (
          <div className="ph-in inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-wide uppercase mb-4">
            {badge}
          </div>
        )}
        <div className="flex items-start gap-4">
          {icon && (
            <span className="ph-in hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/15 text-2xl flex-shrink-0 mt-0.5" style={{ animationDelay: '60ms' }}>
              {icon}
            </span>
          )}
          <div>
            <h1 className="ph-in text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold leading-tight mb-2" style={{ animationDelay: '120ms' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="ph-in text-base sm:text-lg text-white/65 max-w-2xl leading-relaxed" style={{ animationDelay: '180ms' }}>
                {subtitle}
              </p>
            )}
            {/* Soulignement tricolore de marque */}
            <div className="ph-in flex items-center gap-1.5 mt-4" style={{ animationDelay: '240ms' }}>
              <span className="h-1 w-12 rounded-full bg-accent" />
              <span className="h-1 w-4 rounded-full bg-[#c9a227]" />
              <span className="h-1 w-2 rounded-full bg-secondary" />
            </div>
          </div>
        </div>
        {children && <div className="ph-in mt-6" style={{ animationDelay: '300ms' }}>{children}</div>}
      </div>
    </div>
  );
}
