import clsx from 'clsx';

/** @param {{ icon?: any, title?: any, description?: any, number?: any, variant?: string, className?: string, children?: any, [key: string]: any }} props */
export default function Card({
  icon: Icon    = null,
  title         = null,
  description   = null,
  number        = null,
  variant       = 'default',
  className,
  children,
  ...props
}) {
  const base = [
    'group relative p-6 rounded-2xl shadow-card card-shine',
    'transition-all duration-300 ease-out',
    'hover:-translate-y-1.5 hover:shadow-card-hover',
  ].join(' ');

  const styles = {
    default:   'bg-white   border border-neutral-100 hover:border-accent/30',
    accent:    'bg-accent/5   border border-accent/15   hover:border-accent/50',
    primary:   'bg-primary/5  border border-primary/10  hover:border-primary/30',
    secondary: 'bg-secondary/5 border border-secondary/10 hover:border-secondary/40',
    dark:      'bg-dark/95 border border-white/8   hover:border-accent/30',
    glass:     'bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40',
  };

  const iconBg = {
    default:   'bg-accent/10    group-hover:bg-accent/20',
    accent:    'bg-accent/15    group-hover:bg-accent/25',
    primary:   'bg-primary/10   group-hover:bg-primary/20',
    secondary: 'bg-secondary/10 group-hover:bg-secondary/20',
    dark:      'bg-white/10     group-hover:bg-white/20',
    glass:     'bg-white/10     group-hover:bg-white/20',
  };

  const iconClr = {
    default: 'text-accent', accent: 'text-accent',
    primary: 'text-primary', secondary: 'text-secondary',
    dark: 'text-accent', glass: 'text-white',
  };

  const titleClr = {
    default: 'text-neutral-900 group-hover:text-primary',
    accent: 'text-neutral-900', primary: 'text-neutral-900',
    secondary: 'text-neutral-900', dark: 'text-white', glass: 'text-white',
  };

  const descClr = {
    default: 'text-neutral-500', accent: 'text-neutral-500',
    primary: 'text-neutral-500', secondary: 'text-neutral-500',
    dark: 'text-white/55', glass: 'text-white/60',
  };

  return (
    <div className={clsx(base, styles[variant], className)} {...props}>
      {/* Background number */}
      {number != null && (
        <span
          aria-hidden
          className="absolute top-4 right-5 text-4xl font-display font-extrabold text-neutral-100 group-hover:text-accent/15 transition-colors select-none leading-none"
        >
          {String(number).padStart(2, '0')}
        </span>
      )}

      {/* Icon */}
      {Icon && (
        <div className={clsx(
          'mb-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
          iconBg[variant]
        )}>
          {typeof Icon === 'string'
            ? <span className={clsx('text-2xl leading-none select-none', iconClr[variant])}>{Icon}</span>
            : <Icon className={clsx('w-6 h-6 transition-colors', iconClr[variant])} strokeWidth={1.75} />
          }
        </div>
      )}

      {/* Title */}
      {title && (
        <h3 className={clsx('font-display font-bold text-lg mb-2 leading-snug transition-colors', titleClr[variant])}>
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className={clsx('text-sm leading-relaxed', descClr[variant])}>
          {description}
        </p>
      )}

      {children}

      {/* Bottom accent line — slides in on hover */}
      <div
        aria-hidden
        className={clsx(
          'absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl',
          'origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-350',
          variant === 'secondary' ? 'bg-secondary' : 'bg-gradient-to-r from-accent to-accent-light'
        )}
      />
    </div>
  );
}
