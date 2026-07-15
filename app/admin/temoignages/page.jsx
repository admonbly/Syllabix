'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react';
import AdminShell, { adminFetch } from '@/components/admin/AdminShell';
import { TESTIMONIAL_COLORS } from '@/lib/testimonialsSeed';

const EMPTY = {
  id: null, name: '', role: '', location: '', initials: '',
  color: 'bg-primary', quoteFr: '', quoteEn: '', order: 99, published: true,
};

function Banner({ kind, children }) {
  if (!children) return null;
  const styles = kind === 'error'
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-green-50 border-green-200 text-green-800';
  return <div className={`mb-4 px-4 py-3 rounded-lg border text-sm ${styles}`}>{children}</div>;
}

export default function AdminTestimonialsPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [notice, setNotice]   = useState('');
  const [editing, setEditing] = useState(null);
  const [busy, setBusy]       = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/testimonials/list');
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur de chargement'); return; }
      setItems(data.testimonials);
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const res = await adminFetch('/api/admin/testimonials/upsert', {
        method: 'POST',
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      setNotice(data.created ? 'Témoignage ajouté.' : 'Témoignage mis à jour.');
      setEditing(null);
      await load();
    } catch {
      setError('Erreur lors de l\'enregistrement');
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (tm) => {
    setError(''); setNotice('');
    try {
      const res = await adminFetch('/api/admin/testimonials/toggle-publish', {
        method: 'POST',
        body: JSON.stringify({ id: tm.id, published: !tm.published }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur'); return; }
      setNotice(tm.published ? `« ${tm.name} » masqué.` : `« ${tm.name} » affiché.`);
      await load();
    } catch { setError('Erreur'); }
  };

  const field = (k) => ({
    value: editing?.[k] ?? '',
    onChange: (e) => setEditing((s) => ({ ...s, [k]: e.target.value })),
    className: 'w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors',
  });

  return (
    <AdminShell title="Témoignages">
      <Banner kind="error">{error}</Banner>
      <Banner kind="success">{notice}</Banner>

      <p className="text-sm text-neutral-500 mb-6">
        Les témoignages affichés sur la page d&apos;accueil, dans l&apos;ordre défini ci-dessous.
      </p>

      {!editing && (
        <button
          onClick={() => { setEditing({ ...EMPTY, order: items.length + 1 }); setError(''); setNotice(''); }}
          className="mb-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-accent text-white font-display font-semibold hover:bg-accent-dark transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nouveau témoignage
        </button>
      )}

      {editing && (
        <section className="bg-white rounded-2xl border border-neutral-200 p-6 mb-8">
          <h2 className="font-display font-bold text-primary mb-5">
            {editing.id ? 'Modifier le témoignage' : 'Nouveau témoignage'}
          </h2>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="t-name" className="block text-sm font-semibold text-primary mb-2">Nom</label>
                <input id="t-name" {...field('name')} placeholder="Amara Traoré" />
              </div>
              <div>
                <label htmlFor="t-role" className="block text-sm font-semibold text-primary mb-2">Fonction</label>
                <input id="t-role" {...field('role')} placeholder="Assistant administratif" />
              </div>
              <div>
                <label htmlFor="t-loc" className="block text-sm font-semibold text-primary mb-2">Ville, pays</label>
                <input id="t-loc" {...field('location')} placeholder="Abidjan, Côte d'Ivoire" />
              </div>
            </div>

            <div>
              <label htmlFor="t-qfr" className="block text-sm font-semibold text-primary mb-2">
                Citation (français)
              </label>
              <textarea id="t-qfr" {...field('quoteFr')} rows={3} placeholder="Syllabix m'a permis de…" />
            </div>

            <div>
              <label htmlFor="t-qen" className="block text-sm font-semibold text-primary mb-2">
                Citation (anglais)
              </label>
              <textarea id="t-qen" {...field('quoteEn')} rows={3} placeholder="Laissez vide pour reprendre le texte français" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="t-init" className="block text-sm font-semibold text-primary mb-2">
                  Initiales
                </label>
                <input id="t-init" {...field('initials')} placeholder="Calculées depuis le nom si vide" maxLength={3} />
              </div>
              <div>
                <label htmlFor="t-color" className="block text-sm font-semibold text-primary mb-2">Couleur</label>
                <select id="t-color" {...field('color')} className={`${field('color').className} bg-white`}>
                  {TESTIMONIAL_COLORS.map((c) => <option key={c} value={c}>{c.replace('bg-', '')}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="t-order" className="block text-sm font-semibold text-primary mb-2">
                  Ordre d&apos;affichage
                </label>
                <input
                  id="t-order"
                  type="number"
                  value={editing.order}
                  onChange={(e) => setEditing((s) => ({ ...s, order: e.target.value }))}
                  className={field('order').className}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) => setEditing((s) => ({ ...s, published: e.target.checked }))}
                className="h-4 w-4"
              />
              <span className="text-sm text-primary font-semibold">
                Afficher sur l&apos;accueil
              </span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-5 py-3 rounded-lg border-2 border-neutral-200 font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors min-h-[44px]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-3 rounded-lg bg-accent text-white font-display font-semibold hover:bg-accent-dark transition-colors disabled:opacity-60 min-h-[44px]"
              >
                {busy ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((tm) => (
            <div key={tm.id} className="bg-white rounded-xl border border-neutral-200 p-5 flex flex-wrap items-center gap-4">
              <div className={`w-10 h-10 rounded-full ${tm.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-display font-bold">{tm.initials}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-bold text-primary">{tm.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-display font-semibold ${
                    tm.published ? 'bg-secondary-pale text-secondary-dark' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {tm.published ? 'Affiché' : 'Masqué'}
                  </span>
                  <span className="text-xs text-neutral-400 tabular-nums">#{tm.order}</span>
                </div>
                <p className="text-xs text-neutral-500 truncate">
                  {tm.role}{tm.location && ` · ${tm.location}`}
                </p>
                <p className="text-xs text-neutral-400 italic truncate mt-0.5">&ldquo;{tm.quoteFr}&rdquo;</p>
              </div>

              <button
                onClick={() => setEditing({ ...tm })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-neutral-200 text-xs font-display font-semibold text-neutral-600 hover:border-accent hover:text-accent transition-colors min-h-[44px]"
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                Modifier
              </button>

              <button
                onClick={() => togglePublish(tm)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-neutral-200 text-xs font-display font-semibold text-neutral-600 hover:border-accent hover:text-accent transition-colors min-h-[44px]"
              >
                {tm.published
                  ? <><EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> Masquer</>
                  : <><Eye className="w-3.5 h-3.5" aria-hidden="true" /> Afficher</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
