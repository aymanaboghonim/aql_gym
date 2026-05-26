import { getBoardArea } from '../../config/gameConfig';
import { MAX_BOARD_SIZE } from '../../constants/board';

export default function BoardSetupPanel({
  idPrefix,
  title,
  subtitle,
  size,
  mineCount,
  maxMines,
  onSizeChange,
  onMineChange,
}) {
  const minePercent = getBoardArea(size) > 0 ? Math.round((mineCount / getBoardArea(size)) * 100) : 0;

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">{title}</div>
      <div className="mt-1 text-xs text-slate-400">{subtitle}</div>

      <div className="mt-4">
        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400" htmlFor={`${idPrefix}-size`}>
          Board size
        </label>
        <input
          id={`${idPrefix}-size`}
          type="range"
          min={3}
          max={MAX_BOARD_SIZE}
          value={size}
          onChange={(event) => onSizeChange(Number(event.target.value))}
          className="mt-2 w-full accent-sky-400"
        />
        <div className="mt-1 text-sm font-semibold text-slate-100">{size}x{size}</div>
      </div>

      <div className="mt-4">
        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400" htmlFor={`${idPrefix}-mines`}>
          Mine count
        </label>
        <input
          id={`${idPrefix}-mines`}
          type="range"
          min={0}
          max={maxMines}
          step={1}
          value={mineCount}
          onChange={(event) => onMineChange(Number(event.target.value))}
          className="mt-2 w-full accent-amber-400"
        />
        <div className="mt-1 text-sm font-semibold text-slate-100">{mineCount} mines</div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/60 p-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Live preview</div>
        <div className="mt-1 text-sm text-slate-200">
          {size}x{size} with {mineCount} mines
        </div>
        <div className="text-xs text-slate-500">Mine field intensity: {minePercent}%</div>
      </div>
    </div>
  );
}
