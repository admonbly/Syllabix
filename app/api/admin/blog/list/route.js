import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requirePlatformAdmin } from '@/lib/adminAuth';

/**
 * GET /api/admin/blog/list
 * Liste TOUS les articles (publiés et brouillons) pour l'administration.
 */
export async function GET(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const db = getAdminDb();
  const snap = await db.collection('articles').orderBy('publishedAt', 'desc').get();

  const articles = snap.docs.map((d) => {
    const a = d.data();
    return {
      id: d.id,
      slug: a.slug ?? d.id,
      title: a.title ?? '(sans titre)',
      excerpt: a.excerpt ?? '',
      category: a.category ?? '',
      image: a.image ?? '',
      author: a.author ?? '',
      tags: a.tags ?? [],
      content: a.content ?? '',
      publishedAt: a.publishedAt ?? null,
      // Les articles historiques n'ont pas le champ : ils sont considérés publiés.
      published: a.published !== false,
    };
  });

  return NextResponse.json({ articles });
}
