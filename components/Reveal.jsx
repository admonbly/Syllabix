'use client';
import { useEffect, useRef, useState } from 'react';

const initial = {
  up:    { opacity: 0, transform: 'translateY(28px)' },
  down:  { opacity: 0, transform: 'translateY(-28px)' },
  left:  { opacity: 0, transform: 'translateX(32px)' },
  right: { opacity: 0, transform: 'translateX(-32px)' },
  scale: { opacity: 0, transform: 'scale(0.90)' },
  fade:  { opacity: 0 },
};

const final = {
  up:    { opacity: 1, transform: 'translateY(0px)' },
  down:  { opacity: 1, transform: 'translateY(0px)' },
  left:  { opacity: 1, transform: 'translateX(0px)' },
  right: { opacity: 1, transform: 'translateX(0px)' },
  scale: { opacity: 1, transform: 'scale(1)' },
  fade:  { opacity: 1 },
};

export default function Reveal({
  children,
  delay    = 0,
  direction = 'up',
  duration  = 650,
  threshold = 0.1,
  className = '',
  as: Tag  = 'div',
}) {
  const ref     = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVis(true); io.unobserve(el); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...(vis ? final[direction] : initial[direction]),
        transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
