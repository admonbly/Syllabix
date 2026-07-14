'use client';

/**
 * Rendu des questions en mode EXAMEN (certification + évaluation) :
 * pas de feedback, réponses stockées par VALEUR (chaîne ou tableau de chaînes),
 * modifiables tant que l'épreuve n'est pas soumise.
 */

const PRACTICAL_APPS = {
  excel:      { icon: '📊', color: 'border-green-300 bg-green-50',      chip: 'bg-green-600' },
  word:       { icon: '📝', color: 'border-blue-300 bg-blue-50',        chip: 'bg-blue-600' },
  powerpoint: { icon: '📽️', color: 'border-orange-300 bg-orange-50',   chip: 'bg-orange-500' },
  cmd:        { icon: '⬛', color: 'border-neutral-400 bg-neutral-100', chip: 'bg-neutral-700' },
  explorer:   { icon: '📁', color: 'border-amber-300 bg-amber-50',      chip: 'bg-amber-600' },
  email:      { icon: '📧', color: 'border-teal-300 bg-teal-50',        chip: 'bg-teal-600' },
};

export function ExamPracticalBlock({ question, locale, t }) {
  const app  = PRACTICAL_APPS[question.app] ?? PRACTICAL_APPS.explorer;
  const p    = (k) => t(`quiz.practical.${k}`);
  const comp = question.competency?.[locale] ?? question.competency?.fr;

  return (
    <div className={`mb-6 rounded-2xl border-2 ${app.color} overflow-hidden`}>
      <div className="px-5 py-3 flex flex-wrap items-center gap-2 border-b border-black/5">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold ${app.chip}`}>
          🧪 {p('title')}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 text-neutral-700 text-xs font-semibold border border-black/5">
          {app.icon} {p(`apps.${question.app}`)}
        </span>
        {comp && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold ml-auto">
            🎯 {p('competency')} : {comp}
          </span>
        )}
      </div>
      <div className="px-5 py-4">
        <p className="text-sm font-bold text-neutral-700 mb-3">{p('steps')}</p>
        <ol className="space-y-2 mb-4">
          {(question.instructions ?? []).map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-neutral-700">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-black/10 text-xs font-bold flex items-center justify-center text-neutral-600">
                {i + 1}
              </span>
              <span className="leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        {question.fileUrl ? (
          <div>
            <a
              href={question.fileUrl}
              download
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity ${app.chip}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {p('download')}
            </a>
            <p className="text-xs text-neutral-500 mt-2">{p('downloadHint')}</p>
          </div>
        ) : (
          <p className="text-xs text-neutral-500">{p('noFileHint')}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Zone de réponse par type. `value` et `onChange` manipulent des VALEURS :
 * - single : la chaîne de l'option choisie
 * - multi  : tableau de chaînes
 * - input / calculation : chaîne saisie
 */
export function ExamAnswerInput({ question, value, onChange, locale = 'fr' }) {
  const type = question.type || 'single';

  if (type === 'single') {
    return (
      <div className="space-y-3">
        {(question.options ?? []).map((option, index) => (
          <button
            key={index}
            onClick={() => onChange(option)}
            className={`w-full p-4 text-left rounded-lg border-2 font-semibold transition-all hover:shadow-md ${
              value === option
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-neutral-200 hover:border-accent cursor-pointer'
            }`}
          >
            <span className="inline-block w-7 h-7 rounded-full bg-neutral-100 text-center text-sm font-bold mr-3 leading-7">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </button>
        ))}
      </div>
    );
  }

  if (type === 'multi') {
    const selected = Array.isArray(value) ? value : [];
    const expected = question.expectedCount ?? (Array.isArray(question.correct) ? question.correct.length : null);
    const toggle = (option) => {
      onChange(selected.includes(option)
        ? selected.filter((v) => v !== option)
        : [...selected, option]);
    };
    return (
      <div>
        {expected != null && (
          <p className="text-xs text-neutral-400 mb-3 italic">
            {locale === 'fr'
              ? `Sélectionnez toutes les réponses correctes (${expected} attendue${expected > 1 ? 's' : ''})`
              : `Select all correct answers (${expected} expected)`}
          </p>
        )}
        <div className="space-y-3">
          {(question.options ?? []).map((option, index) => {
            const isSel = selected.includes(option);
            return (
              <button
                key={index}
                onClick={() => toggle(option)}
                className={`w-full p-4 text-left rounded-xl border-2 font-medium transition-all flex items-center gap-3 ${
                  isSel ? 'border-accent bg-accent/10 text-accent' : 'border-neutral-200 hover:border-accent hover:bg-accent/5'
                }`}
              >
                <span className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center text-xs font-bold ${
                  isSel ? 'border-accent bg-accent text-white' : 'border-neutral-300'
                }`}>
                  {isSel && (
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  )}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // input / calculation
  const isCalc = type === 'calculation';
  return (
    <div>
      {question.hint && <p className="text-xs text-neutral-400 mb-3 italic">💡 {question.hint}</p>}
      <div className="flex gap-3 items-stretch">
        <input
          type="text"
          inputMode={isCalc ? 'decimal' : 'text'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isCalc
            ? (locale === 'fr' ? 'Entrez le résultat...' : 'Enter result...')
            : (locale === 'fr' ? 'Votre réponse...' : 'Your answer...')}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-neutral-300 focus:border-accent bg-white font-medium text-base transition-all outline-none"
        />
        {question.unit && (
          <span className="px-3 py-3 bg-neutral-100 rounded-xl text-sm font-semibold text-neutral-600 flex items-center">
            {question.unit}
          </span>
        )}
      </div>
    </div>
  );
}

/** Une réponse est-elle « donnée » (pour la progression / les avertissements) ? */
export function hasAnswerValue(value) {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).trim() !== '';
}
