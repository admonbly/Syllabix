'use client';

import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authFunctions, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '@/lib/LanguageContext';
import { checkPassword, passwordScore, isPasswordStrong } from '@/lib/passwordPolicy';

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
  const { t, locale } = useLanguage();
  const s = (k) => t(`signup.${k}`);

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
  const [orgCode, setOrgCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');

  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const needsParentalConsent = age !== null && age >= 13 && age < 15;
  const tooYoung = age !== null && age < 13;

  // Politique de mot de passe (12 car., maj., min., chiffre, spécial)
  const pwChecks = checkPassword(password);
  const pwScore = passwordScore(password);

  const handleGoogleSignup = async () => {
    setError('');
    setOauthLoading(true);
    try {
      const { profileComplete, landing } = await authFunctions.signInWithGoogle();
      if (!profileComplete) {
        window.location.href = '/auth/complete-profile';
      } else {
        router.replace(landing || '/dashboard');
      }
    } catch (err) {
      if (!err.message?.includes('popup-closed-by-user')) {
        setError(err.message || s('errors.google'));
      }
      setOauthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim()) { setError(s('validation.firstName')); return; }
    if (!lastName.trim())  { setError(s('validation.lastName'));  return; }
    if (!dateOfBirth)      { setError(s('validation.dob'));        return; }
    if (tooYoung)          { setError(s('validation.tooYoung'));   return; }
    if (needsParentalConsent && !parentalConsent) { setError(s('validation.parental')); return; }
    if (password !== confirmPassword) { setError(s('validation.pwMismatch')); return; }
    if (!isPasswordStrong(password))  { setError(s('validation.pwWeak')); return; }

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

      // Rattachement optionnel — ne doit JAMAIS bloquer la création du compte.
      // En cas d'échec, l'utilisateur pourra réessayer depuis son tableau de bord.
      if (orgCode.trim()) {
        try {
          const token = await auth.currentUser?.getIdToken();
          if (token) {
            await fetch('/api/org/join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ code: orgCode }),
            });
          }
        } catch {
          // Silencieux : le compte est créé, c'est l'essentiel.
        }
      }

      router.push('/auth/verify-email');
    } catch (err) {
      const code = err?.code;
      const FIREBASE_ERRORS = {
        'auth/email-already-in-use':    s('errors.emailInUse'),
        'auth/invalid-email':           s('errors.invalidEmail'),
        'auth/weak-password':           s('errors.weakPw'),
        'auth/network-request-failed':  s('errors.network'),
        'auth/too-many-requests':       s('errors.tooMany'),
        'auth/operation-not-allowed':   s('errors.notAllowed'),
      };
      setError(FIREBASE_ERRORS[code] || err.message || s('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-10 sm:py-20 bg-neutral-50 min-h-screen flex items-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary text-center mb-6 sm:mb-8">
            {s('title')}
          </h1>

          {/* OAuth buttons en haut */}
          <div className="space-y-3 mb-6">
            {/* Google */}
            <button
              onClick={handleGoogleSignup}
              disabled={oauthLoading || isLoading}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors font-semibold flex items-center justify-center gap-3 disabled:opacity-50 min-h-[48px]"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {oauthLoading ? s('connecting') : s('google')}
            </button>

            {/* WhatsApp — bientôt */}
            <button
              disabled
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg font-semibold flex items-center justify-center gap-3 opacity-60 cursor-not-allowed bg-green-50 text-green-800 min-h-[48px]"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {s('whatsapp')}
              <span className="ml-auto text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-semibold">{s('soon')}</span>
            </button>
          </div>

          {/* Séparateur */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400 font-medium">{s('orEmail')}</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                ❌ {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  {s('firstName')}
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
                  {s('lastName')}
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
                {s('dob')}
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  setParentalConsent(false);
                }}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors cursor-pointer"
                max={new Date().toISOString().split('T')[0]}
                min="1900-01-01"
                required
                disabled={isLoading}
                onFocus={(e) => { try { e.target.showPicker?.(); } catch {} }}
              />
              {tooYoung && (
                <p className="text-red-600 text-xs mt-2">{s('validation.tooYoung')}</p>
              )}
            </div>

            {needsParentalConsent && (
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 mb-3">{s('parental.title')}</p>
                <p className="text-xs text-yellow-700 mb-3">{s('parental.desc')}</p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parentalConsent}
                    onChange={(e) => setParentalConsent(e.target.checked)}
                    className="mt-1 h-4 w-4"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-yellow-800">{s('parental.checkbox')}</span>
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-primary mb-3">
                {s('statusLabel')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'student',      icon: '👨‍🎓', label: s('statuses.student') },
                  { value: 'teacher',      icon: '👨‍🏫', label: s('statuses.teacher') },
                  { value: 'professional', icon: '💼',  label: s('statuses.professional') },
                  { value: 'other',        icon: '🤷',  label: s('statuses.other') },
                ].map((opt) => {
                  const selected = status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => !isLoading && setStatus(opt.value)}
                      disabled={isLoading}
                      className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                        selected
                          ? 'border-accent bg-accent/8 text-accent'
                          : 'border-neutral-200 text-neutral-600 hover:border-accent/40'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        selected ? 'border-accent bg-accent' : 'border-neutral-300'
                      }`}>
                        {selected && <span className="w-2 h-2 rounded-full bg-white block" />}
                      </span>
                      <span>{opt.icon} {opt.label}</span>
                    </button>
                  );
                })}
              </div>
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
                {s('phone')}
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
              <p className="text-xs text-neutral-400 mt-1">{s('phoneHint')}</p>
            </div>

            <div>
              <label htmlFor="signup-org-code" className="block text-sm font-semibold text-primary mb-2">
                {t('org.signupLabel')}
              </label>
              <input
                id="signup-org-code"
                type="text"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none transition-colors uppercase"
                placeholder={t('org.codePlaceholder')}
                autoCapitalize="characters"
                disabled={isLoading}
              />
              <p className="text-xs text-neutral-400 mt-1">{t('org.signupHint')}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                {s('password')}
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
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1 h-1.5">
                    {[0,1,2,3,4].map((i) => (
                      <div key={i} className={`flex-1 rounded-full transition-all ${
                        i < pwScore
                          ? pwScore <= 2 ? 'bg-red-400' : pwScore <= 4 ? 'bg-yellow-400' : 'bg-green-500'
                          : 'bg-neutral-200'
                      }`} />
                    ))}
                  </div>
                  <ul className="space-y-0.5 mt-1.5">
                    {pwChecks.map((c) => (
                      <li key={c.id} className={`text-xs flex items-center gap-1.5 ${c.ok ? 'text-secondary' : 'text-neutral-400'}`}>
                        <span aria-hidden="true">{c.ok ? '✓' : '○'}</span>
                        {locale === 'en' ? c.en : c.fr}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                {s('confirmPw')}
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
              disabled={isLoading || oauthLoading || tooYoung}
              className="w-full"
              size="lg"
            >
              {isLoading ? s('submitting') : s('submit')}
            </CTAButton>
          </form>

          <p className="text-sm text-neutral-600 text-center mt-6">
            {s('hasAccount')}{' '}
            <Link href="/auth/login" className="text-accent font-semibold hover:underline">
              {s('signIn')}
            </Link>
          </p>

          <p className="text-xs text-neutral-500 text-center mt-6">
            {s('terms1')}{' '}
            <Link href="/cgu" className="text-accent hover:underline">{s('terms2')}</Link>{' '}
            {s('terms3')}{' '}
            <Link href="/privacy" className="text-accent hover:underline">{s('terms4')}</Link>.
          </p>
        </Card>
      </div>
    </section>
  );
}
