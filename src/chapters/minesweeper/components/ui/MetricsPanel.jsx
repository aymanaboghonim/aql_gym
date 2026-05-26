function MetricCard({ label, value, valueClass = 'text-slate-300' }) {
  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3 text-center">
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">{label}</div>
      <div className={`mt-0.5 text-base font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

export default function MetricsPanel({
  safeCells,
  mineCount,
  remainingMines,
  moves,
  boardSize,
  showRemainingFlags,
  compact = false,
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:gap-3">
      <MetricCard label="Safe" value={safeCells} valueClass="text-sky-300" />
      <MetricCard label="Mines" value={mineCount} valueClass="text-rose-300" />
      {showRemainingFlags && <MetricCard label="Flags" value={remainingMines} valueClass="text-amber-300" />}
      <MetricCard label="Moves" value={moves} valueClass="text-purple-300" />
      {!compact && <MetricCard label="Board" value={`${boardSize}×${boardSize}`} valueClass="text-slate-300" />}
    </div>
  );
}
