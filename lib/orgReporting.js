import { MODULE_NAMES } from '@/lib/moduleNames';
import { PIX_DOMAINS, PIX_COMPETENCIES } from '@/lib/pixMapping';

/**
 * Calculs de reporting pour le tableau de bord organisation.
 *
 * Fonctions pures : elles prennent des données déjà chargées et ne touchent
 * jamais à Firestore. Les agrégats sont calculés en mémoire (pas en base),
 * ce qui permet de tenir 100+ membres avec ~5 requêtes seulement.
 *
 * Limite assumée : seuls les modules RÉUSSIS produisent un badge. On sait donc
 * ce qui est validé, jamais ce qui a été échoué.
 */

const ACTIVE_WINDOW_DAYS = 30;
export const TOTAL_MODULES = MODULE_NAMES.length;

/** Score par module d'un membre, à partir de ses badges : { moduleId: score }. */
export function scoresByModule(badges = []) {
  const out = {};
  for (const b of badges) {
    const id = Number(b?.moduleId);
    const score = Number(b?.score);
    if (!Number.isFinite(id) || !Number.isFinite(score)) continue;
    // Un module peut avoir plusieurs badges (repassages) : on garde le meilleur.
    out[id] = Math.max(out[id] ?? 0, score);
  }
  return out;
}

/** Date de dernière activité connue (badge ou certificat le plus récent). */
export function lastActivityOf(badges = [], certs = []) {
  const dates = [
    ...badges.map((b) => b?.earnedAt),
    ...certs.map((c) => c?.issuedAt),
  ].filter(Boolean).map((d) => new Date(d).getTime()).filter((n) => Number.isFinite(n));
  return dates.length ? new Date(Math.max(...dates)).toISOString() : null;
}

/** Construit la ligne d'un membre pour la liste. */
export function buildMemberRow(uid, user, certs = []) {
  const badges = user.badges ?? [];
  const scores = scoresByModule(badges);
  const values = Object.values(scores);
  const modulesValidated = values.length;
  const avgScore = values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : null;

  const displayName = user.displayName
    || [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    || user.email
    || 'Apprenant';

  return {
    uid,
    displayName,
    email: user.email ?? '',
    orgUnit: user.orgUnit ?? null,
    joinedOrgAt: user.orgJoinedAt ?? null,
    modulesValidated,
    totalModules: TOTAL_MODULES,
    avgScore,
    scoresByModule: scores,
    certificateCount: certs.length,
    hasGlobalCertificate: certs.some((c) => c.examType === 'GLOBAL' || c.moduleId === null),
    lastActivity: lastActivityOf(badges, certs),
  };
}

/** Indicateurs de la vue d'ensemble. */
export function computeOverview(rows) {
  const total = rows.length;
  if (total === 0) {
    return { totalMembers: 0, certifiedCount: 0, certificationRate: 0, avgScore: null, activeCount: 0, activeWindowDays: ACTIVE_WINDOW_DAYS };
  }

  const certifiedCount = rows.filter((r) => r.certificateCount > 0).length;

  const scored = rows.filter((r) => r.avgScore !== null);
  const avgScore = scored.length
    ? Math.round(scored.reduce((a, r) => a + r.avgScore, 0) / scored.length)
    : null;

  const cutoff = Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const activeCount = rows.filter(
    (r) => r.lastActivity && new Date(r.lastActivity).getTime() >= cutoff,
  ).length;

  return {
    totalMembers: total,
    certifiedCount,
    certificationRate: Math.round((certifiedCount / total) * 100),
    avgScore,
    activeCount,
    activeWindowDays: ACTIVE_WINDOW_DAYS,
  };
}

/**
 * Couverture par compétence Pix.
 * Le score d'une compétence = moyenne, sur les membres l'ayant validée, des
 * scores des modules Syllabix qui la couvrent.
 * `coverage` = part des membres ayant validé au moins un module de la compétence.
 */
export function computePixCoverage(rows) {
  const memberCount = rows.length;

  const competencies = PIX_COMPETENCIES.map((comp) => {
    const perMember = [];
    for (const row of rows) {
      const scores = comp.moduleIds
        .map((m) => row.scoresByModule[m])
        .filter((s) => Number.isFinite(s));
      if (scores.length) {
        perMember.push(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    }
    const avgScore = perMember.length
      ? Math.round(perMember.reduce((a, b) => a + b, 0) / perMember.length)
      : null;

    return {
      code: comp.code,
      domainId: comp.domainId,
      nameFr: comp.nameFr,
      nameEn: comp.nameEn,
      moduleIds: comp.moduleIds,
      moduleNames: comp.moduleIds.map((m) => MODULE_NAMES[m] ?? `Module ${m}`),
      avgScore,
      validatedCount: perMember.length,
      coverage: memberCount ? Math.round((perMember.length / memberCount) * 100) : 0,
    };
  });

  const domains = PIX_DOMAINS.map((domain) => {
    const own = competencies.filter((c) => c.domainId === domain.id);
    const scored = own.filter((c) => c.avgScore !== null);
    return {
      id: domain.id,
      code: domain.code,
      nameFr: domain.nameFr,
      nameEn: domain.nameEn,
      descFr: domain.descFr,
      avgScore: scored.length
        ? Math.round(scored.reduce((a, c) => a + c.avgScore, 0) / scored.length)
        : null,
      coverage: own.length
        ? Math.round(own.reduce((a, c) => a + c.coverage, 0) / own.length)
        : 0,
      competencies: own,
    };
  });

  return { domains };
}

/**
 * Répartition par unité (classe/filière ou direction).
 * C'est ce qui permet de comparer les groupes entre eux : « la Terminale D est
 * en retard », « la direction commerciale a besoin de bureautique ».
 * Les membres sans unité sont regroupés à part (jamais masqués).
 */
export function computeUnitBreakdown(rows, declaredUnits = []) {
  const byUnit = new Map();
  // On part de la liste déclarée pour qu'une unité vide apparaisse quand même
  for (const name of declaredUnits) byUnit.set(name, []);

  const noUnit = [];
  for (const row of rows) {
    if (!row.orgUnit) { noUnit.push(row); continue; }
    if (!byUnit.has(row.orgUnit)) byUnit.set(row.orgUnit, []);
    byUnit.get(row.orgUnit).push(row);
  }

  const summarize = (name, members) => {
    const scored = members.filter((m) => m.avgScore !== null);
    const certified = members.filter((m) => m.certificateCount > 0).length;
    return {
      name,
      memberCount: members.length,
      avgScore: scored.length
        ? Math.round(scored.reduce((a, m) => a + m.avgScore, 0) / scored.length)
        : null,
      certifiedCount: certified,
      certificationRate: members.length ? Math.round((certified / members.length) * 100) : 0,
      avgModulesValidated: members.length
        ? Math.round((members.reduce((a, m) => a + m.modulesValidated, 0) / members.length) * 10) / 10
        : 0,
    };
  };

  const units = [...byUnit.entries()]
    .map(([name, members]) => summarize(name, members))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  return {
    units,
    withoutUnit: noUnit.length ? summarize(null, noUnit) : null,
  };
}

/** Répartition module par module (combien de membres l'ont validé, score moyen). */
export function computeModuleBreakdown(rows) {
  return MODULE_NAMES.map((name, moduleId) => {
    const scores = rows
      .map((r) => r.scoresByModule[moduleId])
      .filter((s) => Number.isFinite(s));
    return {
      moduleId,
      name,
      validatedCount: scores.length,
      coverage: rows.length ? Math.round((scores.length / rows.length) * 100) : 0,
      avgScore: scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null,
    };
  });
}
