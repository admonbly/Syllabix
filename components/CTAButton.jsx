import Link from 'next/link';
import clsx from 'clsx';

export default function CTAButton({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  const base = 'font-heading font-semibold rounded-xl inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants = {
    primary:   'bg-accent text-white hover:bg-accent-dark hover:shadow-accent focus-visible:ring-accent',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark hover:shadow-lg focus-visible:ring-secondary',
    outline:   'border-2 border-accent text-accent hover:bg-accent hover:text-white focus-visible:ring-accent',
    ghost:     'text-accent hover:bg-accent/10 focus-visible:ring-accent',
    dark:      'bg-primary text-white hover:bg-primary-dark hover:shadow-primary focus-visible:ring-primary',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const classes = clsx(base, variants[variant], sizes[size], className);

  if (href) {
    return <Link href={href} className={classes} {...props}>{children}</Link>;
  }

  return <button className={classes} {...props}>{children}</button>;
}
