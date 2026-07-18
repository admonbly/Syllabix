'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { badgeLevelOf } from '@/lib/badges';

/**
 * Publie un badge dans la collection publique puis ouvre sa page partageable
 * /b/[id] (où se trouvent les boutons WhatsApp/LinkedIn/Facebook + l'aperçu OG).
 * Rendu uniquement pour un badge réellement décroché.
 */
export default function BadgeShareButton({ badge, className = '' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const share = async () => {
    setError('');
    const user = auth.currentUser;
    if (!user || user.isAnonymous) {
      setError('Connexion requise');
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/badge/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ moduleId: badge.moduleId ?? null, level: badgeLevelOf(badge) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.id) {
        window.open(`/b/${data.id}`, '_blank', 'noopener,noreferrer');
      } else {
        setError(data.error || 'Échec du partage');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={share}
      disabled={loading}
      title="Partager ce badge"
      className={`inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-accent transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? '…' : error ? error : '↗ Partager'}
    </button>
  );
}
