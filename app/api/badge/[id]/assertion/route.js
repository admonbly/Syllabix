import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { SITE_URL as ORIGIN } from '@/lib/siteUrl';

/**
 * GET /api/badge/[id]/assertion
 * Assertion Open Badges v2 (standard 1EdTech, gratuit) pour un badge public.
 * Permet une portabilité future (Credly/Badgr/backpacks) sans dépendance payante.
 *
 * Vie privée : on n'expose PAS l'email. L'identité du récipiendaire est le nom
 * public déjà affiché sur la page /b/[id].
 */

export async function GET(_request, { params }) {
  const { id } = params;
  let badge = null;
  try {
    const snap = await getAdminDb().doc(`publicBadges/${id}`).get();
    badge = snap.exists ? snap.data() : null;
  } catch { /* 404 ci-dessous */ }

  if (!badge) {
    return NextResponse.json({ error: 'Badge introuvable' }, { status: 404 });
  }

  const assertion = {
    '@context': 'https://w3id.org/openbadges/v2',
    type: 'Assertion',
    id: `${ORIGIN}/api/badge/${id}/assertion`,
    recipient: {
      type: 'name',
      hashed: false,
      identity: badge.displayName || 'Apprenant Syllabix',
    },
    issuedOn: badge.earnedAt || badge.updatedAt || new Date().toISOString(),
    verification: { type: 'HostedBadge' },
    badge: {
      type: 'BadgeClass',
      id: `${ORIGIN}/b/${id}`,
      name: `${badge.moduleName} — Syllabix`,
      description: `Badge Syllabix (${badge.level}) obtenu avec ${badge.score ?? 0}%.`,
      image: `${ORIGIN}/b/${id}/opengraph-image`,
      criteria: { narrative: 'Réussite d’un défi ou d’une certification Syllabix.' },
      issuer: {
        type: 'Issuer',
        id: `${ORIGIN}`,
        name: 'Syllabix',
        url: ORIGIN,
      },
    },
  };

  return NextResponse.json(assertion, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}
