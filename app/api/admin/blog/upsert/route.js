import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requirePlatformAdmin } from '@/lib/adminAuth';

/** Slug URL-safe à partir d'un titre. */
function slugify(str) {
  return String(str || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * POST /api/admin/blog/upsert
 * Body : { id?, slug?, title, excerpt, category, image, content, author, tags, published }
 * Crée un article (si pas d'id) ou met à jour l'existant.
 * L'id du document EST le slug (cohérent avec les articles existants).
 */
export async function POST(request) {
  const guard = await requirePlatformAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const title = String(body?.title || '').trim();
  if (!title) return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });

  const content = String(body?.content || '').trim();
  if (!content) return NextResponse.json({ error: 'Le contenu est requis' }, { status: 400 });

  const db = getAdminDb();
  const existingId = body?.id ? String(body.id).trim() : null;
  const slug = slugify(body?.slug || title);
  if (!slug) return NextResponse.json({ error: 'Slug invalide' }, { status: 400 });

  // Création : refuser un slug déjà pris
  if (!existingId) {
    const clash = await db.doc(`articles/${slug}`).get();
    if (clash.exists) {
      return NextResponse.json({ error: 'Un article avec ce lien (slug) existe déjà' }, { status: 409 });
    }
  }

  const docId = existingId || slug;
  const ref = db.doc(`articles/${docId}`);
  const snap = await ref.get();
  const now = new Date().toISOString();

  const tags = Array.isArray(body?.tags)
    ? body.tags
    : String(body?.tags || '').split(',').map((t) => t.trim()).filter(Boolean);

  const data = {
    id: docId,
    slug: existingId ? (snap.data()?.slug ?? docId) : slug,
    title,
    excerpt: String(body?.excerpt || '').trim(),
    category: String(body?.category || '').trim(),
    image: String(body?.image || '').trim(),
    author: String(body?.author || '').trim(),
    tags,
    content,
    published: body?.published !== false,
    updatedAt: now,
    // On préserve la date de publication d'origine si l'article existe déjà
    publishedAt: snap.exists ? (snap.data().publishedAt ?? now) : now,
  };

  await ref.set(data, { merge: true });

  return NextResponse.json({ ok: true, id: docId, slug: data.slug, created: !snap.exists });
}
