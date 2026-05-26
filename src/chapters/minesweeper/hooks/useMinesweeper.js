import { useMemo, useState } from 'react';
import {
  getBoardArea,
  getBoardPreset,
  sanitizeBoardSize,
  sanitizeMineCount,
} from '../config/gameConfig.js';
import {
  GAME_STATUS,
  countBoardState,
  createEmptyBoard,
  generatePlayableBoard,
  getSafeCells,
  revealCellOnBoard,
  toggleFlagOnBoard,
} from '../engine/gameEngine.js';
import { loadSettings, saveSettings } from '../persistence/settingsStorage.js';

function createMetrics(boardSize, mineCount, moves, flagsPlaced, revealedSafeCells) {
  return {
    moves,
    remainingMines: mineCount - flagsPlaced,
    revealedSafeCells,
    totalSafeCells: getBoardArea(boardSize) - mineCount,
    boardSize,
    mineCount,
  };
}

export function useMinesweeper() {
  const initialSettings = loadSettings();
  const initialBoardSize = sanitizeBoardSize(initialSettings.boardSize);
  const initialMineCount = sanitizeMineCount(initialBoardSize, initialSettings.mineCount);

  const [boardSize, setBoardSize] = useState(initialBoardSize);
  const [mineCount, setMineCount] = useState(initialMineCount);
  const [board, setBoard] = useState(() => createEmptyBoard(initialBoardSize));
  const [status, setStatus] = useState(GAME_STATUS.READY);
  const [generated, setGenerated] = useState(false);
  const [moves, setMoves] = useState(0);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [revealedSafeCells, setRevealedSafeCells] = useState(0);
  const [safeCellIds, setSafeCellIds] = useState(new Set());

  const boardArea = getBoardArea(boardSize);
  const gameWon = status === GAME_STATUS.WON;
  const gameLost = status === GAME_STATUS.LOST;
  const boardPreset = getBoardPreset(boardSize);

  const metrics = useMemo(
    () => createMetrics(boardSize, mineCount, moves, flagsPlaced, revealedSafeCells),
    [boardSize, mineCount, moves, flagsPlaced, revealedSafeCells],
  );

  function persistCurrentSettings(nextBoardSize, nextMineCount) {
    const previous = loadSettings();
    saveSettings({
      ...previous,
      boardSize: nextBoardSize,
      mineCount: nextMineCount,
    });
  }

  function beginIfNeeded(anchorId) {
    if (generated) {
      return board;
    }

    const nextBoard = generatePlayableBoard(anchorId, boardSize, mineCount);
    setSafeCellIds(getSafeCells(nextBoard));
    setBoard(nextBoard);
    setGenerated(true);
    setStatus(GAME_STATUS.PLAYING);

    return nextBoard;
  }

  function syncCounts(nextBoard) {
    const { flaggedCount, revealedSafeCount } = countBoardState(nextBoard);

    setFlagsPlaced(flaggedCount);
    setRevealedSafeCells(revealedSafeCount);

    if (revealedSafeCount === boardArea - mineCount) {
      setStatus(GAME_STATUS.WON);
    }
  }

  function handleReveal(cellId) {
    if (gameWon || gameLost) {
      return;
    }

    const currentBoard = beginIfNeeded(cellId);
    const { board: nextBoard, hitMine } = revealCellOnBoard(currentBoard, cellId, boardSize);

    setBoard(nextBoard);
    setMoves((value) => value + 1);
    syncCounts(nextBoard);

    if (hitMine) {
      setStatus(GAME_STATUS.LOST);
      setBoard((latestBoard) => latestBoard.map((cell) => (cell.isMine ? { ...cell, isRevealed: true } : cell)));
    }
  }

  function handleFlag(cellId) {
    if (gameWon || gameLost) {
      return;
    }

    const currentBoard = beginIfNeeded(cellId);
    const nextBoard = toggleFlagOnBoard(currentBoard, cellId, boardSize);

    setBoard(nextBoard);
    setMoves((value) => value + 1);
    syncCounts(nextBoard);
  }

  function resetGame() {
    setBoard(createEmptyBoard(boardSize));
    setStatus(GAME_STATUS.READY);
    setGenerated(false);
    setMoves(0);
    setFlagsPlaced(0);
    setRevealedSafeCells(0);
    setSafeCellIds(new Set());
  }

  function applyDifficulty(size, nextMineCount) {
    const safeSize = sanitizeBoardSize(size);
    const safeMineCount = sanitizeMineCount(safeSize, nextMineCount);

    setBoardSize(safeSize);
    setMineCount(safeMineCount);
    setBoard(createEmptyBoard(safeSize));
    setStatus(GAME_STATUS.READY);
    setGenerated(false);
    setMoves(0);
    setFlagsPlaced(0);
    setRevealedSafeCells(0);
    setSafeCellIds(new Set());
    persistCurrentSettings(safeSize, safeMineCount);
  }

  function setDifficulty(size) {
    const preset = getBoardPreset(size);
    applyDifficulty(size, preset.mines);
  }

  function setDifficultyPreset(size, mines) {
    applyDifficulty(size, mines);
  }

  return {
    board,
    status,
    gameWon,
    gameLost,
    boardSize,
    mineCount,
    boardPreset,
    metrics,
    revealCell: handleReveal,
    flagCell: handleFlag,
    resetGame,
    setDifficulty,
    setDifficultyPreset,
    safeCellIds,
    initialSettings,
  };
}
