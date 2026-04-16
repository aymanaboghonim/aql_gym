function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

const NUMBER_STYLES = {
  1: 'text-sky-100 drop-shadow-lg font-bold',
  2: 'text-emerald-100 drop-shadow-lg font-bold',
  3: 'text-rose-100 drop-shadow-lg font-bold',
  4: 'text-violet-100 drop-shadow-lg font-bold',
  5: 'text-amber-100 drop-shadow-lg font-bold',
  6: 'text-cyan-100 drop-shadow-lg font-bold',
  7: 'text-fuchsia-100 drop-shadow-lg font-bold',
  8: 'text-slate-50 drop-shadow-lg font-bold',
};

export default function Cell({
  cell,
  teacherMode,
  isHighlighted,
  isAnchorHighlighted,
  isHinted,
  showFlagDiscovery = false,
  cellSize = 56,
  onClick,
  onContextMenu,
  onMouseEnter,
}) {
  const flagDiscoveryState =
    showFlagDiscovery && cell.isFlagged && !cell.isRevealed ? (cell.isMine ? 'correct' : 'incorrect') : null;
  const revealMine =
    cell.isMine && (cell.isRevealed || teacherMode || (showFlagDiscovery && cell.isFlagged && !cell.isRevealed));
  const revealNumber = cell.isRevealed && !cell.isMine && cell.adjacentMines > 0;
  const showHint = cell.isRevealed && !cell.isMine && cell.adjacentMines === 0;
  const numberSizeClass = cellSize >= 80 ? 'text-4xl' : cellSize >= 58 ? 'text-3xl' : cellSize >= 42 ? 'text-2xl' : 'text-xl';
  const idSizeClass = cellSize >= 58 ? 'text-xs' : 'text-[10px]';
  const mineSizeClass = cellSize >= 58 ? 'h-10 w-10 text-lg' : 'h-8 w-8 text-base';
  const revealMotion = cell.isRevealed ? 'animate-cell-reveal' : 'animate-cell-idle';
  const flaggedMotion = cell.isFlagged ? 'animate-flag-bounce' : '';
  const mineMotion = revealMine ? 'animate-mine-pop' : '';
  const numberMotion = revealNumber ? 'animate-number-pop' : '';

  return (
    <button
      type="button"
      data-id={cell.id}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      className={joinClasses(
        'group relative aspect-square overflow-hidden rounded-lg border text-left transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-[0.98]',
        revealMotion,
        flaggedMotion,
        cell.isRevealed
          ? 'border-slate-500/40 bg-slate-950/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
          : 'border-slate-600/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-sky-300/60 hover:from-slate-700 hover:to-slate-800 active:bg-slate-800 shadow-md hover:shadow-lg',
        isHighlighted && 'border-sky-300/80 bg-sky-400/15 ring-1 ring-sky-300/40 shadow-lg shadow-sky-500/15',
        isAnchorHighlighted && 'border-sky-200/80 bg-sky-400/20 ring-2 ring-sky-300/50 shadow-lg shadow-sky-500/25',
        cell.isFlagged && 'border-amber-300/70 bg-amber-900/20 shadow-lg shadow-amber-500/10',
        flagDiscoveryState === 'correct' && 'border-emerald-300/80 bg-emerald-500/18 shadow-lg shadow-emerald-500/20',
        flagDiscoveryState === 'incorrect' && 'border-rose-300/80 bg-rose-500/18 shadow-lg shadow-rose-500/20',
      )}
      aria-label={`Cell ${cell.id}`}
    >
      {!cell.isRevealed && (
        <span
          className={joinClasses(
            `absolute left-1.5 top-1 ${idSizeClass} font-extrabold tracking-wider text-slate-50 mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]`,
          )}
        >
          {cell.id}
        </span>
      )}

      {isHinted && !cell.isRevealed && !cell.isFlagged && (
        <span className="absolute right-2 top-2 text-xs text-slate-400/40 leading-none">✓</span>
      )}

      <div className="flex h-full w-full items-center justify-center">
        {revealMine && (
          <div
            className={joinClasses(
              `flex ${mineSizeClass} items-center justify-center rounded-full border`,
              mineMotion,
              cell.isRevealed
                ? 'border-rose-400/80 bg-rose-500/30 text-rose-100 shadow-lg shadow-rose-500/10'
                : 'border-rose-300/30 bg-rose-400/12 text-rose-200/40 opacity-35',
            )}
          >
            <span className="leading-none">●</span>
          </div>
        )}

        {revealNumber && (
          <span className={joinClasses(`${numberSizeClass} leading-tight mono`, NUMBER_STYLES[cell.adjacentMines], numberMotion)}>
            {cell.adjacentMines}
          </span>
        )}

        {showHint && <span className="text-[11px] uppercase tracking-[0.28em] text-slate-500/70 mono font-medium">Open</span>}

        {!cell.isRevealed && cell.isFlagged && (
          <span
            className={joinClasses(
              'text-3xl leading-none',
              flagDiscoveryState === 'correct'
                ? 'text-emerald-300'
                : flagDiscoveryState === 'incorrect'
                  ? 'text-rose-300'
                  : 'text-amber-300',
            )}
          >
            ⚑
          </span>
        )}

        {flagDiscoveryState && (
          <span
            className={joinClasses(
              'absolute bottom-1 right-1 rounded-full px-1 text-[10px] font-black mono',
              flagDiscoveryState === 'correct' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200',
            )}
          >
            {flagDiscoveryState === 'correct' ? 'OK' : 'X'}
          </span>
        )}
      </div>
    </button>
  );
}