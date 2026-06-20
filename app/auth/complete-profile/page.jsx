'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';

const DIAL_CODES = [
  { code: '+225', flag: '🇨🇮', label: '+225' },
  { code: '+33',  flag: '🇫🇷', label: '+33' },
];

function calculateAge(dob) {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--;
  return age;
}

function CompleteProfileForm() {
  const searchParams  = useSearchParams();
  const redirectTo    = searchParams.get('redirect') || '/dashboard';

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading,      setLoading]      = useState(true);

  const [firstName,       setFirstName]       = useState('');
  const [lastName,        setLastName]        = useState('');
  const [dateOfBirth,     setDateOfBirth]     = useState('');
  const [dialCode,        setDialCode]        = useState('+225');
  const [phoneLocal,      setPhoneLocal]      = useState('');
  const [parentalConsent, setParentalConsent] = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = '/auth/login'; return; }
      setFirebaseUser(user);

      // Pré-remplir depuis Firebase Auth (Google)
      if (user.displayName) {
        const parts = user.displayName.split(' ');
        setFirstName(parts[0] ?? '');
        setLastName(parts.slice(1).join(' ') ?? '');
      }

      // Pré-remplir depuis Firestore si profil partiel existant
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          if (d.firstName) setFirstName(d.firstName);
          if (d.lastName)  setLastName(d.lastName);
          if (d.dateOfBirth) setDateOfBirth(d.dateOfBirth);
          if (d.phoneNumber) {
            for (const dc of DIAL_CODES) {
              if (d.phoneNumber.startsWith(dc.code)) {
                setDialCode(dc.code);
                setPhoneLocal(d.phoneNumber.slice(dc.code.length));
                break;
              }
            }
          }
        }
      } catch (_) {}

      setLoading(false);
    });
    return () => unsub();
  }, []);

  const age             = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const tooYoung        = age !== null && age < 13;
  const needsConsent    = age !== null && age >= 13 && age < 15;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim()) { setError('Le prénom est requis.'); return; }
    if (!lastName.trim())  { setError('Le nom est requis.'); return; }
    if (!dateOfBirth)      { setError('La date de naissance est requise.'); return; }
    if (tooYoung)          { setError('Vous devez avoir au moins 13 ans pour utiliser Syllabix.'); return; }
    if (needsConsent && !parentalConsent) {
      setError('Le consentement parental est requis pour les utilisateurs de 13 à 14 ans (RGPD Art. 8).');
      return;
    }

    setSaving(true);
    try {
      const fullPhone = phoneLocal.trim()
        ? `${dialCode}${phoneLocal.replace(/^0/, '').trim()}`
        : '';

      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();

      // Mettre à jour Firebase Auth
      await updateProfile(firebaseUser, { displayName });

      // Mettre à jour ou créer Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap    = await getDoc(userRef);
      const payload = {
        firstName:            firstName.trim(),
        lastName:             lastName.trim(),
        displayName,
        dateOfBirth,
        phoneNumber:          fullPhone,
        profileComplete:      true,
        updatedAt:            new Date().toISOString(),
        ...(needsConsent && {
          parentalConsentGiven: parentalConsent,
          parentalConsentAt:    new Date().toISOString(),
        }),
      };

      if (snap.exists()) {
        await updateDoc(userRef, payload);
      } else {
        await setDoc(userRef, {
          email:          firebaseUser.email ?? '',
          emailVerified:  firebaseUser.emailVerified,
          phoneVerified:  false,
          role:           'LEARNER',
          createdAt:      new Date().toISOString(),
          authProvider:   'google',
          ...payload,
        });
      }

      // Cookie de complétion de profil
      document.cookie = 'syllabix_profile=1; path=/; SameSite=Strict; Max-Age=604800';
      window.location.href = redirectTo;
    } catch (err) {
      setError('Erreur lors de la sauvegarde : ' + err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Chargement...</p>
      </section>
    );
  }

  return (
    <section className="py-20 bg-neutral-50 min-h-screen flex items-center">
      <div className="w-full max-w-lg mx-auto px-4">
        <Card className="p-8">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-primary">Complétez votre profil</h1>
            <p className="text-sm text-neutral-500 mt-2">
              Quelques informations manquantes avant d'accéder à Syllabix.
            </p>
            {firebaseUser?.email && (
              <p className="text-xs text-neutral-400 mt-1">Connecté en tant que <strong>{firebaseUser.email}</strong></p>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {error && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                ❌ {error}
              </div>
            )}

            {/* Nom / Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-primary mb-1.5">
                  Prénom <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="Jean"
                  autoComplete="given-name"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-primary mb-1.5">
                  Nom <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="Dupont"
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            {/* Date de naissance */}
            <div>
              <label htmlFor="dob" className="block text-sm font-semibold text-primary mb-1.5">
                Date de naissance <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => { setDateOfBirth(e.target.value); setParentalConsent(false); }}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                required
                aria-describedby="dob-hint"
              />
              <p id="dob-hint" className="text-xs text-neutral-400 mt-1">
                Requise pour vérifier votre éligibilité (RGPD).
              </p>
              {tooYoung && (
                <p role="alert" className="text-red-600 text-xs mt-1">
                  ⚠️ Vous devez avoir au moins 13 ans pour vous inscrire.
                </p>
              )}
              {age !== null && !tooYoung && (
                <p className="text-xs text-neutral-400 mt-1">
                  Âge détecté : <strong>{age} ans</strong>
                  {needsConsent && <span className="text-orange-600 ml-1">— consentement parental requis</span>}
                </p>
              )}
            </div>

            {/* Consentement parental si 13-14 ans */}
            {needsConsent && (
              <div role="region" aria-label="Consentement parental" className="p-4 bg-yellow-50 border border-yellow-300 rounded-xl">
                <p className="text-sm font-semibold text-yellow-800 mb-2">⚖️ Consentement parental requis</p>
                <p className="text-xs text-yellow-700 mb-3">
                  Conformément au RGPD Art. 8, les personnes de moins de 15 ans doivent obtenir
                  l'accord d'un parent ou tuteur légal avant de créer un compte.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parentalConsent}
                    onChange={(e) => setParentalConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-accent"
                    required
                  />
                  <span className="text-sm text-yellow-800">
                    Mon parent ou tuteur légal a donné son accord pour la création de ce compte
                    et le traitement de mes données personnelles.
                  </span>
                </label>
              </div>
            )}

            {/* Téléphone (optionnel) */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1.5">
                Numéro de téléphone <span className="text-neutral-400 font-normal">(optionnel)</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
                  aria-label="Indicatif pays"
                  className="flex-shrink-0 px-3 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none bg-white text-sm font-medium"
                >
                  {DIAL_CODES.map((d) => (
                    <option key={d.code} value={d.code}>{d.flag} {d.label}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="07 00 00 00 00"
                  autoComplete="tel-national"
                />
              </div>
            </div>

            <CTAButton
              type="submit"
              disabled={saving || tooYoung}
              className="w-full"
              size="lg"
            >
              {saving ? '⏳ Enregistrement...' : '✓ Accéder à Syllabix'}
            </CTAButton>
          </form>
        </Card>
      </div>
    </section>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Chargement...</p>
      </section>
    }>
      <CompleteProfileForm />
    </Suspense>
  );
}
