import { ImageResponse } from 'next/og';

// Edge runtime : évite le bug Windows de @vercel/og (chargement de police) et
// n'utilise pas firebase-admin (incompatible edge). Les données sont lues via
// l'API REST Firestore — la collection publicBadges est en lecture publique.
export const runtime = 'edge';
export const alt = 'Badge Syllabix';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const LEVEL = {
  learning: { label: "Badge d'apprentissage", color: '#D97706' },
  module:   { label: 'Certification de module', color: '#E67E22' },
  global:   { label: 'Certification globale',   color: '#1A237E' },
};

async function getBadge(id) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/publicBadges/${id}?key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const doc = await res.json();
    const f = doc.fields || {};
    return {
      displayName: f.displayName?.stringValue || 'Apprenant Syllabix',
      moduleName: f.moduleName?.stringValue || 'Compétences numériques',
      level: f.level?.stringValue || 'learning',
      score: f.score?.integerValue != null ? Number(f.score.integerValue) : null,
    };
  } catch { return null; }
}

export default async function Image({ params }) {
  const badge = await getBadge(params.id);
  const lvl = (badge && LEVEL[badge.level]) || LEVEL.learning;
  const name = badge?.displayName || 'Apprenant Syllabix';
  const moduleName = badge?.moduleName || 'Compétences numériques';
  const score = badge?.score ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(135deg, #1A237E 0%, #283593 100%)',
          color: 'white', padding: 80, justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: 40, fontWeight: 800 }}>Syllabix</div>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)' }}>Certification des compétences numériques</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '10px 22px', borderRadius: 999, background: lvl.color, fontSize: 26, fontWeight: 700 }}>
            {lvl.label}
          </div>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, marginTop: 16 }}>{moduleName}</div>
          <div style={{ display: 'flex', fontSize: 34, color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>
            {`obtenu par ${name}${score !== null ? ` · ${score}%` : ''}`}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', fontSize: 26, color: 'rgba(255,255,255,0.7)' }}>
          Badge verifie · syllabix-eight.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
