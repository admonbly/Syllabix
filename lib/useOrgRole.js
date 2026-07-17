'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

/**
 * Rôles de l'utilisateur courant, pour la navigation uniquement.
 *
 * ⚠️ Purement ergonomique : sert à afficher (ou non) les liens vers l'espace
 * organisation et l'administration. La vraie autorisation est côté serveur
 * (lib/orgAuth, lib/adminAuth) — ces valeurs ne protègent rien et n'ont pas
 * besoin d'être infalsifiables.
 *
 * - isOrgAdmin / orgType : lus depuis le profil Firestore.
 * - isPlatformAdmin : le rôle admin plateforme n'est PAS en base (il vient de
 *   PLATFORM_ADMIN_UIDS côté serveur), donc on interroge /api/admin/me.
 */
const DEFAULT = { loading: true, isOrgAdmin: false, orgType: null, isPlatformAdmin: false };

export function useOrgRole() {
  const [state, setState] = useState(DEFAULT);

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!cancelled) setState({ ...DEFAULT, loading: false });
        return;
      }
      try {
        const token = await user.getIdToken();

        // Profil (rôle orga) + statut admin plateforme, en parallèle
        const [snap, adminRes] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          fetch('/api/admin/me', { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => (r.ok ? r.json() : { isPlatformAdmin: false }))
            .catch(() => ({ isPlatformAdmin: false })),
        ]);
        if (cancelled) return;

        const d = snap.exists() ? snap.data() : {};
        setState({
          loading: false,
          isOrgAdmin: d.role === 'ORG_ADMIN' && !!d.orgId,
          orgType: d.orgType ?? null,
          isPlatformAdmin: adminRes?.isPlatformAdmin === true,
        });
      } catch {
        if (!cancelled) setState({ ...DEFAULT, loading: false });
      }
    });
    return () => { cancelled = true; unsub(); };
  }, []);

  return state;
}
