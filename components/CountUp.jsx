'use client';
import { useEffect, useRef, useState } from 'react';

export default function CountUp({
  value,
  suffix   = '',
  prefix   = '',
  duration = 2000,
  className = '',
}) {
  const ref       = useRef(null);
  const [count, setCount]     = useState(0);
  const [started, setStarted] = useState(false);

  /* trigger on viewport entry */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); io.unobserve(el); } },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* animate */
  useEffect(() => {
    if (!started) return;
    let raf;
    let t0;
    const run = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // ease-out expo
      setCount(Math.round(e * value));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [started, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString('fr-FR')}{suffix}
    </span>
  );
}
