'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { auth, userDB } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '@/lib/LanguageContext';

const MODULE_NAMES = {
  0: 'IT & Ordinateur',
  1: 'Internet & Google',
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

        {/* Certificat visuel */}
        <div
          id="certificate-printable"
          ref={printRef}
          className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ border: '8px solid #1A237E' }}
        >
          {/* Bande décorative top */}
          <div style={{ background: 'linear-gradient(135deg, #1A237E 0%, #283593 60%, #E67E22 100%)', height: '12px' }} />

          {/* En-tête */}
          <div className="px-12 pt-10 pb-6 text-center" style={{ borderBottom: '2px solid #f0f0f0' }}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#1A237E' }}>
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-3xl font-bold tracking-tight" style={{ color: '#1A237E' }}>Syllabix</span>
            </div>
            <p className="text-sm uppercase tracking-widest" style={{ color: '#E67E22', fontWeight: 600 }}>
              Plateforme de Certification Numérique
            </p>
          </div>

          {/* Corps du certificat */}
          <div className="px-12 py-10 text-center">
            <p className="text-base uppercase tracking-widest text-neutral-500 mb-3">
              {examLabel}
            </p>

            <h1 className="text-4xl font-bold mb-1" style={{ color: '#1A237E', fontFamily: 'Georgia, serif' }}>
              {certTitle}
            </h1>

            <div className="w-24 h-1 mx-auto my-6 rounded-full" style={{ background: '#E67E22' }} />

            <p className="text-lg text-neutral-500 mb-2">Décerné à</p>
            <h2 className="text-3xl font-bold mb-8" style={{ color: '#1A237E', fontFamily: 'Georgia, serif' }}>
              {cert.displayName || 'Apprenant'}
            </h2>

            <p className="text-neutral-600 max-w-lg mx-auto mb-10 leading-relaxed">
              {c('desc')} <strong>{certTitle}</strong> {c('desc2')}
            </p>

            {/* Score + Niveau */}
            <div className="flex justify-center gap-8 mb-10">
              <div className="text-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg"
                  style={{ background: `${level.color}15`, border: `3px solid ${level.color}` }}
                >
                  <span className="text-2xl font-bold" style={{ color: level.color }}>
                    {cert.score}%
                  </span>
                </div>
                <p className="text-sm font-semibold text-neutral-500">{c('score')}</p>
              </div>
              <div className="text-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg"
                  style={{ background: `${level.color}15`, border: `3px solid ${level.color}` }}
                >
                  <span className="text-sm font-bold text-center leading-tight px-2" style={{ color: level.color }}>
                    {level.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-neutral-500">{c('level')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm text-neutral-500 pt-6" style={{ borderTop: '1px solid #f0f0f0' }}>
              <div className="text-left">
                <p className="font-semibold text-neutral-700 mb-1">{c('issueDate')}</p>
                <p>{formatDate(cert.issuedAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-700 mb-1">{c('uniqueId')}</p>
                <p className="font-mono text-xs break-all">{cert.id || id}</p>
              </div>
            </div>
          </div>

          <div className="px-12 py-5 flex items-center justify-between" style={{ background: '#f8f9ff', borderTop: '2px solid #e8ecff' }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1A237E' }}>
                Syllabix — afridigi.com
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {c('verify')}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#1A237E' }}>
              <span className="text-white text-2xl">✓</span>
            </div>
          </div>

          {/* Bande décorative bottom */}
          <div style={{ background: 'linear-gradient(135deg, #E67E22 0%, #1A237E 100%)', height: '12px' }} />
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
