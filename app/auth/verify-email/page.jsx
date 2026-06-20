'use client';

import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import Link from 'next/link';
import { useState } from 'react';
import { auth, authFunctions } from '@/lib/firebase';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    setError('');
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setResent(true);
      } else {
        setError('Session expirée. Veuillez vous reconnecter.');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du renvoi de l\'email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        await authFunctions.markEmailVerified();
        window.location.href = '/auth/verify-phone';
      } else {
        setError('Votre email n\'a pas encore été vérifié. Vérifiez votre boîte mail.');
      }
    }
  };

  return (
    <section className="py-20 bg-neutral-50 min-h-screen flex items-center">
      <div className="w-full max-w-md mx-auto px-4">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-6">📧</div>

          <h1 className="text-3xl font-heading font-bold text-primary mb-4">
            Vérifiez votre email
          </h1>

          <p className="text-neutral-600 mb-2">
            Un email de vérification a été envoyé à votre adresse.
          </p>
          <p className="text-neutral-500 text-sm mb-8">
            Cliquez sur le lien dans l'email pour activer votre compte, puis revenez ici.
          </p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm mb-6">
              ❌ {error}
            </div>
          )}

          {resent && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-900 text-sm mb-6">
              ✅ Email renvoyé avec succès. Vérifiez votre boîte mail.
            </div>
          )}

          <div className="space-y-3">
            <CTAButton onClick={handleContinue} className="w-full" size="lg">
              ✓ J'ai vérifié mon email
            </CTAButton>

            <button
              onClick={handleResend}
              disabled={isLoading || resent}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors font-semibold text-neutral-700 disabled:opacity-50"
            >
              {isLoading ? '⏳ Envoi...' : resent ? '✅ Email envoyé' : '🔄 Renvoyer l\'email'}
            </button>

            <button
              onClick={async () => {
                await authFunctions.signOut();
                window.location.href = '/auth/login';
              }}
              className="w-full text-sm text-neutral-500 hover:text-neutral-700 py-2"
            >
              Se déconnecter
            </button>
          </div>

          <p className="text-xs text-neutral-400 mt-8">
            Vous ne trouvez pas l'email ? Vérifiez vos spams ou{' '}
            <Link href="/contact" className="text-accent hover:underline">
              contactez-nous
            </Link>
            .
          </p>
        </Card>
      </div>
    </section>
  );
}
