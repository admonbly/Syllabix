import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requireOrgAdmin } from '@/lib/orgAuth';
import {
  buildMemberRow, computeOverview, computeModuleBreakdown,
  computeUnitBreakdown,
} from '@/lib/orgReporting';

// Limite Firestore de l'opérateur `in`
const IN_CHUNK = 30;
// Au-delà, on tronque et on le signale plutôt que de faire ramer la page.
const MAX_MEMBERS = 200;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * GET /api/org/dashboard
 * Agrégats + liste des membres de l'organisation de l'appelant.
 *
 * L'orgId n'est jamais lu depuis la requête : il vient du profil serveur de
 * l'appelant (voir lib/orgAuth). Un ORG_ADMIN ne peut donc pas consulter une
 * autre organisation.
 *
 * Coût : 1 requête membres + ceil(N/30) requêtes certificats (~5 pour 100 membres).
 */
export async function GET(request) {
  const guard = await requireOrgAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { orgId, org } = guard;
  const db = getAdminDb();

  // 1. Les membres — fournit identité ET badges (donc les scores par module)
  const membersSnap = await db.collection('users')
    .where('orgId', '==', orgId)
    .limit(MAX_MEMBERS + 1)
    .get();

  const truncated = membersSnap.size > MAX_MEMBERS;
  const memberDocs = membersSnap.docs.slice(0, MAX_MEMBERS);
  const uids = memberDocs.map((d) => d.id);

  // 2. Les certificats, par lots de 30 (les certificats portent un champ userId)
  const certsByUid = new Map();
  if (uids.length) {
    const results = await Promise.all(
      chunk(uids, IN_CHUNK).map((part) =>
        db.collection('certificates').where('userId', 'in', part).get(),
      ),
    );
    for (const snap of results) {
      for (const doc of snap.docs) {
        const c = doc.data();
        if (!certsByUid.has(c.userId)) certsByUid.set(c.userId, []);
        certsByUid.get(c.userId).push({
          id: doc.id,
          moduleId: c.moduleId ?? null,
          examType: c.examType ?? (c.moduleId === null ? 'GLOBAL' : 'MODULE'),
          score: c.score ?? null,
          issuedAt: c.issuedAt ?? c.createdAt ?? null,
        });
      }
    }
  }

  // 3. Agrégats en mémoire
  const rows = memberDocs.map((d) => buildMemberRow(d.id, d.data(), certsByUid.get(d.id) ?? []));
  rows.sort((a, b) => {
    if (!a.lastActivity && !b.lastActivity) return a.displayName.localeCompare(b.displayName);
    if (!a.lastActivity) return 1;
    if (!b.lastActivity) return -1;
    return new Date(b.lastActivity) - new Date(a.lastActivity);
  });

  return NextResponse.json({
    org: {
      id: orgId,
      name: org.name,
      type: org.type,
      city: org.city ?? null,
      accessCode: org.accessCode,
      accessCodeActive: org.accessCodeActive !== false,
      units: org.units ?? [],
    },
    overview: computeOverview(rows),
    modules: computeModuleBreakdown(rows),
    unitBreakdown: computeUnitBreakdown(rows, org.units ?? []),
    members: rows,
    truncated,
    maxMembers: MAX_MEMBERS,
  });
}
