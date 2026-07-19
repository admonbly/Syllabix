'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, GraduationCap, Users, Award, TrendingUp, Activity,
  Copy, Check, Download, Search,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { orgUnitLabels } from '@/lib/orgs';
import ModuleCoverage from '@/components/org/ModuleCoverage';
import MemberDetail from '@/components/org/MemberDetail';
import UnitsManager from '@/components/org/UnitsManager';
import UnitBreakdown from '@/components/org/UnitBreakdown';

/** Vocabulaire adaptatif : une école parle d'élèves, une entreprise d'employés. */
const WORDING = {
  SCHOOL: {
    entity: 'établissement', members: 'élèves', member: 'élève',
    space: 'Espace établissement',
    moduleIntro: 'Le niveau de vos élèves module par module. Un module faible indique ce qu\'il reste à travailler.',
  },
  COMPANY: {
    entity: 'société', members: 'employés', member: 'employé',
    space: 'Espace entreprise',
    moduleIntro: 'Le niveau de vos équipes module par module. Un module faible vous indique où cibler la formation.',
  },
};

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function StatCard({ icon: Icon, value, label, tint }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${tint}`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-display font-extrabold text-primary leading-none tabular-nums">{value}</p>
        <p className="text-xs text-neutral-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function OrgDashboardPage() {
  const router = useRouter();
  const [data, setData]       = useState(null);
  const [status, setStatus]   = useState('loading');
  const [query, setQuery]     = useState('');
  const [copied, setCopied]   = useState(false);
  const [openUid, setOpenUid] = useState(null);
  const [vouchers, setVouchers] = useState(null); // { allocated, used, remaining }
  // Filtre par classe/direction : '' = toutes, '__none__' = sans unité
  const [unitFilter, setUnitFilter] = useState('');

  const load = useCallback(async (user) => {
    if (!user) { router.replace('/auth/login?redirect=/org'); return; }
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/org/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        // Pas administrateur d'organisation → retour au tableau de bord apprenant
        router.replace('/dashboard');
        return;
      }
      setData(await res.json());
      setStatus('ok');
      // Suivi des vouchers (best-effort, ne bloque pas le dashboard)
      fetch('/api/org/vouchers', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((v) => v && setVouchers(v))
        .catch(() => {});
    } catch {
      setStatus('error');
    }
  }, [router]);

  useEffect(() => auth.onAuthStateChanged(load), [load]);

  const w = WORDING[data?.org?.type] ?? WORDING.SCHOOL;

  const members = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.members.filter((m) => {
      if (unitFilter === '__none__' && m.orgUnit) return false;
      if (unitFilter && unitFilter !== '__none__' && m.orgUnit !== unitFilter) return false;
      if (!q) return true;
      return m.displayName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    });
  }, [data, query, unitFilter]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(data.org.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* presse-papiers indisponible */ }
  };

  const exportCsv = () => {
    const unitLabel = orgUnitLabels(data.org.type).short;
    const hasUnits = data.org.units?.length > 0;
    // On exporte ce qui est affiché : si un filtre est actif, il s'applique.
    const source = members;
    const rows = [
      ['Nom', 'Email', ...(hasUnits ? [unitLabel] : []),
       'Modules validés', 'Score moyen', 'Certificats', 'Certification globale', 'Dernière activité'],
      ...source.map((m) => [
        m.displayName, m.email,
        ...(hasUnits ? [m.orgUnit ?? ''] : []),
        `${m.modulesValidated}/${m.totalModules}`,
        m.avgScore ?? '',
        m.certificateCount,
        m.hasGlobalCertificate ? 'Oui' : 'Non',
        m.lastActivity ? new Date(m.lastActivity).toLocaleDateString('fr-FR') : '',
      ]),
    ];
    const csv = '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    // Les accents sont convertis (é → e) avant le slug, sinon « Lycée » donne « lyc-e »
    const slug = data.org.name
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    a.download = `syllabix-${slug}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (status === 'loading') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="h-8 w-72 bg-neutral-100 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-sm text-neutral-500">Impossible de charger le tableau de bord. Réessayez plus tard.</p>
      </div>
    );
  }

  const { org, overview } = data;
  const Icon = org.type === 'COMPANY' ? Building2 : GraduationCap;
  const unitLabels = orgUnitLabels(org.type);
  const hasUnits = (org.units ?? []).length > 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Bandeau : identité + code à diffuser (l'action principale d'un admin) */}
      <div className="bg-primary-dark text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-display font-semibold uppercase tracking-widest text-accent">
                  {w.space}
                </p>
                <h1 className="text-2xl font-display font-extrabold truncate">{org.name}</h1>
                {org.city && <p className="text-sm text-white/50">{org.city}</p>}
              </div>
            </div>

            <div>
              <p className="text-xs text-white/50 mb-2">
                Code à communiquer à vos {w.members}
              </p>
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 hover:border-accent font-mono text-sm font-bold transition-colors min-h-[44px]"
              >
                {copied
                  ? <Check className="w-4 h-4 text-secondary" aria-hidden="true" />
                  : <Copy className="w-4 h-4 text-white/60" aria-hidden="true" />}
                {org.accessCode}
              </button>
              {!org.accessCodeActive && (
                <p className="text-xs text-accent mt-2">
                  Code désactivé — personne ne peut plus rejoindre.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Bloc 1 — Vue d'ensemble */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users} tint="bg-primary/8 text-primary"
            value={overview.totalMembers} label={`${w.members} rattachés`} />
          <StatCard icon={Award} tint="bg-accent/10 text-accent"
            value={`${overview.certificationRate}%`} label={`certifiés (${overview.certifiedCount})`} />
          <StatCard icon={TrendingUp} tint="bg-secondary/10 text-secondary"
            value={overview.avgScore !== null ? `${overview.avgScore}%` : '—'} label="score moyen" />
          <StatCard icon={Activity} tint="bg-blue-100 text-blue-600"
            value={overview.activeCount} label={`actifs sur ${overview.activeWindowDays} jours`} />
        </div>

        {/* Bloc 2 — Classes / directions : déclaration + comparaison */}
        <section className="mb-10">
          <h2 className="text-lg font-display font-bold text-primary mb-1">{unitLabels.plural}</h2>
          <p className="text-sm text-neutral-500 mb-5">
            {org.units?.length > 0
              ? `Comparez vos ${unitLabels.plural.toLowerCase()} pour repérer celles qui décrochent. Cliquez sur une ligne pour filtrer la liste.`
              : `Déclarez vos ${unitLabels.plural.toLowerCase()} pour situer chaque ${w.member} et comparer les groupes.`}
          </p>
          <div className="space-y-4">
            <UnitsManager
              orgType={org.type}
              units={org.units ?? []}
              breakdown={data.unitBreakdown}
              onChanged={() => load(auth.currentUser)}
            />
            {org.units?.length > 0 && (
              <UnitBreakdown
                orgType={org.type}
                breakdown={data.unitBreakdown}
                memberWord={w.members}
                onSelect={(name) => {
                  setUnitFilter(name ?? '__none__');
                  document.getElementById('membres')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}
          </div>
        </section>

        {/* Bloc 3 — Couverture par module */}
        <section className="mb-10">
          <h2 className="text-lg font-display font-bold text-primary mb-1">Couverture par module</h2>
          <p className="text-sm text-neutral-500 mb-5">{w.moduleIntro}</p>
          <ModuleCoverage modules={data.modules} memberWord={w.members} />
        </section>

        {/* Bloc — Codes de certification (vouchers) */}
        {vouchers && vouchers.allocated > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-display font-bold text-primary mb-1">Codes de certification</h2>
            <p className="text-sm text-neutral-500 mb-5">
              Les codes que la plateforme a mis à disposition de votre {w.entity} et leur consommation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={Award} tint="bg-primary/8 text-primary" value={vouchers.allocated} label="Codes alloués" />
              <StatCard icon={Check} tint="bg-secondary/10 text-secondary" value={vouchers.used} label="Codes utilisés" />
              <StatCard icon={Activity} tint="bg-accent/10 text-accent" value={vouchers.remaining} label="Codes restants" />
            </div>
          </section>
        )}

        {/* Bloc 3 — Membres */}
        <section id="membres">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="text-lg font-display font-bold text-primary capitalize">
              {w.members}{' '}
              <span className="text-neutral-400 font-normal">
                ({members.length === data.members.length
                  ? data.members.length
                  : `${members.length} sur ${data.members.length}`})
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {hasUnits && (
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  aria-label={`Filtrer par ${unitLabels.short.toLowerCase()}`}
                  className="px-4 py-2.5 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors text-sm bg-white min-h-[44px]"
                >
                  <option value="">Toutes les {unitLabels.plural.toLowerCase()}</option>
                  {org.units.map((u) => <option key={u} value={u}>{u}</option>)}
                  <option value="__none__">Sans {unitLabels.short.toLowerCase()}</option>
                </select>
              )}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher…"
                  aria-label={`Rechercher parmi les ${w.members}`}
                  className="pl-9 pr-4 py-2.5 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors text-sm min-h-[44px]"
                />
              </div>
              <button
                onClick={exportCsv}
                disabled={data.members.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-display font-semibold text-sm hover:bg-primary-light transition-colors disabled:opacity-50 min-h-[44px]"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Exporter
              </button>
            </div>
          </div>

          {data.truncated && (
            <p className="mb-4 px-4 py-3 rounded-lg border bg-amber-50 border-amber-200 text-amber-800 text-sm">
              Affichage limité aux {data.maxMembers} premiers {w.members}.
            </p>
          )}

          {data.members.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
              <Users className="w-8 h-8 text-neutral-200 mx-auto mb-3" aria-hidden="true" />
              <p className="font-display font-bold text-primary mb-1">Aucun {w.member} pour l&apos;instant</p>
              <p className="text-sm text-neutral-500">
                Communiquez le code <span className="font-mono font-bold text-primary">{org.accessCode}</span> à vos {w.members} :
                en le saisissant, ils rejoindront votre {w.entity}.
              </p>
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-neutral-500 bg-white border border-neutral-200 rounded-xl p-6">
              Aucun résultat pour « {query} ».
            </p>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      {['Nom', ...(hasUnits ? [unitLabels.short] : []),
                        'Modules validés', 'Score moyen', 'Certificats', 'Dernière activité'].map((h, i) => (
                        <th key={h} scope="col"
                          className={`px-5 py-3 font-display font-semibold text-neutral-500 text-xs uppercase tracking-widest ${i === 0 ? 'text-left' : 'text-right'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr
                        key={m.uid}
                        onClick={() => setOpenUid(m.uid)}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') setOpenUid(m.uid); }}
                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 cursor-pointer transition-colors focus:outline-none focus:bg-neutral-50"
                      >
                        <td className="px-5 py-3">
                          <p className="font-display font-semibold text-primary">{m.displayName}</p>
                          <p className="text-xs text-neutral-400">{m.email}</p>
                        </td>
                        {hasUnits && (
                          <td className="px-5 py-3 text-right whitespace-nowrap">
                            {m.orgUnit
                              ? <span className="inline-block px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-xs">{m.orgUnit}</span>
                              : <span className="text-neutral-300">—</span>}
                          </td>
                        )}
                        <td className="px-5 py-3 text-right">
                          <span className="text-primary tabular-nums">{m.modulesValidated}</span>
                          <span className="text-neutral-300 tabular-nums">/{m.totalModules}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {m.avgScore !== null ? (
                            <span className={`font-display font-bold tabular-nums ${
                              m.avgScore >= 75 ? 'text-secondary' : m.avgScore >= 60 ? 'text-accent-dark' : 'text-red-600'
                            }`}>{m.avgScore}%</span>
                          ) : <span className="text-neutral-300">—</span>}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {m.certificateCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-primary tabular-nums">
                              <Award className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                              {m.certificateCount}
                            </span>
                          ) : <span className="text-neutral-300">—</span>}
                        </td>
                        <td className="px-5 py-3 text-right text-neutral-500 tabular-nums whitespace-nowrap">
                          {fmtDate(m.lastActivity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {openUid && <MemberDetail uid={openUid} onClose={() => setOpenUid(null)} />}
    </div>
  );
}
