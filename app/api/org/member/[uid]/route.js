import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requireOrgAdmin } from '@/lib/orgAuth';
import { buildMemberRow } from '@/lib/orgReporting';
import { MODULE_NAMES } from '@/lib/moduleNames';

/**
 * GET /api/org/member/[uid]
 * Fiche détaillée d'UN membre. Chargée à la demande (jamais pour toute la liste).
 *
 * Un ORG_ADMIN ne peut consulter qu'un membre de SA propre organisation :
 * on compare l'orgId du membre visé à celui de l'appelant (résolu côté serveur).
 */
export async function GET(request, { params }) {
  const guard = await requireOrgAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const targetUid = String(params?.uid || '').trim();
  if (!targetUid) return NextResponse.json({ error: 'uid manquant' }, { status: 400 });

  const db = getAdminDb();
  const snap = await db.doc(`users/${targetUid}`).get();

  // Membre inconnu OU hors de l'organisation de l'appelant → 404 indifférencié
  // (on ne révèle pas l'existence d'un utilisateur d'une autre organisation).
  if (!snap.exists || snap.data().orgId !== guard.orgId) {
    return NextResponse.json({ error: 'Membre introuvable dans votre organisation' }, { status: 404 });
  }

  const user = snap.data();

  const [certsSnap, progressSnap] = await Promise.all([
    db.collection('certificates').where('userId', '==', targetUid).get(),
    db.collection(`users/${targetUid}/progress`).get(),
  ]);

  const certificates = certsSnap.docs.map((d) => {
    const c = d.data();
    return {
      id: d.id,
      moduleId: c.moduleId ?? null,
      moduleName: c.moduleId === null || c.moduleId === undefined
        ? null
        : (MODULE_NAMES[Number(c.moduleId)] ?? `Module ${c.moduleId}`),
      examType: c.examType ?? (c.moduleId === null ? 'GLOBAL' : 'MODULE'),
      score: c.score ?? null,
      issuedAt: c.issuedAt ?? c.createdAt ?? null,
    };
  }).sort((a, b) => new Date(b.issuedAt ?? 0) - new Date(a.issuedAt ?? 0));

  const progress = progressSnap.docs.map((d) => {
    const p = d.data();
    const id = Number(p.moduleId ?? d.id);
    return {
      moduleId: id,
      moduleName: MODULE_NAMES[id] ?? `Module ${id}`,
      score: p.score ?? null,
      completedAt: p.completedAt ?? null,
    };
  }).sort((a, b) => a.moduleId - b.moduleId);

  const row = buildMemberRow(targetUid, user, certificates);

  return NextResponse.json({
    member: {
      ...row,
      // Détail non exposé dans la liste
      modules: MODULE_NAMES.map((name, moduleId) => ({
        moduleId,
        name,
        score: row.scoresByModule[moduleId] ?? null,
        validated: row.scoresByModule[moduleId] !== undefined,
      })),
      certificates,
      progress,
    },
  });
}
