'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Link from 'next/link';
import { blogDB } from '@/lib/firebase';

const FALLBACK_ARTICLES = [
  {
    id: 'ia-chat-gpt-2026',
    slug: 'ia-chat-gpt-2026',
    title: 'IA générative et agents IA en 2026: L\'avenir du travail',
    excerpt: 'Explorez comment les assistants IA redéfinissent la productivité et l\'employabilité en 2026.',
    category: 'IA',
    publishedAt: '2026-03-22',
    image: '🤖',
  },
  {
    id: 'securite-biometrique-2026',
    slug: 'securite-biometrique-2026',
    title: 'Sécurité biométrique et authentification multi-niveaux',
    excerpt: 'Les nouvelles normes de protection des données en 2026.',
    category: 'Cybersécurité',
    publishedAt: '2026-03-18',
    image: '🔒',
  },
  {
    id: 'power-bi-avance-2026',
    slug: 'power-bi-avance-2026',
    title: 'Power BI et analytics: Visualiser vos données en 2026',
    excerpt: 'Maîtrisez les outils modernes d\'analyse de données et de visualisation.',
    category: 'Données',
    publishedAt: '2026-03-15',
    image: '📊',
  },
  {
    id: 'brand-digital-2026',
    slug: 'brand-digital-2026',
    title: 'Marque digitale et présence LinkedIn en 2026',
    excerpt: 'Construire votre image professionnelle à l\'ère du digital.',
    category: 'Employabilité',
    publishedAt: '2026-03-10',
    image: '💼',
  },
  {
    id: 'ia-recherche-2026',
    slug: 'ia-recherche-2026',
    title: 'Recherche intelligente avec les assistants IA',
    excerpt: 'Au-delà de Google: les nouveaux outils de recherche assistée par IA.',
    category: 'Internet',
    publishedAt: '2026-03-05',
    image: '🔍',
  },
  {
    id: 'travail-hybrid-2026',
    slug: 'travail-hybrid-2026',
    title: 'Travail hybride: Outils et compétences indispensables',
    excerpt: 'Les technologies et soft-skills pour l\'environnement de travail 2026.',
    category: 'Employabilité',
    publishedAt: '2026-02-28',
    image: '💻',
  },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function BlogListPage() {
  const [articles, setArticles] = useState(FALLBACK_ARTICLES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogDB.getArticles(12).then((data) => {
      if (data && data.length > 0) {
        setArticles(data);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">Blog & Actualités</h1>
        <p className="section-subtitle">
          Les dernières nouvelles et tutoriels sur les compétences numériques
        </p>

        {loading && (
          <div className="text-center py-8 text-neutral-500">Chargement des articles...</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <Link
              key={article.id || article.slug}
              href={`/blog/${article.slug}`}
              className="group"
            >
              <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer">
                <div className="text-4xl mb-4">{article.image || '📄'}</div>
                <div className="flex gap-2 mb-3">
                  <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-semibold">
                    {article.category}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {article.date || formatDate(article.publishedAt)}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
                <p className="text-neutral-600 text-sm mb-4">
                  {article.excerpt}
                </p>
                <p className="text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  Lire la suite →
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
