'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Eye, EyeOff, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import AdminShell, { adminFetch } from '@/components/admin/AdminShell';

const CATEGORIES = ['IA', 'Cybersécurité', 'Employabilité', 'Internet', 'Bureautique'];

const EMPTY = {
  id: null, slug: '', title: '', excerpt: '', category: 'IA',
  image: '', author: '', tags: '', content: '', published: true,
};

function Banner({ kind, children }) {
  if (!children) return null;
  const styles = kind === 'error'
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-green-50 border-green-200 text-green-800';
  return <div className={`mb-4 px-4 py-3 rounded-lg border text-sm ${styles}`}>{children}</div>;
}

export default function AdminBlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [notice, setNotice]     = useState('');
  const [editing, setEditing]   = useState(null); // null = pas d'éditeur ouvert
  const [busy, setBusy]         = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/blog/list');
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur de chargement'); return; }
      setArticles(data.articles);
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew  = () => { setEditing({ ...EMPTY }); setError(''); setNotice(''); };
  const openEdit = (a) => {
    setEditing({ ...a, tags: Array.isArray(a.tags) ? a.tags.join(', ') : (a.tags || '') });
    setError(''); setNotice('');
  };

  const save = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const res = await adminFetch('/api/admin/blog/upsert', {
        method: 'POST',
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      setNotice(data.created ? 'Article créé.' : 'Article mis à jour.');
      setEditing(null);
      await load();
    } catch {
      setError('Erreur lors de l\'enregistrement');
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (a) => {
    setError(''); setNotice('');
    try {
      const res = await adminFetch('/api/admin/blog/toggle-publish', {
        method: 'POST',
        body: JSON.stringify({ id: a.id, published: !a.published }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur'); return; }
      setNotice(a.published ? `« ${a.title} » dépublié.` : `« ${a.title} » publié.`);
      await load();
    } catch { setError('Erreur'); }
  };

  const field = (k) => ({
    value: editing?.[k] ?? '',
    onChange: (e) => setEditing((s) => ({ ...s, [k]: e.target.value })),
    className: 'w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors',
  });

  return (
    <AdminShell title="Blog">
      <Banner kind="error">{error}</Banner>
      <Banner kind="success">{notice}</Banner>

      {!editing && (
        <button
          onClick={openNew}
          className="mb-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-accent text-white font-display font-semibold hover:bg-accent-dark transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nouvel article
        </button>
      )}

      {/* Éditeur */}
      {editing && (
        <section className="bg-white rounded-2xl border border-neutral-200 p-6 mb-8">
          <h2 className="font-display font-bold text-primary mb-5">
            {editing.id ? 'Modifier l\'article' : 'Nouvel article'}
          </h2>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="a-title" className="block text-sm font-semibold text-primary mb-2">Titre</label>
                <input id="a-title" {...field('title')} placeholder="Excel pour les PME africaines" />
              </div>
              <div>
                <label htmlFor="a-slug" className="block text-sm font-semibold text-primary mb-2">
                  Lien (slug){editing.id && ' — non modifiable'}
                </label>
                <input
                  id="a-slug"
                  {...field('slug')}
                  disabled={!!editing.id}
                  placeholder="Généré depuis le titre si vide"
                  className={`${field('slug').className} ${editing.id ? 'bg-neutral-50 text-neutral-400' : ''}`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="a-excerpt" className="block text-sm font-semibold text-primary mb-2">Résumé</label>
              <input id="a-excerpt" {...field('excerpt')} placeholder="Une phrase qui donne envie de lire" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="a-cat" className="block text-sm font-semibold text-primary mb-2">Catégorie</label>
                <select id="a-cat" {...field('category')} className={`${field('category').className} bg-white`}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="a-author" className="block text-sm font-semibold text-primary mb-2">Auteur</label>
                <input id="a-author" {...field('author')} placeholder="Équipe Syllabix" />
              </div>
              <div>
                <label htmlFor="a-tags" className="block text-sm font-semibold text-primary mb-2">
                  Tags (séparés par virgules)
                </label>
                <input id="a-tags" {...field('tags')} placeholder="excel, pme, afrique" />
              </div>
            </div>

            <div>
              <label htmlFor="a-image" className="block text-sm font-semibold text-primary mb-2">
                Image (chemin ou URL)
              </label>
              <input id="a-image" {...field('image')} placeholder="/blog/mon-image.jpg" />
              <p className="text-xs text-neutral-400 mt-1">
                Déposez le fichier dans le dossier <code>/public</code> puis indiquez son chemin.
              </p>
            </div>

            <div>
              <label htmlFor="a-content" className="block text-sm font-semibold text-primary mb-2">Contenu</label>
              <textarea
                id="a-content"
                {...field('content')}
                rows={14}
                className={`${field('content').className} font-mono text-sm leading-relaxed`}
                placeholder="Le corps de l'article…"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) => setEditing((s) => ({ ...s, published: e.target.checked }))}
                className="h-4 w-4"
              />
              <span className="text-sm text-primary font-semibold">
                Publier immédiatement (décoché = brouillon, invisible du public)
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

      {/* Liste */}
      <section>
        <h2 className="font-display font-bold text-primary mb-4">
          {loading ? 'Chargement…' : `${articles.length} article${articles.length > 1 ? 's' : ''}`}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-neutral-200 p-5 flex flex-wrap items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-bold text-primary truncate">{a.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-display font-semibold ${
                      a.published
                        ? 'bg-secondary-pale text-secondary-dark'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {a.published ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {a.category}
                    {a.publishedAt && ` · ${new Date(a.publishedAt).toLocaleDateString('fr-FR')}`}
                    {' · '}/{a.slug}
                  </p>
                </div>

                {a.published && (
                  <Link
                    href={`/blog/${a.slug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-neutral-200 text-xs font-display font-semibold text-neutral-600 hover:border-accent hover:text-accent transition-colors min-h-[44px]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    Voir
                  </Link>
                )}

                <button
                  onClick={() => openEdit(a)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-neutral-200 text-xs font-display font-semibold text-neutral-600 hover:border-accent hover:text-accent transition-colors min-h-[44px]"
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  Modifier
                </button>

                <button
                  onClick={() => togglePublish(a)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-neutral-200 text-xs font-display font-semibold text-neutral-600 hover:border-accent hover:text-accent transition-colors min-h-[44px]"
                >
                  {a.published
                    ? <><EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> Dépublier</>
                    : <><Eye className="w-3.5 h-3.5" aria-hidden="true" /> Publier</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
