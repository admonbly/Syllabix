'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Great_Vibes } from 'next/font/google';
import { auth, userDB } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '@/lib/LanguageContext';
import { PARTNERS } from '@/lib/partners';

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
  if (score >= 80) return { label: 'Avancé', color: '#27AE60' };
  if (score >= 60) return { label: 'Intermédiaire', color: '#E67E22' };
  return { label: 'Validé', color: '#1A237E' };
}

export default function CertificatePage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const c = (k) => t(`certificate.${k}`);
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const printRef = useRef(null);

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
        ? `Syllabix — ${MODULE_NAMES[cert.moduleId] || `Module ${cert.moduleId}`}`
        : 'Syllabix — Certification Numérique Complète'
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
  const certTitle = cert.moduleId !== null && cert.moduleId !== undefined
    ? `${MODULE_NAMES[cert.moduleId] || `Module ${cert.moduleId}`}`
    : 'Certification Numérique Complète';
  const examLabel = cert.examType === 'MODULE' ? c('certType.module') : c('certType.global');

  return (
    <>
      {/* Styles print uniquement — A4 paysage */}
      <style>{`
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

        {/* Certificat visuel — diplôme A4 PAYSAGE */}
        <div
          id="certificate-printable"
          ref={printRef}
          className="max-w-5xl mx-auto shadow-2xl lg:aspect-[1.414/1]"
          style={{ background: '#fffdf8', border: '10px double #1A237E', padding: '8px' }}
        >
          {/* Frise dorée intermédiaire */}
          <div
            className="lg:h-full"
            style={{
              padding: '5px',
              background:
                'repeating-linear-gradient(45deg, #c9a227 0 6px, #fffdf8 6px 12px)',
            }}
          >
            {/* Cadre intérieur ivoire */}
            <div
              className="relative lg:h-full flex flex-col"
              style={{ background: '#fffdf8', border: '1.5px solid #c9a227', padding: '22px 32px 18px' }}
            >
              {/* Filigrane central — logo en fond très pâle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                <div className="relative" style={{ width: 420, height: 420, opacity: 0.05 }}>
                  <Image src="/syllabix-logo-simple.png" alt="" fill className="object-contain" sizes="420px" />
                </div>
              </div>

              {/* Volutes ornementales dans les 4 coins */}
              {[
                { top: 6, left: 6, transform: 'none' },
                { top: 6, right: 6, transform: 'scaleX(-1)' },
                { bottom: 6, left: 6, transform: 'scaleY(-1)' },
                { bottom: 6, right: 6, transform: 'scale(-1,-1)' },
              ].map((pos, i) => (
                <svg
                  key={i}
                  className="absolute pointer-events-none"
                  style={{ ...pos, width: 88, height: 88 }}
                  viewBox="0 0 100 100"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M2 2 H62 M2 2 V62" stroke="#c9a227" strokeWidth="3.5" />
                  <path d="M8 8 H48 M8 8 V48" stroke="#c9a227" strokeWidth="1.2" />
                  <path d="M48 8 C 62 8, 66 20, 58 26 C 52 30, 44 26, 46 19 C 47 14, 53 13, 55 17"
                    stroke="#c9a227" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M8 48 C 8 62, 20 66, 26 58 C 30 52, 26 44, 19 46 C 14 47, 13 53, 17 55"
                    stroke="#c9a227" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="14" cy="14" r="3.2" fill="#c9a227" />
                  <circle cx="60" cy="7.5" r="1.6" fill="#c9a227" />
                  <circle cx="7.5" cy="60" r="1.6" fill="#c9a227" />
                </svg>
              ))}

              {/* En-tête : logo officiel */}
              <div className="text-center relative">
                <div className="relative mx-auto mb-1" style={{ width: 180, height: 52 }}>
                  <Image
                    src="/syllabix-logo-with-name.png"
                    alt="Syllabix"
                    fill
                    className="object-contain"
                    sizes="180px"
                    priority
                  />
                </div>
                <p className="text-[10px] uppercase" style={{ color: '#c9a227', fontWeight: 600, letterSpacing: '0.4em' }}>
                  Plateforme de Certification Numérique
                </p>
              </div>

              {/* Corps */}
              <div className="text-center relative flex-1 flex flex-col justify-center">
                <h1 className="text-5xl" style={{ color: '#1A237E', fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '0.02em' }}>
                  Certificat de Réussite
                </h1>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-1.5">{examLabel}</p>

                {/* Filet décoratif */}
                <div className="flex items-center justify-center gap-3 my-3">
                  <div style={{ height: 1, width: 130, background: 'linear-gradient(to right, transparent, #c9a227)' }} />
                  <span style={{ color: '#c9a227', fontSize: 16 }}>✦ ❖ ✦</span>
                  <div style={{ height: 1, width: 130, background: 'linear-gradient(to left, transparent, #c9a227)' }} />
                </div>

                <p className="text-base text-neutral-500" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                  Le présent certificat est décerné à
                </p>

                {/* Nom du lauréat en calligraphie */}
                <p className={greatVibes.className} style={{ fontSize: 54, color: '#1A237E', lineHeight: 1.25 }}>
                  {cert.displayName || 'Apprenant'}
                </p>
                <div className="mx-auto" style={{ height: 1, width: 340, background: '#d8d3c2', marginTop: -4 }} />

                <p className="text-neutral-600 max-w-2xl mx-auto leading-relaxed mt-3 text-[15px]" style={{ fontFamily: 'Georgia, serif' }}>
                  {c('desc')} <strong style={{ color: '#1A237E' }}>{certTitle}</strong> {c('desc2')}
                </p>

                <p className="mt-2.5 text-base" style={{ fontFamily: 'Georgia, serif', color: '#444' }}>
                  avec un score de{' '}
                  <strong style={{ color: level.color, fontSize: 20 }}>{cert.score}%</strong>
                  {' '}— mention <strong style={{ color: level.color }}>{level.label}</strong>
                </p>
              </div>

              {/* Bas du diplôme : date · sceau · signature */}
              <div className="grid grid-cols-3 items-end gap-4 relative mt-2">
                <div className="text-center">
                  <p style={{ fontFamily: 'Georgia, serif', color: '#333', fontSize: 15 }}>{formatDate(cert.issuedAt)}</p>
                  <div style={{ height: 1, background: '#999', margin: '5px 28px' }} />
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400">{c('issueDate')}</p>
                </div>

                <div className="flex justify-center">
                  <div
                    className="rounded-full flex flex-col items-center justify-center text-center"
                    style={{
                      width: 96, height: 96,
                      background: 'radial-gradient(circle at 35% 30%, #26308f, #1A237E 70%)',
                      border: '3px solid #c9a227',
                      boxShadow: '0 3px 10px rgba(26,35,126,.35)',
                    }}
                  >
                    <span style={{ color: '#c9a227', fontSize: 20, lineHeight: 1 }}>★</span>
                    <span className="text-white font-bold" style={{ fontSize: 12, letterSpacing: '0.12em' }}>SYLLABIX</span>
                    <span style={{ color: '#c9a227', fontSize: 7.5, letterSpacing: '0.2em' }}>CERTIFIÉ ✓</span>
                    <span className="text-white" style={{ fontSize: 6.5, opacity: .8, marginTop: 2 }}>syllabix.com</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className={greatVibes.className} style={{ fontSize: 32, color: '#1a2a6c', transform: 'rotate(-3deg)', marginBottom: -6 }}>
                    Syllabix
                  </p>
                  <div style={{ height: 1, background: '#999', margin: '5px 28px' }} />
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400">La Direction de la Certification</p>
                </div>
              </div>

              {/* Partenaires + vérification */}
              <div className="mt-3 pt-2.5 relative" style={{ borderTop: '1px solid #e8e2d0' }}>
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <p className="text-[9px] font-semibold uppercase" style={{ color: '#c9a227', letterSpacing: '0.25em' }}>
                    Partenaires institutionnels
                  </p>
                  {PARTNERS.map((partner) => (
                    <div key={partner.id} className="relative" style={{ width: 58, height: 32 }}>
                      <Image
                        src={partner.logo}
                        alt={partner.shortName}
                        fill
                        className="object-contain"
                        sizes="58px"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-center text-[9px] text-neutral-400 mt-1.5">
                  {c('verify')} — {c('uniqueId')} : <span className="font-mono">{cert.id || id}</span>
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
