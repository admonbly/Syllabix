import Link from 'next/link';
import clsx from 'clsx';

export default function CTAButton({
  href,
  variant  = 'primary',
  size     = 'md',
  className,
  children,
  type     = 'button',
  ...props
}) {
  const base = [
    'relative font-display font-semibold rounded-xl',
    'inline-flex items-center justify-center gap-2',
    'transition-all duration-200',
    'active:scale-[0.97]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'btn-shine select-none',
  ].join(' ');

  const variants = {
    primary:
      'bg-accent text-white hover:bg-accent-dark hover:shadow-accent-lg focus-visible:ring-accent',
    secondary:
      'bg-secondary text-white hover:bg-secondary-dark hover:shadow-lg focus-visible:ring-secondary',
    outline:
      'border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-white hover:shadow-accent focus-visible:ring-accent',
    'outline-white':
      'border-2 border-white/50 text-white bg-transparent hover:bg-white/15 hover:border-white focus-visible:ring-white',
    ghost:
      'text-accent bg-transparent hover:bg-accent/10 focus-visible:ring-accent',
    dark:
      'bg-dark text-white hover:bg-primary hover:shadow-primary focus-visible:ring-primary',
    white:
      'bg-white text-primary font-semibold hover:bg-accent hover:text-white hover:shadow-accent focus-visible:ring-accent',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-2.5',
  };

  const cls = clsx(base, variants[variant], sizes[size], className);

  return href
    ? <Link href={href} className={cls} {...props}>{children}</Link>
    : <button type={type} className={cls} {...props}>{children}</button>;
}
