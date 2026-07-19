/**
 * Teaser « bientôt payant » : présente les moyens de paiement à venir (via Jeko)
 * sous forme de boutons désactivés. Aucun prix affiché (non encore fixé), aucune
 * promesse — mention honnête « Bientôt ». Purement présentationnel.
 */
const METHODS = [
  { label: 'Orange Money', emoji: '🟠' },
  { label: 'MTN MoMo',     emoji: '🟡' },
  { label: 'Moov Money',   emoji: '🔵' },
  { label: 'Wave',         emoji: '🌊' },
  { label: 'Carte',        emoji: '💳' },
];

export default function PaymentSoon({ locale = 'fr', className = '' }) {
  const fr = locale === 'fr';
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-neutral-50 p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg" aria-hidden="true">💳</span>
        <p className="font-display font-bold text-primary text-sm">
          {fr ? 'Payer directement' : 'Pay directly'}
        </p>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent/15 text-accent">
          {fr ? 'Bientôt' : 'Soon'}
        </span>
      </div>
      <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
        {fr
          ? "Le paiement direct arrive prochainement. Pour l'instant, la certification se débloque avec un code."
          : 'Direct payment is coming soon. For now, the certification unlocks with a code.'}
      </p>
      <div className="flex flex-wrap gap-2" aria-hidden="true">
        {METHODS.map((m) => (
          <button
            key={m.label}
            type="button"
            disabled
            title={fr ? 'Bientôt disponible' : 'Coming soon'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-neutral-200 text-xs font-medium text-neutral-400 cursor-not-allowed select-none opacity-70"
          >
            <span>{m.emoji}</span>{m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
