'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, GraduationCap, Copy, Check, UserPlus, Plus } from 'lucide-react';
import AdminShell, { adminFetch } from '@/components/admin/AdminShell';

function Banner({ kind, children }) {
  if (!children) return null;
  const styles = kind === 'error'
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-green-50 border-green-200 text-green-800';
  return <div className={`mb-4 px-4 py-3 rounded-lg border text-sm ${styles}`}>{children}</div>;
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [notice, setNotice]   = useState('');
  const [copied, setCopied]   = useState(null);

  // Formulaire de création
  const [name, setName] = useState('');
  const [type, setType] = useState('SCHOOL');
  const [city, setCity] = useState('');
  const [busy, setBusy] = useState(false);

  // Promotion
  const [promoteOrg, setPromoteOrg]     = useState(null);
  const [promoteEmail, setPromoteEmail] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/org/list');
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur de chargement'); return; }
      setOrgs(data.orgs);
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    if (!name.trim()) { setError('Le nom est requis'); return; }
    setBusy(true);
    try {
      const res = await adminFetch('/api/admin/org/create', {
        method: 'POST',
        body: JSON.stringify({ name, type, city }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      setNotice(`« ${data.name} » créée — code : ${data.accessCode}`);
      setName(''); setCity('');
      await load();
    } catch {
      setError('Erreur lors de la création');
    } finally {
      setBusy(false);
    }
  };

  const toggleCode = async (org) => {
    setError(''); setNotice('');
    try {
      const res = await adminFetch('/api/admin/org/toggle-code', {
        method: 'POST',
        body: JSON.stringify({ orgId: org.id, active: !org.accessCodeActive }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur'); return; }
      await load();
    } catch { setError('Erreur'); }
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    setBusy(true);
    try {
      const res = await adminFetch('/api/admin/org/promote', {
        method: 'POST',
        body: JSON.stringify({ email: promoteEmail, orgId: promoteOrg.id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      setNotice(`${data.email} est maintenant administrateur de « ${promoteOrg.name} ».`);
      setPromoteOrg(null); setPromoteEmail('');
      await load();
    } catch {
      setError('Erreur lors de la promotion');
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1800);
    } catch { /* presse-papiers indisponible */ }
  };

  return (
    <AdminShell title="Organisations">
      <Banner kind="error">{error}</Banner>
      <Banner kind="success">{notice}</Banner>

      {/* Création */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 mb-8">
        <h2 className="font-display font-bold text-primary mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-accent" aria-hidden="true" />
          Nouvelle organisation
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2">
            <label htmlFor="org-name" className="block text-sm font-semibold text-primary mb-2">Nom</label>
            <input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lycée Moderne de Cocody"
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="org-type" className="block text-sm font-semibold text-primary mb-2">Type</label>
            <select
              id="org-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none bg-white transition-colors"
            >
              <option value="SCHOOL">École</option>
              <option value="COMPANY">Entreprise</option>
            </select>
          </div>
          <div>
            <label htmlFor="org-city" className="block text-sm font-semibold text-primary mb-2">Ville</label>
            <input
              id="org-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Abidjan"
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
            />
          </div>
          <div className="sm:col-span-4">
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-3 rounded-lg bg-accent text-white font-display font-semibold hover:bg-accent-dark transition-colors disabled:opacity-60 min-h-[44px]"
            >
              {busy ? 'Création…' : 'Créer l\'organisation'}
            </button>
          </div>
        </form>
      </section>

      {/* Liste */}
      <section>
        <h2 className="font-display font-bold text-primary mb-4">
          {loading ? 'Chargement…' : `${orgs.length} organisation${orgs.length > 1 ? 's' : ''}`}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => <div key={i} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />)}
          </div>
        ) : orgs.length === 0 ? (
          <p className="text-sm text-neutral-500 bg-white border border-neutral-200 rounded-xl p-6">
            Aucune organisation pour l&apos;instant. Créez-en une ci-dessus.
          </p>
        ) : (
          <div className="space-y-3">
            {orgs.map((org) => {
              const Icon = org.type === 'COMPANY' ? Building2 : GraduationCap;
              return (
                <div key={org.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-primary truncate">{org.name}</p>
                      <p className="text-xs text-neutral-500">
                        {org.type === 'COMPANY' ? 'Entreprise' : 'École'}
                        {org.city && ` · ${org.city}`}
                        {' · '}{org.memberCount} membre{org.memberCount > 1 ? 's' : ''}
                        {org.adminCount > 0 && ` · ${org.adminCount} admin`}
                      </p>
                    </div>

                    {/* Code */}
                    <button
                      onClick={() => copyCode(org.accessCode)}
                      title="Copier le code"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 font-mono text-xs font-bold transition-colors min-h-[44px] ${
                        org.accessCodeActive
                          ? 'border-neutral-200 text-primary hover:border-accent'
                          : 'border-neutral-200 text-neutral-400 line-through'
                      }`}
                    >
                      {copied === org.accessCode
                        ? <Check className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
                        : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                      {org.accessCode}
                    </button>

                    {/* Statut du code */}
                    <button
                      onClick={() => toggleCode(org)}
                      className={`px-3 py-2 rounded-lg text-xs font-display font-semibold transition-colors min-h-[44px] ${
                        org.accessCodeActive
                          ? 'bg-secondary-pale text-secondary-dark hover:bg-secondary/20'
                          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                      }`}
                    >
                      {org.accessCodeActive ? 'Code actif' : 'Code désactivé'}
                    </button>

                    {/* Promotion */}
                    <button
                      onClick={() => { setPromoteOrg(org); setPromoteEmail(''); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-neutral-200 text-xs font-display font-semibold text-neutral-600 hover:border-accent hover:text-accent transition-colors min-h-[44px]"
                    >
                      <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                      Admin
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modale de promotion */}
      {promoteOrg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog" aria-modal="true" aria-labelledby="promote-title"
          onClick={(e) => { if (e.target === e.currentTarget) setPromoteOrg(null); }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 id="promote-title" className="text-lg font-display font-bold text-primary mb-1">
              Nommer un administrateur
            </h3>
            <p className="text-xs text-neutral-500 mb-5">
              Pour « {promoteOrg.name} ». L&apos;utilisateur doit déjà avoir un compte Syllabix.
              Il sera rattaché à cette organisation.
            </p>
            <form onSubmit={handlePromote}>
              <label htmlFor="promote-email" className="block text-sm font-semibold text-primary mb-2">
                Email de l&apos;utilisateur
              </label>
              <input
                id="promote-email"
                type="email"
                required
                autoFocus
                value={promoteEmail}
                onChange={(e) => setPromoteEmail(e.target.value)}
                placeholder="directeur@exemple.com"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
              />
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setPromoteOrg(null)}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-neutral-200 font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors min-h-[44px]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 px-4 py-3 rounded-lg bg-accent text-white font-display font-semibold hover:bg-accent-dark transition-colors disabled:opacity-60 min-h-[44px]"
                >
                  {busy ? 'En cours…' : 'Nommer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
