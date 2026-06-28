export default function PageHeader({ icon, title, subtitle, badge, children }) {
  return (
    <div className="relative bg-gradient-to-br from-primary via-[#1e2d8a] to-[#283593] text-white overflow-hidden">
      {/* dot grid subtle */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* glow */}
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-wide uppercase mb-4">
            {badge}
          </div>
        )}
        <div className="flex items-start gap-4">
          {icon && (
            <span className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/15 text-2xl flex-shrink-0 mt-0.5">
              {icon}
            </span>
          )}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold leading-tight mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base sm:text-lg text-white/65 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
