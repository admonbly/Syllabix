'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/Loading';
import { useArticle } from '@/hooks';

function ArticleContent() {
  const params = useParams();
  const slug = params?.slug as string;
  const { article, isLoading, error } = useArticle(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !article) {
    return notFound();
  }

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link href="/blog" className="text-accent font-semibold hover:underline mb-8 inline-flex items-center gap-2">
          ← Retour au blog
        </Link>

        <Card className="mb-8 p-8">
          {/* Meta info */}
          <div className="flex gap-4 items-center mb-6 flex-wrap">
            <span className="px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-semibold">
              {article.category || 'Actualité'}
            </span>
            <span className="text-sm text-neutral-600">
              Publié le {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
            </span>
            {article.author && (
              <span className="text-sm text-neutral-600">Par {article.author}</span>
            )}
            {article.readingTimeMinutes && (
              <span className="text-sm text-neutral-600">~{article.readingTimeMinutes} min de lecture</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6">
            {article.title}
          </h1>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="text-6xl my-8 text-center">
              {article.featuredImage}
            </div>
          )}

          {/* Content */}
          <article className="prose prose-lg max-w-none text-neutral-700 leading-relaxed space-y-6">
            {article.content.split('\n\n').map((paragraph, index) => {
              // Check if paragraph is a heading
              if (paragraph.startsWith('##')) {
                const title = paragraph.replace('##', '').trim();
                return (
                  <h2 key={index} className="text-3xl font-heading font-bold text-primary mt-8 mb-4">
                    {title}
                  </h2>
                );
              }

              // Check if paragraph is a list
              if (paragraph.includes('- ')) {
                const items = paragraph.split('\n').filter((line) => line.startsWith('- '));
                return (
                  <ul key={index} className="list-disc list-inside space-y-2 my-4">
                    {items.map((item, i) => (
                      <li key={i} className="text-neutral-700">
                        {item.replace('- ', '')}
                      </li>
                    ))}
                  </ul>
                );
              }

              // Regular paragraph
              return (
                <p key={index} className="text-neutral-700 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </article>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-200">
              <h4 className="font-semibold text-primary mb-4">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Updated info */}
          {article.updatedAt && article.updatedAt !== article.publishedAt && (
            <p className="text-xs text-neutral-500 mt-8 pt-8 border-t border-neutral-200">
              Dernière mise à jour: {new Date(article.updatedAt).toLocaleDateString('fr-FR')}
            </p>
          )}
        </Card>

        {/* Author card */}
        {article.author && (
          <Card className="mb-8 p-8 bg-gradient-to-r from-accent/10 to-orange-500/10">
            <h3 className="font-heading font-bold text-primary mb-2">À propos de l'auteur</h3>
            <p className="text-neutral-700 mb-4">
              {article.author} est l'auteur de cet article. Pour plus de contenu, visitez notre blog régulièrement.
            </p>
          </Card>
        )}

        {/* CTA */}
        <Card className="text-center p-8 bg-gradient-to-r from-accent to-orange-500 text-white">
          <h3 className="text-2xl font-heading font-bold mb-4">Prêt à développer vos compétences?</h3>
          <p className="mb-6">Explorez nos modules de certification et formations interactives</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <CTAButton href="/certification" variant="primary">
              🎯 Commencer une certification
            </CTAButton>
            <CTAButton href="/training" variant="outline">
              📚 Explorer les formations
            </CTAButton>
          </div>
        </Card>

        {/* Back to blog */}
        <Link href="/blog" className="text-accent font-semibold hover:underline mt-12 inline-flex items-center gap-2">
          ← Retour à tous les articles
        </Link>
      </div>
    </section>
  );
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <ArticleContent />
    </Suspense>
  );
}
