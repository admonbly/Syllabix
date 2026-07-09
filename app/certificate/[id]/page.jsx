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
      {/* Styles print uniquement */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #certificate-printable, #certificate-printable * { visibility: visible !important; }
          #certificate-printable { position: fixed; inset: 0; padding: 0; margin: 0; }
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

        {/* Certificat visuel — style diplôme */}
        <div
          id="certificate-printable"
          ref={printRef}
          className="max-w-3xl mx-auto shadow-2xl"
          style={{ background: '#fffdf8', border: '10px double #1A237E', padding: '10px' }}
        >
          {/* Cadre intérieur doré avec coins ornementaux */}
          <div className="relative" style={{ border: '1.5px solid #c9a227', padding: '40px 48px 32px' }}>

            {/* Coins ornementaux */}
            {[
              { top: -2, left: -2, borderWidth: '4px 0 0 4px' },
              { top: -2, right: -2, borderWidth: '4px 4px 0 0' },
              { bottom: -2, left: -2, borderWidth: '0 0 4px 4px' },
              { bottom: -2, right: -2, borderWidth: '0 4px 4px 0' },
            ].map((pos, i) => (
              <div key={i} className="absolute" style={{ ...pos, width: 34, height: 34, borderStyle: 'solid', borderColor: '#c9a227' }} />
            ))}

            {/* En-tête : logo officiel */}
            <div className="text-center mb-6">
              <div className="relative mx-auto mb-3" style={{ width: 210, height: 64 }}>
                <Image
                  src="/syllabix-logo-with-name.png"
                  alt="Syllabix"
                  fill
                  className="object-contain"
                  sizes="210px"
                  priority
                />
              </div>
              <p className="text-xs uppercase" style={{ color: '#c9a227', fontWeight: 600, letterSpacing: '0.35em' }}>
                Plateforme de Certification Numérique
              </p>
            </div>

            {/* Titre du diplôme */}
            <div className="text-center">
              <h1 className="text-5xl mb-1" style={{ color: '#1A237E', fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '0.02em' }}>
                Certificat de Réussite
              </h1>
              <p className="text-sm uppercase tracking-widest text-neutral-400 mt-2">{examLabel}</p>

              {/* Filet décoratif */}
              <div className="flex items-center justify-center gap-3 my-6">
                <div style={{ height: 1, width: 90, background: '#c9a227' }} />
                <span style={{ color: '#c9a227', fontSize: 18 }}>❖</span>
                <div style={{ height: 1, width: 90, background: '#c9a227' }} />
              </div>

              <p className="text-base text-neutral-500" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                Le présent certificat est décerné à
              </p>

              {/* Nom du lauréat en calligraphie */}
              <p className={greatVibes.className} style={{ fontSize: 58, color: '#1A237E', lineHeight: 1.3, marginTop: 4 }}>
                {cert.displayName || 'Apprenant'}
              </p>
              <div className="mx-auto" style={{ height: 1, width: 320, background: '#d8d3c2', marginTop: -4 }} />

              <p className="text-neutral-600 max-w-xl mx-auto leading-relaxed mt-6" style={{ fontFamily: 'Georgia, serif' }}>
                {c('desc')} <strong style={{ color: '#1A237E' }}>{certTitle}</strong> {c('desc2')}
              </p>

              {/* Score + niveau, discrets comme une mention de diplôme */}
              <p className="mt-5 text-base" style={{ fontFamily: 'Georgia, serif', color: '#444' }}>
                avec un score de{' '}
                <strong style={{ color: level.color, fontSize: 20 }}>{cert.score}%</strong>
                {' '}— mention <strong style={{ color: level.color }}>{level.label}</strong>
              </p>
            </div>

            {/* Bas du diplôme : date · sceau · signature */}
            <div className="grid grid-cols-3 items-end gap-4 mt-12">
              {/* Date */}
              <div className="text-center">
                <p style={{ fontFamily: 'Georgia, serif', color: '#333', fontSize: 15 }}>{formatDate(cert.issuedAt)}</p>
                <div style={{ height: 1, background: '#999', margin: '6px 12px 6px' }} />
                <p className="text-xs uppercase tracking-wider text-neutral-400">{c('issueDate')}</p>
              </div>

              {/* Sceau officiel */}
              <div className="flex justify-center">
                <div
                  className="rounded-full flex flex-col items-center justify-center text-center"
                  style={{
                    width: 104, height: 104,
                    background: 'radial-gradient(circle at 35% 30%, #26308f, #1A237E 70%)',
                    border: '3px solid #c9a227',
                    boxShadow: '0 3px 10px rgba(26,35,126,.35)',
                  }}
                >
                  <span style={{ color: '#c9a227', fontSize: 22, lineHeight: 1 }}>★</span>
                  <span className="text-white font-bold" style={{ fontSize: 13, letterSpacing: '0.12em' }}>SYLLABIX</span>
                  <span style={{ color: '#c9a227', fontSize: 8, letterSpacing: '0.2em' }}>CERTIFIÉ ✓</span>
                  <span className="text-white" style={{ fontSize: 7, opacity: .8, marginTop: 2 }}>syllabix.com</span>
                </div>
              </div>

              {/* Signature manuscrite */}
              <div className="text-center">
                <p className={greatVibes.className} style={{ fontSize: 34, color: '#1a2a6c', transform: 'rotate(-3deg)', marginBottom: -6 }}>
                  Syllabix
                </p>
                <div style={{ height: 1, background: '#999', margin: '6px 12px 6px' }} />
                <p className="text-xs uppercase tracking-wider text-neutral-400">La Direction de la Certification</p>
              </div>
            </div>

            {/* Partenaires institutionnels */}
            <div className="mt-10 pt-5" style={{ borderTop: '1px solid #e8e2d0' }}>
              <p className="text-[10px] font-semibold uppercase text-center mb-3" style={{ color: '#c9a227', letterSpacing: '0.3em' }}>
                Partenaires institutionnels
              </p>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                {PARTNERS.map((partner) => (
                  <div key={partner.id} className="relative" style={{ width: 72, height: 42 }}>
                    <Image
                      src={partner.logo}
                      alt={partner.shortName}
                      fill
                      className="object-contain"
                      sizes="72px"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Vérification */}
            <p className="text-center text-[10px] text-neutral-400 mt-5">
              {c('verify')} — {c('uniqueId')} : <span className="font-mono">{cert.id || id}</span>
            </p>
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
