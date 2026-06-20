'use client';

import { Suspense } from 'react';
import Card from '@/components/Card';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/Loading';
import { useArticles } from '@/hooks';

function BlogListContent() {
  const { articles, isLoading, error } = useArticles(10);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des articles</p>
          <p className="text-neutral-600">{error}</p>
        </div>
      </section>
    );
  }

  const displayArticles = articles || [];

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">Blog & Actualités</h1>
        <p className="section-subtitle">
          Les dernières nouvelles et tutoriels sur les compétences numériques
        </p>

        {displayArticles.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-neutral-600">Aucun article disponible pour le moment.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayArticles.map((article) => (
              <Link
                key={article.articleId}
                href={`/blog/${article.slug}`}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="text-4xl mb-4">
                    {article.featuredImage || '📰'}
                  </div>
                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-semibold">
                      {article.category || 'Actualité'}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      Lire la suite →
                    </p>
                    {article.readingTimeMinutes && (
                      <span className="text-xs text-neutral-500">
                        ~{article.readingTimeMinutes} min
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <BlogListContent />
    </Suspense>
  );
}
