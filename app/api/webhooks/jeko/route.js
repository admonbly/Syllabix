import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * POST /api/webhooks/jeko — Récepteur de webhook Jeko (paiement Mobile Money / carte).
 *
 * SÉCURITÉ (fait) : chaque webhook Jeko est signé. On vérifie l'en-tête
 * `Jeko-Signature` = HMAC-SHA256 du CORPS BRUT (raw body) avec le webhook secret
 * (env JEKO_WEBHOOK_SECRET, obtenu dans le Cockpit Jeko). Comparaison à temps
 * constant. On répond 200 en < 5 s (sinon Jeko réessaie).
 *
 * FULFILLMENT (à venir — cadrage Phase 1) : sur `event: transaction.completed`
 * avec `data.status === 'success'`, générer le(s) voucher(s) payé(s) et les
 * rattacher à la commande identifiée par `data.transactionDetails.reference`.
 * Nécessite d'abord : grille de prix + parcours d'achat + modèle de commande
 * (paymentOrders). Idempotence obligatoire (un même événement peut être renvoyé).
 *
 * Format d'un événement (extrait) :
 *   { event, data: { id, amount:{amount,currency}, status:'success'|'error',
 *     transactionType:'payment'|'transfer',
 *     transactionDetails:{ id, reference, paymentLinkId } }, timestamp }
 */

function verifySignature(rawBody, signature, secret) {
  if (!signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const a = Buffer.from(signature, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request) {
  // 1. Corps BRUT (indispensable pour la signature — ne pas parser avant).
  const rawBody = await request.text();
  const signature = request.headers.get('jeko-signature') || request.headers.get('Jeko-Signature');
  const secret = process.env.JEKO_WEBHOOK_SECRET;

  // 2. Vérification de signature.
  if (secret) {
    if (!verifySignature(rawBody, signature, secret)) {
      console.warn('[jeko webhook] signature invalide — rejeté');
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
    }
  } else {
    // Secret non configuré : on n'ouvre pas de faille silencieuse, mais on ne
    // casse pas la config Jeko pendant la mise en place — on journalise.
    console.warn('[jeko webhook] JEKO_WEBHOOK_SECRET absent — signature non vérifiée');
  }

  // 3. Parsing après vérification.
  let payload = null;
  try { payload = JSON.parse(rawBody); } catch { payload = null; }

  const event = payload?.event;
  const data = payload?.data || {};

  if (event === 'transaction.completed' && data.status === 'success' && data.transactionType === 'payment') {
    // Paiement authentique confirmé.
    console.log('[jeko webhook] paiement confirmé:', JSON.stringify({
      txId: data.id,
      reference: data.transactionDetails?.reference,
      amount: data.amount,
      method: data.paymentMethod,
    }));
    // TODO Phase 1 : retrouver la commande via reference → générer les vouchers
    // payés (Admin SDK) → marquer la commande payée (idempotent).
  } else {
    console.log('[jeko webhook] événement reçu (non traité):', event, data.status);
  }

  // 4. Acquittement immédiat.
  return NextResponse.json({ received: true });
}

// Test d'URL par GET lors de l'enregistrement dans Jeko.
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'jeko-webhook' });
}

export const dynamic = 'force-dynamic';
