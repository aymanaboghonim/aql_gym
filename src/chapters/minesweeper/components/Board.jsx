import { Fragment } from 'react';
import Cell from './Cell';

export default function Board({
  board,
  boardSize,
  highlightedIds,
  highlightAnchors,
  teacherMode,
  hintMode,
  safeCellIds,
  showFlagDiscovery = false,
  gameWon = false,
  gameLost = false,
  isFullscreen = false,
  viewportWidth = 0,
  viewportHeight = 0,
  onCellClick,
  onCellContextMenu,
  onCellHover,
}) {
  const cellGap = isFullscreen ? Math.max(2, 10 - Math.floor(boardSize / 3)) : Math.max(2, 12 - boardSize);
  const boardPadding = isFullscreen ? Math.max(4, 10 - Math.floor(boardSize / 3)) : Math.max(1, 5 - Math.floor(boardSize / 8));

  const baseCellSize = boardSize <= 6 ? 92 : boardSize <= 9 ? 78 : boardSize <= 12 ? 62 : boardSize <= 16 ? 50 : 42;
  const boardPaddingPx = boardPadding * 4;
  const shouldAutoFit = isFullscreen || (viewportWidth > 0 && viewportHeight > 0);
  const availableWidth = shouldAutoFit ? Math.max(280, viewportWidth) : Infinity;
  const availableHeight = shouldAutoFit ? Math.max(280, viewportHeight) : Infinity;
  const totalColumns = boardSize + 1;
  const totalRows = boardSize + 1;

  const cellByWidth = Math.floor(
    (availableWidth - boardPaddingPx * 2 - (totalColumns - 1) * cellGap) / totalColumns,
  );
  const cellByHeight = Math.floor(
    (availableHeight - boardPaddingPx * 2 - (totalRows - 1) * cellGap) / totalRows,
  );
  const responsiveCellSize = Math.max(12, Math.min(130, Math.min(cellByWidth, cellByHeight)));
  const effectiveCellSize = shouldAutoFit ? responsiveCellSize : baseCellSize;
  const cellSizeStr = `${effectiveCellSize}px`;

  const colLabels = 'ABCDEFGHIJKLMNOPQRST'.split('').slice(0, boardSize);
  const rowLabels = Array.from({ length: boardSize }, (_, i) => String(i + 1));

  return (
    <div
      className={`flex w-full flex-col ${isFullscreen ? 'h-full items-center justify-center gap-2 p-1' : 'items-start gap-1 p-1'} ${
        gameWon ? 'board-celebrate' : gameLost ? 'board-shake' : ''
      }`}
    >
      <div
        className={`grid rounded-3xl bg-gradient-to-br from-slate-950/60 to-slate-900/40 ring-1 ring-slate-600/30 shadow-2xl ${
          gameWon ? 'board-glow-win' : gameLost ? 'board-glow-loss' : ''
        }`}
        style={{
          gridTemplateColumns: `repeat(${totalColumns}, ${cellSizeStr})`,
          gridAutoRows: cellSizeStr,
          gap: `${cellGap}px`,
          padding: `${boardPaddingPx}px`,
          width: 'fit-content',
        }}
      >
        <div
          className="rounded-lg border border-transparent"
          style={{ width: cellSizeStr, height: cellSizeStr }}
          aria-hidden="true"
        />

        {colLabels.map((label) => (
          <div
            key={`col-${label}`}
            className="flex items-center justify-center rounded-lg bg-slate-900/70 text-center text-sm font-bold uppercase tracking-widest text-slate-200"
            style={{ width: cellSizeStr, height: cellSizeStr }}
          >
            {label}
          </div>
        ))}

        {rowLabels.map((label, rowIndex) => (
          <Fragment key={`row-${label}`}>
            <div
              className="flex items-center justify-center rounded-lg bg-slate-900/70 text-center text-sm font-bold uppercase tracking-widest text-slate-200"
              style={{ width: cellSizeStr, height: cellSizeStr }}
            >
              {label}
            </div>

            {board.slice(rowIndex * boardSize, rowIndex * boardSize + boardSize).map((cell) => (
              <Cell
                key={cell.id}
                cell={cell}
                teacherMode={teacherMode}
                isHighlighted={highlightedIds.has(cell.id)}
                isAnchorHighlighted={highlightAnchors.has(cell.id)}
                isHinted={hintMode && safeCellIds.has(cell.id)}
                showFlagDiscovery={showFlagDiscovery}
                cellSize={effectiveCellSize}
                onClick={onCellClick(cell)}
                onContextMenu={onCellContextMenu(cell)}
                onMouseEnter={onCellHover(cell)}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}