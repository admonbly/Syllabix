'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Great_Vibes } from 'next/font/google';
import QRCode from 'qrcode';
import { auth, userDB } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '@/lib/LanguageContext';
import { PARTNERS } from '@/lib/partners';
import { MODULE_COMPETENCIES } from '@/lib/moduleCompetencies';

// Police calligraphique — nom du lauréat et signature manuscrite
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: '400', display: 'swap' });

const MODULE_NAMES = {
  0: 'IT & Ordinateur',
  1: 'Internet',
  2: 'Email',
  3: 'Bureautique',
  4: 'Cybersécurité',
  5: 'Intelligence Artificielle',
  6: 'Employabilité',
};

function formatDate(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getLevel(score) {
  if (score >= 80) return { label: 'Avancé', color: '#27AE60', bg: '#e8f7ee' };
  if (score >= 60) return { label: 'Intermédiaire', color: '#E67E22', bg: '#fdf0e3' };
  return { label: 'Validé', color: '#1A237E', bg: '#eceffc' };
}

/**
 * Texte explicatif du niveau — différencié selon le type de certification.
 * Global : porte sur l'ensemble du référentiel (7 domaines).
 * Module : porte sur les 3 compétences du module concerné.
 */
function getMeaning(cert, level) {
  const isGlobal = cert.moduleId === null || cert.moduleId === undefined;

  if (isGlobal) {
    if (level.label === 'Avancé') {
      return 'Vous maîtrisez l\'ensemble des compétences numériques du référentiel Syllabix : ordinateur, Internet, email, bureautique, cybersécurité, intelligence artificielle et employabilité. Vous êtes autonome, y compris dans les situations complexes, et vous pouvez accompagner d\'autres personnes dans leur usage du numérique.';
    }
    if (level.label === 'Intermédiaire') {
      return 'Vous disposez de pratiques numériques solides sur l\'ensemble du référentiel Syllabix : vous utilisez efficacement un ordinateur, Internet et les outils bureautiques, vous communiquez en ligne de façon professionnelle et vous connaissez les règles essentielles de sécurité. Vous gagnerez en aisance sur les situations les plus avancées avec la pratique.';
    }
    return 'Vous disposez de pratiques numériques de base sur l\'ensemble du référentiel Syllabix et savez réaliser les tâches courantes, avec de l\'aide lorsque la situation se complique. Poursuivez l\'entraînement pour progresser vers le niveau supérieur.';
  }

  // Certification de module — s'appuie sur les compétences affichées du référentiel
  const mod = MODULE_COMPETENCIES.find((m) => m.moduleId === Number(cert.moduleId));
  const comps = mod ? mod.competences.map((co) => co.fr.toLowerCase()).join(', ') : 'les compétences de ce domaine';
  if (level.label === 'Avancé') {
    return `Vous maîtrisez les trois compétences de ce domaine du référentiel Syllabix — ${comps} — et savez les mobiliser de façon autonome, y compris dans des situations complexes ou inhabituelles.`;
  }
  if (level.label === 'Intermédiaire') {
    return `Vous mobilisez avec assurance les compétences de ce domaine du référentiel Syllabix — ${comps} — dans les situations courantes, et continuez de progresser sur les cas les plus avancés.`;
  }
  return `Vous disposez des bases de ce domaine du référentiel Syllabix — ${comps} — et savez les appliquer dans les situations simples du quotidien.`;
}

export default function CertificatePage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const c = (k) => t(`certificate.${k}`);
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const printRef = useRef(null);

  // QR code de vérification — pointe vers cette page publique
  useEffect(() => {
    if (typeof window === 'undefined') return;
    QRCode.toDataURL(`${window.location.origin}/certificate/${id}`, {
      width: 200,
      margin: 1,
      color: { dark: '#1A237E', light: '#ffffff' },
    })
      .then(setQrUrl)
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    const load = async () => {
      // Try public certificates collection first (accessible without auth)
      const publicCert = await userDB.getPublicCertificate(id);
      if (publicCert) {
        setCert(publicCert);
        setLoading(false);
        return;
      }
      // Fallback: check logged-in user's subcollection
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const certs = await userDB.getUserCertificates(user.uid);
          const found = certs.find((c) => c.id === id);
          if (found) { setCert(found); }
          else { setNotFound(true); }
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
    };
    load();
  }, [id]);

  const handlePrint = () => window.print();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert(c('linkCopied'));
  };

  const handleLinkedIn = () => {
    if (!cert) return;
    const issueDate = cert.issuedAt ? new Date(cert.issuedAt) : new Date();
    const certName = encodeURIComponent(
      cert.moduleId !== null && cert.moduleId !== undefined
        ? `Syllabix — Certificat de Compétences Numériques : ${MODULE_NAMES[cert.moduleId] || `Module ${cert.moduleId}`}`
        : 'Syllabix — Certificat de Compétences Numériques'
    );
    const certUrl = encodeURIComponent(`${window.location.origin}/certificate/${id}`);
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&issueYear=${issueDate.getFullYear()}&issueMonth=${issueDate.getMonth() + 1}&certUrl=${certUrl}&certId=${id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">{c('loading')}</p>
      </div>
    );
  }

  if (notFound || !cert) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-primary mb-3">{c('notFound')}</h1>
          <p className="text-neutral-600 mb-6">{c('notFoundDesc')}</p>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            {c('back')}
          </Link>
        </div>
      </div>
    );
  }

  const level = getLevel(cert.score);
  const isGlobal = cert.moduleId === null || cert.moduleId === undefined;
  const moduleName = isGlobal ? null : (MODULE_NAMES[cert.moduleId] || `Module ${cert.moduleId}`);
  const meaning = getMeaning(cert, level);

  return (
    <>
      {/* Styles print uniquement — A4 paysage */}
      <style>{`
        #certificate-printable, #certificate-printable * {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body * { visibility: hidden !important; }
          #certificate-printable, #certificate-printable * { visibility: visible !important; }
          #certificate-printable { position: fixed; inset: 0; margin: 0; width: 100vw; height: 100vh; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-blue-50 py-12 px-4">

        {/* Actions */}
        <div className="max-w-3xl mx-auto mb-6 flex flex-wrap gap-3 justify-between items-center no-print">
          <Link href="/dashboard" className="text-primary hover:underline font-medium text-sm">
            {c('back')}
          </Link>
          <div className="flex gap-3">
            <button
              onClick={handleLinkedIn}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0077B5] text-white rounded-xl font-semibold text-sm hover:bg-[#006097] transition-colors shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              {c('linkedin')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary hover:text-white transition-colors shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              {c('print')}
            </button>
          </div>
        </div>

        {/* Certificat visuel — signature graphique Syllabix */}
        <div
          id="certificate-printable"
          ref={printRef}
          className="max-w-5xl mx-auto shadow-2xl rounded-xl overflow-hidden lg:aspect-[1.414/1] flex flex-col lg:flex-row relative"
          style={{ background: '#ffffff' }}
        >
          {/* ── Bande tissée verticale (motif d'inspiration kente) ── */}
          <svg
            className="hidden lg:block flex-shrink-0 h-full"
            style={{ width: 46, background: '#111a5e' }}
            viewBox="0 0 46 700"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="kente" x="0" y="0" width="46" height="92" patternUnits="userSpaceOnUse">
                <rect width="46" height="92" fill="#111a5e" />
                <path d="M0 0 L23 20 L46 0 V10 L23 30 L0 10 Z" fill="#E67E22" />
                <path d="M0 34 L23 50 L46 34 V40 L23 56 L0 40 Z" fill="#c9a227" />
                <path d="M0 62 L23 78 L46 62 V68 L23 84 L0 68 Z" fill="#27AE60" />
                <circle cx="23" cy="90" r="1.6" fill="#c9a227" />
              </pattern>
            </defs>
            <rect width="46" height="700" fill="url(#kente)" />
          </svg>

          {/* ══════════ PANNEAU PRINCIPAL — ivoire ══════════ */}
          <div className="relative flex-1 flex flex-col px-9 py-7" style={{ background: '#fffdf9' }}>

            {/* Filet doré discret encadrant le panneau */}
            <div className="absolute pointer-events-none" style={{ inset: 10, border: '1px solid #e6d9b8', borderRadius: 6 }} aria-hidden="true" />

            {/* Filigrane logo en fond */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <div className="relative" style={{ width: 340, height: 340, opacity: 0.045 }}>
                <Image src="/syllabix-logo-simple.png" alt="" fill className="object-contain" sizes="340px" />
              </div>
            </div>

            {/* En-tête : logo + numéro */}
            <div className="relative flex items-start justify-between">
              <div className="relative" style={{ width: 165, height: 48 }}>
                <Image
                  src="/syllabix-logo-with-name.png"
                  alt="Syllabix"
                  fill
                  className="object-contain object-left"
                  sizes="165px"
                  priority
                />
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-neutral-400">Certificat n°</p>
                <p className="font-mono text-[11px] font-bold" style={{ color: '#1A237E' }}>{cert.id || id}</p>
              </div>
            </div>

            {/* Titre */}
            <div className="relative mt-5">
              <p className="text-[11px] uppercase font-bold" style={{ color: '#E67E22', letterSpacing: '0.45em' }}>
                {isGlobal ? 'Certification globale' : 'Certification de module'}
              </p>
              <h1 className="font-heading font-extrabold leading-[1.08] mt-1" style={{ color: '#1A237E', fontSize: 42 }}>
                Certificat de<br />Compétences Numériques
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <div style={{ height: 3, width: 46, background: '#E67E22', borderRadius: 2 }} />
                <div style={{ height: 3, width: 14, background: '#c9a227', borderRadius: 2 }} />
                <div style={{ height: 3, width: 6, background: '#27AE60', borderRadius: 2 }} />
              </div>
              <p className="text-[13px] text-neutral-500 mt-3">
                {isGlobal
                  ? 'Examen global couvrant les 7 domaines du référentiel Syllabix, épreuves pratiques incluses.'
                  : <>Examen dédié au domaine <strong style={{ color: '#1A237E' }}>{moduleName}</strong> du référentiel Syllabix.</>}
              </p>
            </div>

            {/* Lauréat */}
            <div className="relative mt-5">
              <p className="text-[12px] uppercase tracking-widest text-neutral-400">est décerné à</p>
              <p className={greatVibes.className} style={{ fontSize: 52, color: '#1A237E', lineHeight: 1.15, marginTop: 2 }}>
                {cert.displayName || 'Apprenant'}
              </p>
              <div style={{ height: 1, width: 300, background: 'linear-gradient(to right, #c9a227, transparent)', marginTop: -2 }} />
            </div>

            {/* Pied : date + signature + partenaires */}
            <div className="relative mt-auto pt-4 flex items-end justify-between gap-6">
              <div>
                <p className="text-[13px] text-neutral-600">Fait le {formatDate(cert.issuedAt)}</p>
                <p className={greatVibes.className} style={{ fontSize: 34, color: '#1a2a6c', transform: 'rotate(-4deg)', width: 'fit-content', margin: '4px 0 -4px 6px' }}>
                  Syllabix
                </p>
                <div style={{ height: 1, width: 170, background: '#bbb' }} />
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 mt-1">La Direction de la Certification</p>
              </div>

              <div className="text-right">
                <p className="text-[8px] font-semibold uppercase text-neutral-400 mb-1.5" style={{ letterSpacing: '0.2em' }}>
                  Partenaires institutionnels
                </p>
                <div className="flex items-center justify-end gap-4 flex-wrap">
                  {PARTNERS.map((partner) => (
                    <div key={partner.id} className="relative" style={{ width: 52, height: 30 }}>
                      <Image
                        src={partner.logo}
                        alt={partner.shortName}
                        fill
                        className="object-contain"
                        sizes="52px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══════════ PANNEAU DROIT — bleu nuit ══════════ */}
          <div
            className="relative lg:w-[36%] flex flex-col items-center px-7 py-7 text-center"
            style={{ background: 'linear-gradient(165deg, #161f6d 0%, #1A237E 45%, #10154a 100%)' }}
          >
            {/* Texture de fond : fines diagonales */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 9px)' }}
            />
            {/* Halo doré derrière l'anneau */}
            <div
              className="absolute pointer-events-none"
              aria-hidden="true"
              style={{ top: 24, left: '50%', transform: 'translateX(-50%)', width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,39,0.22), transparent 65%)' }}
            />

            {/* Anneau de score */}
            <div className="relative" style={{ width: 158, height: 158 }}>
              <svg viewBox="0 0 120 120" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="9" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={level.color === '#1A237E' ? '#c9a227' : level.color}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${(cert.score / 100) * 326.7} 326.7`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-heading font-extrabold text-white" style={{ fontSize: 42, lineHeight: 1 }}>
                  {cert.score}<span style={{ fontSize: 20 }}>%</span>
                </p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>de réussite</p>
              </div>
            </div>

            {/* Niveau */}
            <span
              className="relative mt-3 px-6 py-1.5 rounded-full font-bold text-white text-base"
              style={{ background: level.color === '#1A237E' ? '#c9a227' : level.color, boxShadow: '0 3px 12px rgba(0,0,0,0.3)' }}
            >
              Niveau {level.label}
            </span>

            {/* Signification */}
            <div className="relative mt-5 text-left">
              <p className="font-bold text-[13px] mb-1.5" style={{ color: '#c9a227' }}>
                Ce niveau atteste que :
              </p>
              <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {meaning}
              </p>
              <p className="text-[10px] mt-2.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {isGlobal
                  ? 'Certification globale : 32 questions dont des épreuves pratiques, en conditions contrôlées, sur les 7 domaines du référentiel.'
                  : 'Certification de module : la certification globale, qui évalue les 7 domaines en un seul examen, complète ce certificat.'}
              </p>
            </div>

            {/* QR code de vérification */}
            <div className="relative mt-auto pt-4 flex items-center gap-3">
              <div className="bg-white rounded-lg p-1.5 flex-shrink-0" style={{ width: 76, height: 76 }}>
                {qrUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrUrl} alt="QR code de vérification" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full rounded" style={{ background: '#eceffc' }} />
                )}
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-white">Certificat vérifiable</p>
                <p className="text-[10px] leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Scannez ce code ou saisissez<br />l'identifiant sur syllabix.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Partage social supplémentaire */}
        <div className="max-w-3xl mx-auto mt-6 text-center no-print">
          <p className="text-sm text-neutral-500">
            {c('share')}{' '}
            <button onClick={handleCopyLink} className="text-primary font-medium hover:underline">
              {c('copyLink')}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
