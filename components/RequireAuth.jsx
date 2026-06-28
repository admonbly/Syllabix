'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useLanguage } from '@/lib/LanguageContext';

export default function RequireAuth({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { t }    = useLanguage();
  const [status, setStatus] = useState('loading'); // 'loading' | 'auth' | 'unauth'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setStatus('auth');
      } else {
        setStatus('unauth');
        router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      }
    });
    return () => unsub();
  }, [router, pathname]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-neutral-400">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (status === 'unauth') return null;

  return children;
}
