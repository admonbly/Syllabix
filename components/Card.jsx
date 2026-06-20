import clsx from 'clsx';

export default function Card({
  icon: Icon,
  title,
  description,
  variant = 'default',
  className,
  children,
  ...props
}) {
  const variants = {
    default:   'bg-white border border-neutral-200 hover:border-accent hover:shadow-card-hover',
    accent:    'bg-accent/5 border border-accent/20 hover:border-accent',
    secondary: 'bg-secondary/5 border border-secondary/20 hover:border-secondary',
    primary:   'bg-primary/5 border border-primary/20 hover:border-primary',
    flat:      'bg-neutral-50 border border-neutral-100',
  };

  return (
    <div
      className={clsx(
        'p-6 rounded-2xl shadow-card transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="mb-4 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-accent" strokeWidth={1.75} />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
      )}
      {children}
    </div>
  );
}
