'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, GraduationCap, Users, Clock } from 'lucide-react';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import { auth } from '@/lib/firebase';

/**
 * Tableau de bord organisation — placeholder.
 * Le suivi détaillé des membres arrive avec les sous-projets 2 (écoles)
 * et 3 (entreprises). Cette page pose la garde d'accès ORG_ADMIN.
 */
export default function OrgDashboardPage() {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, org: null });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace('/auth/login?redirect=/org'); return; }
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/org/me', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        // Accès réservé aux administrateurs de l'organisation
        if (!res.ok || !data.isOrgAdmin) { router.replace('/dashboard'); return; }
        setState({ loading: false, org: data.org });
      } catch {
        router.replace('/dashboard');
      }
    });
    return unsub;
  }, [router]);

  if (state.loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="h-8 w-64 bg-neutral-100 rounded animate-pulse mb-4" />
        <div className="h-32 bg-neutral-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const { org } = state;
  const Icon = org.type === 'COMPANY' ? Building2 : GraduationCap;

  return (
    <>
      <PageHeader
        title={org.name}
        subtitle={org.type === 'COMPANY' ? 'Espace entreprise' : 'Espace établissement'}
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-widest">Type</p>
              <p className="font-display font-bold text-primary">
                {org.type === 'COMPANY' ? 'Entreprise' : 'École'}
              </p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-secondary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-widest">Membres rattachés</p>
              <p className="font-display font-bold text-primary text-2xl">{org.memberCount}</p>
            </div>
          </Card>
        </div>

        <Card className="p-8 text-center bg-blue-50 border-l-4 border-blue-400">
          <Clock className="w-8 h-8 text-blue-500 mx-auto mb-3" aria-hidden="true" />
          <h2 className="font-display font-bold text-primary text-lg mb-2">
            Tableau de bord bientôt disponible
          </h2>
          <p className="text-sm text-neutral-600 max-w-lg mx-auto">
            Le suivi détaillé de la progression de chaque membre, les résultats par compétence
            et l&apos;export des données arrivent dans la prochaine étape.
          </p>
        </Card>
      </section>
    </>
  );
}
