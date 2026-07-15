'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

/**
 * Rôle de l'utilisateur courant, pour la navigation uniquement.
 *
 * ⚠️ Purement ergonomique : sert à afficher (ou non) le lien vers l'espace
 * organisation. La vraie autorisation est côté serveur (lib/orgAuth) — cette
 * valeur ne protège rien et n'a pas besoin d'être infalsifiable.
 *
 * Une seule lecture par session : le Header est monté une fois dans le layout
 * et survit aux navigations client.
 */
export function useOrgRole() {
  const [state, setState] = useState({ loading: true, isOrgAdmin: false, orgType: null });

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!cancelled) setState({ loading: false, isOrgAdmin: false, orgType: null });
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (cancelled) return;
        const d = snap.exists() ? snap.data() : {};
        setState({
          loading: false,
          isOrgAdmin: d.role === 'ORG_ADMIN' && !!d.orgId,
          orgType: d.orgType ?? null,
        });
      } catch {
        if (!cancelled) setState({ loading: false, isOrgAdmin: false, orgType: null });
      }
    });
    return () => { cancelled = true; unsub(); };
  }, []);

  return state;
}
