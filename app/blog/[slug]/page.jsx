'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { blogDB } from '@/lib/firebase';
import { ARTICLES_SEED } from '@/lib/articlesSeed';

function ArticleContent({ article }) {
  if (!article) return null;

  const paragraphs = article.content
    ? article.content.split('\n\n').filter(Boolean)
    : [];

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link href="/blog" className="inline-flex items-center gap-2 text-accent font-semibold hover:underline mb-8">
          ← Retour au blog
        </Link>

        <Card className="mb-8 p-8">
          {/* Meta */}
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <span className="px-4 py-1.5 bg-accent/15 text-accent rounded-full text-sm font-semibold">
              {article.category}
            </span>
            <span className="text-sm text-neutral-500">
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                : article.date || ''}
            </span>
            {article.author && (
              <span className="text-sm text-neutral-500">Par {article.author}</span>
            )}
          </div>

          {/* Titre */}
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Emoji / Image */}
          {article.image && (
            <div className="text-6xl text-center py-8 my-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl">
              {article.image}
            </div>
          )}

          {/* Contenu */}
          <div className="prose prose-lg max-w-none space-y-4">
            {paragraphs.map((block, i) => {
              if (block.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-2xl font-heading font-bold text-primary mt-8 mb-3">
                    {block.replace('## ', '')}
                  </h2>
                );
              }
              if (block.startsWith('- ') || block.includes('\n- ')) {
                const items = block.split('\n').filter(l => l.startsWith('- '));
                return (
                  <ul key={i} className="list-disc list-inside space-y-2 text-neutral-700">
                    {items.map((item, j) => (
                      <li key={j}>{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              // HTML brut (articles anciens)
              if (block.includes('<')) {
                return (
                  <div
                    key={i}
                    className="text-neutral-700 leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-primary [&>h2]:mt-6 [&>h2]:mb-3 [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:space-y-1 [&>p]:leading-relaxed [&>p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: block }}
                  />
                );
              }
              return (
                <p key={i} className="text-neutral-700 leading-relaxed">
                  {block}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-neutral-100">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* CTA */}
        <Card className="text-center p-8 bg-gradient-to-r from-primary to-primary/90 text-white mb-8">
          <h3 className="text-2xl font-heading font-bold mb-3">Prêt à certifier vos compétences ?</h3>
          <p className="text-white/80 mb-6">Évaluez-vous gratuitement sur 7 modules numériques</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <CTAButton href="/certification" variant="white">
              Commencer la certification
            </CTAButton>
            <CTAButton href="/training/mixed" variant="outline-white">
              S'entraîner d'abord
            </CTAButton>
          </div>
        </Card>

        <Link href="/blog" className="text-accent font-semibold hover:underline inline-flex items-center gap-2">
          ← Tous les articles
        </Link>
      </div>
    </section>
  );
}

export default function ArticlePage({ params }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogDB.getArticleBySlug(params.slug).then((data) => {
      if (data) {
        setArticle(data);
      } else {
        // Fallback sur les données locales
        const local = ARTICLES_SEED.find(a => a.slug === params.slug);
        setArticle(local || null);
      }
    }).catch(() => {
      const local = ARTICLES_SEED.find(a => a.slug === params.slug);
      setArticle(local || null);
    }).finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Chargement de l'article...</p>
        </div>
      </section>
    );
  }

  if (!article) return notFound();

  return <ArticleContent article={article} />;
}
