import { ImageResponse } from 'next/og';
import { MODULE_NAMES } from '@/lib/moduleNames';

// Edge runtime (voir b/[id]/opengraph-image.jsx). Données via REST Firestore :
// la collection certificates est en lecture publique.
export const runtime = 'edge';
export const alt = 'Certificat Syllabix';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function getCert(id) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/certificates/${id}?key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const doc = await res.json();
    const f = doc.fields || {};
    const moduleId = f.moduleId?.integerValue != null ? Number(f.moduleId.integerValue)
      : (f.moduleId?.nullValue !== undefined ? null : undefined);
    return {
      displayName: f.displayName?.stringValue || 'Apprenant Syllabix',
      moduleId,
      score: f.score?.integerValue != null ? Number(f.score.integerValue) : null,
    };
  } catch { return null; }
}

export default async function Image({ params }) {
  const cert = await getCert(params.id);
  const name = cert?.displayName || 'Apprenant Syllabix';
  const isGlobal = cert?.moduleId === null || cert?.moduleId === undefined;
  const title = isGlobal
    ? 'Certification globale'
    : (MODULE_NAMES[Number(cert?.moduleId)] || 'Certification de module');
  const score = cert?.score ?? null;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
        <div style={{ height: 14, background: 'linear-gradient(90deg, #1A237E, #E67E22)' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 80, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#1A237E' }}>Syllabix</div>
            <div style={{ fontSize: 22, color: '#94a3b8' }}>Certificat de compétences numériques</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 28, color: '#E67E22', fontWeight: 700 }}>Certificat delivre a</div>
            <div style={{ display: 'flex', fontSize: 68, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{name}</div>
            <div style={{ display: 'flex', fontSize: 38, color: '#475569', marginTop: 10 }}>
              {`${title}${score !== null ? ` · ${score}%` : ''}`}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: 26, color: '#64748b' }}>
            Verifiable en ligne · syllabix-eight.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
