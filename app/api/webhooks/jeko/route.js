import { NextResponse } from 'next/server';

/**
 * POST /api/webhooks/jeko  — Récepteur de webhook Jeko (Phase 1, paiement).
 *
 * ⚠️ ÉTAPE 1 (débloquer l'enregistrement Jeko) : ce endpoint ACCUSE RÉCEPTION
 * (200) et journalise l'événement. Il ne génère PAS encore de voucher.
 *
 * ÉTAPE 2 (à venir, après lecture de la doc webhook Jeko) :
 *   - vérifier la SIGNATURE de la requête (secret partagé JEKO_WEBHOOK_SECRET)
 *     pour n'accepter QUE les appels authentiques de Jeko ;
 *   - selon l'événement (paiement confirmé), générer le(s) voucher(s) payé(s)
 *     via l'Admin SDK et les rattacher au partenaire / à l'acheteur ;
 *   - rester idempotent (un même événement peut être renvoyé plusieurs fois).
 *
 * Le webhook DOIT répondre vite (2xx) sinon Jeko réessaie. On acquitte donc
 * immédiatement et on traitera l'événement de façon asynchrone une fois la
 * logique en place.
 */

export async function POST(request) {
  let payload = null;
  try {
    payload = await request.json();
  } catch {
    // Certains webhooks envoient du texte/urlencoded ; on ne bloque pas.
    try { payload = await request.text(); } catch { payload = null; }
  }

  // Journalisation temporaire (visible dans les logs Vercel) pour inspecter le
  // format réel des événements Jeko et construire la vérification de signature.
  console.log('[jeko webhook] event reçu:', JSON.stringify(payload)?.slice(0, 2000));

  // TODO Phase 1 : vérifier la signature + générer les vouchers payés.

  // Acquittement immédiat.
  return NextResponse.json({ received: true });
}

// Certaines plateformes testent l'URL par un GET lors de l'enregistrement.
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'jeko-webhook' });
}

export const dynamic = 'force-dynamic';
