import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin';
import { getModuleName } from '@/lib/moduleNames';

// Échappe le HTML pour empêcher toute injection dans le corps de l'email
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request) {
  // Vérification de l'origine — bloque les appels externes
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://syllabix.com',
    'https://syllabix-eight.vercel.app',
    'http://localhost:3000',
  ].filter(Boolean);
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Si pas de clé Resend configurée, on skip silencieusement
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ skipped: true, reason: 'RESEND_API_KEY not configured' });
  }

  // Authentification obligatoire — l'appelant doit être connecté
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { certId } = body;
  if (!certId || typeof certId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(certId)) {
    return NextResponse.json({ error: 'Missing or invalid certId' }, { status: 400 });
  }

  // Le certificat doit exister ET appartenir à l'appelant —
  // toutes les données de l'email viennent de la base, jamais du client
  const certRef = getAdminDb().doc(`certificates/${certId}`);
  const certSnap = await certRef.get();
  if (!certSnap.exists || certSnap.data().userId !== decoded.uid) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }
  const cert = certSnap.data();

  const email = decoded.email;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ skipped: true, reason: 'No verified email on account' });
  }

  // Garde-fou durable (survit aux cold starts) : un email de félicitations
  // n'est envoyé qu'une seule fois par certificat
  if (cert.emailSentAt) {
    return NextResponse.json({ skipped: true, reason: 'already sent' });
  }

  const { score, moduleId, displayName } = cert;
  const certTitle = moduleId !== null && moduleId !== undefined
    ? getModuleName(moduleId)
    : 'Certificat de Compétences Numériques';

  const certUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://syllabix.com'}/certificate/${certId}`;
  const name = escapeHtml(displayName || email.split('@')[0]);

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Votre certificat Syllabix</title></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1A237E,#E67E22);padding:40px 40px 30px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">🏆 Syllabix</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:2px;text-transform:uppercase;">
            Certification obtenue
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="color:#333;font-size:16px;margin:0 0 16px;">Bonjour <strong>${name}</strong>,</p>
          <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Félicitations ! Vous avez réussi votre certification <strong>${certTitle}</strong> sur Syllabix avec un score de
            <strong style="color:#E67E22;font-size:18px;"> ${score}%</strong>.
          </p>

          <!-- Score badge -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px;">
            <tr>
              <td style="background:#f0f3ff;border-radius:10px;padding:20px;text-align:center;border-left:4px solid #1A237E;">
                <p style="margin:0;color:#1A237E;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Score obtenu</p>
                <p style="margin:8px 0 0;color:#1A237E;font-size:36px;font-weight:bold;">${score}%</p>
                <p style="margin:4px 0 0;color:#666;font-size:13px;">${certTitle}</p>
              </td>
            </tr>
          </table>

          <p style="color:#555;font-size:15px;margin:0 0 24px;">
            Votre certificat officiel est disponible en ligne. Vous pouvez le partager sur LinkedIn ou l'imprimer.
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 30px;">
            <tr>
              <td style="background:#1A237E;border-radius:8px;padding:0;">
                <a href="${certUrl}" style="display:block;padding:14px 32px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;">
                  📜 Voir mon certificat
                </a>
              </td>
            </tr>
          </table>

          <p style="color:#999;font-size:13px;border-top:1px solid #eee;padding-top:20px;margin:0;">
            ID du certificat : <code style="background:#f5f5f5;padding:2px 6px;border-radius:4px;font-size:11px;">${certId}</code>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f9ff;padding:20px 40px;text-align:center;border-top:1px solid #e8ecff;">
          <p style="margin:0;color:#999;font-size:12px;">
            Syllabix — Plateforme de certification numérique<br>
            <a href="https://syllabix.com" style="color:#1A237E;">syllabix.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'certifications@syllabix.com',
        to: [email],
        subject: `🏆 Vous avez obtenu votre certificat ${certTitle} — Syllabix`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return NextResponse.json({ error: 'Email sending failed' }, { status: 500 });
    }

    // Marque l'envoi pour empêcher tout doublon ultérieur
    await certRef.update({ emailSentAt: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Notify certificate error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
