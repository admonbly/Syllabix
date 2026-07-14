'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { blogDB } from '@/lib/firebase';
import { ARTICLES_SEED } from '@/lib/articlesSeed';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const CATEGORIES = ['Tous', 'IA', 'Cybersécurité', 'Employabilité', 'Internet'];

export default function BlogListPage() {
  const [articles, setArticles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState('Tous');

  useEffect(() => {
    blogDB.getArticles(30).then(async (data) => {
      if (data && data.length > 0) {
        setArticles(data);
      } else {
        // Firestore vide → seed les articles par défaut
        await blogDB.seedArticles(ARTICLES_SEED);
        setArticles(ARTICLES_SEED);
      }
    }).catch(() => {
      // Pas de connexion Firestore → afficher articles locaux
      setArticles(ARTICLES_SEED);
    }).finally(() => setLoading(false));
  }, []);

  const displayed = category === 'Tous'
    ? articles
    : articles.filter(a => a.category === category);

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="Blog & Actualités"
        subtitle="Les dernières nouvelles et tutoriels sur les compétences numériques en Afrique"
        icon="✍️"
        badge="Ressources"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                category === cat
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-accent hover:text-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-neutral-100" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <Card className="text-center py-16">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-neutral-600 text-lg">Aucun article dans cette catégorie.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayed.map((article) => (
              <Link
                key={article.id || article.slug}
                href={`/blog/${article.slug}`}
                className="group"
              >
                <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 cursor-pointer">
                  {/* Image / Emoji */}
                  <div className="text-5xl mb-4 text-center py-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl">
                    {article.image || '📄'}
                  </div>

                  {/* Meta */}
                  <div className="flex gap-2 items-center mb-3">
                    <span className="px-3 py-1 bg-accent/15 text-accent rounded-full text-xs font-semibold">
                      {article.category}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>

                  {/* Titre */}
                  <h3 className="text-lg font-heading font-bold text-primary mb-2 group-hover:text-accent transition-colors leading-snug flex-1">
                    {article.title}
                  </h3>

                  {/* Extrait */}
                  <p className="text-neutral-500 text-sm mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>

                  <p className="text-accent font-semibold text-sm group-hover:translate-x-1.5 transition-transform">
                    Lire la suite →
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
