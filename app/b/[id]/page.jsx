import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminDb } from '@/lib/firebaseAdmin';
import ShareButtons from '@/components/ShareButtons';

export const dynamic = 'force-dynamic';

const LEVEL = {
  learning: { label: "Badge d'apprentissage", color: '#D97706', soft: '#FEF3C7' },
  module:   { label: 'Certification de module', color: '#E67E22', soft: '#FDF0E3' },
  global:   { label: 'Certification globale',   color: '#1A237E', soft: '#ECEFFC' },
};

async function getBadge(id) {
  try {
    const snap = await getAdminDb().doc(`publicBadges/${id}`).get();
    return snap.exists ? snap.data() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const badge = await getBadge(params.id);
  if (!badge) return { title: 'Badge — Syllabix' };
  const lvl = LEVEL[badge.level] ?? LEVEL.learning;
  const title = `${badge.displayName} — ${badge.moduleName} · Syllabix`;
  const description = `${lvl.label} obtenu avec ${badge.score}% sur Syllabix, la certification des compétences numériques.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'profile' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
}

export default async function PublicBadgePage({ params }) {
  const badge = await getBadge(params.id);
  if (!badge) notFound();

  const lvl = LEVEL[badge.level] ?? LEVEL.learning;
  const shareText = `J'ai obtenu mon badge « ${badge.moduleName} » sur Syllabix ! 🎓`;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-14 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-card border border-neutral-100 overflow-hidden">
          {/* Bandeau couleur du niveau */}
          <div className="h-2" style={{ backgroundColor: lvl.color }} />

          <div className="p-8 text-center">
            <div
              className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl"
              style={{ backgroundColor: lvl.soft }}
            >
              🏅
            </div>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
              style={{ backgroundColor: lvl.soft, color: lvl.color }}
            >
              {lvl.label}
            </span>
            <h1 className="text-2xl font-heading font-bold text-primary mb-1">{badge.moduleName}</h1>
            <p className="text-neutral-500 mb-1">
              obtenu par <span className="font-semibold text-neutral-700">{badge.displayName}</span>
            </p>
            <p className="text-sm text-neutral-400 mb-6">
              {badge.score}% · {formatDate(badge.earnedAt)} · Vérifié ✓
            </p>

            <div className="border-t border-neutral-100 pt-6">
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-3">Partager</p>
              <div className="flex justify-center">
                <ShareButtons url={`https://syllabix-eight.vercel.app/b/${params.id}`} text={shareText} />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-neutral-500 mb-3">Toi aussi, teste ton niveau numérique gratuitement.</p>
          <Link
            href="/defi"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-display font-semibold transition-colors"
          >
            Relever un défi Syllabix →
          </Link>
          <p className="mt-4 text-xs text-neutral-400">
            <a href={`/api/badge/${params.id}/assertion`} className="hover:text-neutral-600 underline">
              Assertion Open Badges
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
