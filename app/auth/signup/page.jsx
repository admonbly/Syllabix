'use client';

import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authFunctions, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const DIAL_CODES = [
  { code: '+225', flag: '🇨🇮' },
  { code: '+221', flag: '🇸🇳' },
  { code: '+234', flag: '🇳🇬' },
  { code: '+237', flag: '🇨🇲' },
  { code: '+243', flag: '🇨🇩' },
  { code: '+254', flag: '🇰🇪' },
  { code: '+233', flag: '🇬🇭' },
  { code: '+212', flag: '🇲🇦' },
  { code: '+216', flag: '🇹🇳' },
  { code: '+213', flag: '🇩🇿' },
  { code: '+20',  flag: '🇪🇬' },
  { code: '+27',  flag: '🇿🇦' },
  { code: '+33',  flag: '🇫🇷' },
  { code: '+32',  flag: '🇧🇪' },
  { code: '+41',  flag: '🇨🇭' },
];

const FIREBASE_ERRORS = {
  'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
  'auth/invalid-email': 'L\'adresse email n\'est pas valide.',
  'auth/weak-password': 'Le mot de passe est trop faible (minimum 6 caractères).',
  'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.',
  'auth/too-many-requests': 'Trop de tentatives. Réessayez dans quelques minutes.',
  'auth/operation-not-allowed': 'Cette méthode d\'inscription n\'est pas activée.',
};

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/dashboard');
    });
    return unsub;
  }, [router]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dialCode, setDialCode] = useState('+225');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [status, setStatus] = useState('student');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [parentalConsent, setParentalConsent] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const needsParentalConsent = age !== null && age >= 13 && age < 15;
  const tooYoung = age !== null && age < 13;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim()) {
      setError('Le prénom est requis');
      return;
    }

    if (!lastName.trim()) {
      setError('Le nom est requis');
      return;
    }

    if (!dateOfBirth) {
      setError('La date de naissance est requise');
      return;
    }

    if (tooYoung) {
      setError('Vous devez avoir au moins 13 ans pour vous inscrire.');
      return;
    }

    if (needsParentalConsent && !parentalConsent) {
      setError('Le consentement parental est requis pour les moins de 15 ans (RGPD Art. 8).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    const roleMap = {
      student: 'LEARNER',
      teacher: 'LEARNER',
      professional: 'PROFESSIONAL',
      other: 'LEARNER',
    };

    try {
      await authFunctions.signUp(email, password, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: roleMap[status] ?? 'LEARNER',
        dateOfBirth,
        parentalConsentGiven: needsParentalConsent ? parentalConsent : false,
        phoneNumber: `${dialCode}${phoneLocal.replace(/^0/, '').trim()}`,
      });
      router.push('/auth/verify-email');
    } catch (err) {
      const code = err?.code;
      setError(FIREBASE_ERRORS[code] || err.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 bg-neutral-50 min-h-screen flex items-center">
      <div className="w-full max-w-md mx-auto px-4">
        <Card className="p-8">
          <h1 className="text-3xl font-heading font-bold text-primary text-center mb-8">
            S'inscrire
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                ❌ {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="Jean"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="Dupont"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Date de naissance
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  setParentalConsent(false);
                }}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                max={new Date().toISOString().split('T')[0]}
                required
                disabled={isLoading}
              />
              {tooYoung && (
                <p className="text-red-600 text-xs mt-2">
                  Vous devez avoir au moins 13 ans pour vous inscrire.
                </p>
              )}
            </div>

            {needsParentalConsent && (
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 mb-3">
                  Consentement parental requis (RGPD Art. 8)
                </p>
                <p className="text-xs text-yellow-700 mb-3">
                  Les personnes de moins de 15 ans doivent obtenir le consentement d'un parent
                  ou tuteur légal avant de créer un compte.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parentalConsent}
                    onChange={(e) => setParentalConsent(e.target.checked)}
                    className="mt-1 h-4 w-4"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-yellow-800">
                    J'atteste que mon parent ou tuteur légal a donné son consentement pour
                    la création de ce compte et le traitement de mes données personnelles.
                  </span>
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                disabled={isLoading}
              >
                <option value="student">👨‍🎓 Étudiant</option>
                <option value="teacher">👨‍🏫 Enseignant</option>
                <option value="professional">💼 Professionnel</option>
                <option value="other">🤷 Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                placeholder="vous@exemple.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Numéro de téléphone
              </label>
              <div className="flex gap-2">
                {/* Sélecteur pays */}
                <select
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
                  disabled={isLoading}
                  className="w-28 flex-shrink-0 px-2 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors bg-white text-sm font-medium"
                >
                  {DIAL_CODES.map((d) => (
                    <option key={d.code} value={d.code}>{d.flag} {d.code}</option>
                  ))}
                </select>
                {/* Numéro local */}
                <input
                  type="tel"
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                  placeholder="07 00 00 00 00"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Le 0 de début est retiré automatiquement
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-neutral-500 mt-2">
                Minimum 6 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <CTAButton
              type="submit"
              disabled={isLoading || tooYoung}
              className="w-full"
              size="lg"
            >
              {isLoading ? '⏳ Inscription...' : '✓ S\'inscrire'}
            </CTAButton>
          </form>

          <p className="text-sm text-neutral-600 text-center mt-6">
            Vous avez déjà un compte?{' '}
            <Link href="/auth/login" className="text-accent font-semibold hover:underline">
              Se connecter
            </Link>
          </p>

          <p className="text-xs text-neutral-500 text-center mt-6">
            En vous inscrivant, vous acceptez nos{' '}
            <Link href="/cgu" className="text-accent hover:underline">
              Conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/privacy" className="text-accent hover:underline">
              Politique de confidentialité
            </Link>
            .
          </p>
        </Card>
      </div>
    </section>
  );
}
