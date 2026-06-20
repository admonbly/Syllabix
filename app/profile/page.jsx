'use client';

import { useState, useEffect } from 'react';
import { auth, userDB, authFunctions } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';

const DIAL_CODES = [
  { code: '+225', flag: '🇨🇮', label: 'CI +225' },
  { code: '+33',  flag: '🇫🇷', label: 'FR +33' },
];

function parsePhone(full = '') {
  for (const d of DIAL_CODES) {
    if (full.startsWith(d.code)) {
      return { dialCode: d.code, local: full.slice(d.code.length) };
    }
  }
  return { dialCode: '+225', local: full };
}

export default function ProfilePage() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [dialCode,  setDialCode]  = useState('+225');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState('');

  // Phone verification
  const [smsStep,       setSmsStep]       = useState('idle'); // idle | sending | code | done
  const [smsCode,       setSmsCode]       = useState('');
  const [smsError,      setSmsError]      = useState('');
  const [verificationId, setVerificationId] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      setFirebaseUser(user);
      const data = await userDB.getUserProfile(user.uid);
      if (data) {
        setProfile(data);
        setFirstName(data.firstName || user.displayName?.split(' ')[0] || '');
        setLastName(data.lastName  || user.displayName?.split(' ').slice(1).join(' ') || '');
        const parsed = parsePhone(data.phoneNumber || '');
        setDialCode(parsed.dialCode);
        setPhoneLocal(parsed.local);
      } else {
        // Fallback from Firebase Auth
        setFirstName(user.displayName?.split(' ')[0] || '');
        setLastName(user.displayName?.split(' ').slice(1).join(' ') || '');
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const fullPhone = phoneLocal.trim()
        ? `${dialCode}${phoneLocal.replace(/^0/, '').trim()}`
        : '';
      await authFunctions.updateUserProfile(firebaseUser.uid, {
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        phoneNumber: fullPhone,
      });
      setProfile((p) => ({ ...p, firstName: firstName.trim(), lastName: lastName.trim(), phoneNumber: fullPhone }));
      setSaveMsg('Profil mis à jour avec succès !');
    } catch (err) {
      setSaveMsg('Erreur : ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendSMS = async () => {
    setSmsError('');
    setSmsStep('sending');
    const fullPhone = `${dialCode}${phoneLocal.replace(/^0/, '').trim()}`;
    try {
      const vid = await authFunctions.sendPhoneSMS(fullPhone, 'recaptcha-verify');
      setVerificationId(vid);
      setSmsStep('code');
    } catch (err) {
      setSmsError(err.message);
      setSmsStep('idle');
    }
  };

  const handleConfirmSMS = async () => {
    setSmsError('');
    try {
      await authFunctions.confirmPhoneSMS(verificationId, smsCode);
      setSmsStep('done');
      setProfile((p) => ({ ...p, phoneVerified: true }));
    } catch (err) {
      setSmsError('Code incorrect ou expiré.');
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Chargement du profil...</p>
      </section>
    );
  }

  if (!firebaseUser) {
    return (
      <section className="py-20 bg-neutral-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Vous devez être connecté pour accéder à votre profil.</p>
          <Link href="/auth/login" className="text-accent font-semibold hover:underline">Se connecter</Link>
        </div>
      </section>
    );
  }

  const phoneVerified = profile?.phoneVerified ?? false;
  const emailVerified = firebaseUser.emailVerified || profile?.emailVerified;
  const displayInitials = ((firstName?.[0] ?? '') + (lastName?.[0] ?? '')).toUpperCase() || firebaseUser.email?.[0]?.toUpperCase() || 'U';
  const authProvider = profile?.authProvider ?? 'email';

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="section-title">Mon Profil</h1>

        {/* Avatar + infos résumées */}
        <Card className="mb-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {firebaseUser.photoURL
              ? <img src={firebaseUser.photoURL} alt="avatar" className="w-full h-full rounded-full object-cover" />
              : displayInitials}
          </div>
          <div>
            <p className="text-xl font-heading font-bold text-primary">
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : firebaseUser.email}
            </p>
            <p className="text-sm text-neutral-500">{firebaseUser.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${emailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {emailVerified ? '✅ Email vérifié' : '⚠️ Email non vérifié'}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${phoneVerified ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                {phoneVerified ? '✅ Téléphone vérifié' : '📵 Téléphone non vérifié'}
              </span>
              {authProvider === 'google' && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">🔷 Connexion Google</span>
              )}
            </div>
          </div>
        </Card>

        {/* Formulaire d'édition */}
        <Card className="mb-8">
          <h2 className="text-lg font-heading font-bold text-primary mb-6">Informations personnelles</h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Email</label>
              <input
                type="email"
                value={firebaseUser.email ?? ''}
                disabled
                className="w-full px-4 py-3 border-2 border-neutral-100 bg-neutral-50 rounded-lg text-neutral-400 cursor-not-allowed"
              />
              <p className="text-xs text-neutral-400 mt-1">L'adresse email ne peut pas être modifiée ici.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Numéro de téléphone
                {phoneVerified && <span className="ml-2 text-green-600 text-xs">✅ Vérifié</span>}
              </label>
              <div className="flex gap-2">
                <select
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
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
                />
              </div>
            </div>

            {saveMsg && (
              <div className={`p-3 rounded-lg text-sm ${saveMsg.startsWith('Erreur') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                {saveMsg}
              </div>
            )}

            <CTAButton type="submit" disabled={saving} className="w-full" size="lg">
              {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
            </CTAButton>
          </form>
        </Card>

        {/* Vérification du numéro de téléphone */}
        {!phoneVerified && (
          <Card className="mb-8 border-l-4 border-accent bg-orange-50">
            <h2 className="text-lg font-heading font-bold text-primary mb-2">Vérifier mon numéro de téléphone</h2>
            <p className="text-sm text-neutral-600 mb-4">
              Vérifiez votre numéro pour sécuriser votre compte et accéder à toutes les fonctionnalités.
            </p>

            {/* reCAPTCHA container invisible */}
            <div id="recaptcha-verify"></div>

            {smsStep === 'idle' && (
              <button
                onClick={handleSendSMS}
                disabled={!phoneLocal.trim()}
                className="px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50"
              >
                📱 Envoyer un SMS de vérification
              </button>
            )}

            {smsStep === 'sending' && (
              <p className="text-neutral-500 text-sm">⏳ Envoi du SMS...</p>
            )}

            {smsStep === 'code' && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-600">
                  Un code a été envoyé au <strong>{dialCode} {phoneLocal}</strong>. Saisissez-le ci-dessous :
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none text-center text-2xl font-bold tracking-widest"
                  placeholder="000000"
                />
                <button
                  onClick={handleConfirmSMS}
                  disabled={smsCode.length !== 6}
                  className="w-full px-6 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  ✅ Confirmer le code
                </button>
              </div>
            )}

            {smsStep === 'done' && (
              <p className="text-green-700 font-semibold">✅ Numéro de téléphone vérifié avec succès !</p>
            )}

            {smsError && (
              <p className="text-red-600 text-sm mt-2">❌ {smsError}</p>
            )}
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors">
            ← Tableau de bord
          </Link>
        </div>
      </div>
    </section>
  );
}
