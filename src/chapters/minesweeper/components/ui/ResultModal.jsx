export default function ResultModal({ resultModal, onRestart, onClose }) {
  if (!resultModal) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close result modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      <div className="result-modal-in relative w-full max-w-md rounded-2xl border border-slate-600/50 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl">
        <button
          type="button"
          aria-label="Close result modal"
          onClick={onClose}
          className="absolute right-3 top-3 h-8 w-8 rounded-full border border-slate-600 bg-slate-800/80 text-slate-200 transition hover:bg-slate-700"
        >
          ×
        </button>
        <div role="img" aria-label={resultModal === 'won' ? 'Victory celebration' : 'Motivational encouragement'} className="text-6xl leading-none mb-4">{resultModal === 'won' ? '🏆✨' : '💪��'}</div>
        <h3 className="text-3xl font-black text-slate-50 mb-3">{resultModal === 'won' ? 'Community Win!' : 'Excellent Attempt!'}</h3>

        <p className="text-sm leading-relaxed text-slate-300 mb-6">
          {resultModal === 'won'
            ? 'Great solve. Your pattern reading and decision flow were sharp. Keep the momentum and try a tougher board.'
            : 'Nice attempt. Every miss is signal, not failure. Take a breath, reset, and beat this board with better pattern calls.'}
        </p>

        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 rounded-lg border border-sky-400/40 bg-sky-500/15 hover:bg-sky-500/25 px-4 py-3 text-sm font-semibold text-sky-100 transition"
          >
            {resultModal === 'won' ? '🚀 New Challenge' : '🔄 Try Again'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
