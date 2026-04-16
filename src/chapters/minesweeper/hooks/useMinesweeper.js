import { useMemo, useState } from 'react';
import {
  getBoardArea,
  getBoardPreset,
  getCellId,
  getCellIndex,
  getCellPosition,
  getNeighborIndices,
} from '../constants/board';

const STATUS = {
  READY: 'ready',
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost',
};

export function getSafeCells(board, boardSize, mineCount) {
  // Collect cells with zero adjacent mines (guaranteed safe)
  const safeIds = new Set();
  
  // Add all zero-mine cells - these are definitely safe to click
  // A cell with adjacentMines === 0 is a guaranteed safe move
  for (const cell of board) {
    if (!cell.isMine && cell.adjacentMines === 0) {
      safeIds.add(cell.id);
    }
  }
  
  return safeIds;
}

function createEmptyBoard(boardSize) {
  return Array.from({ length: getBoardArea(boardSize) }, (_, index) => {
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;

    return {
      id: getCellId(row, col, boardSize),
      index,
      row,
      col,
      isMine: false,
      adjacentMines: 0,
      isRevealed: false,
      isFlagged: false,
    };
  });
}

function cloneBoard(board) {
  return board.map((cell) => ({ ...cell }));
}

function createSafeZone(anchorIndex, boardSize) {
  const row = Math.floor(anchorIndex / boardSize);
  const col = anchorIndex % boardSize;
  if (boardSize === 3) {
    return new Set([anchorIndex]);
  }
  return new Set([anchorIndex, ...getNeighborIndices(row, col, boardSize)]);
}

function shuffle(values) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomValue = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    const swapIndex = Math.floor(randomValue * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function calculateAdjacency(board, boardSize) {
  return board.map((cell) => {
    if (cell.isMine) {
      return cell;
    }

    const adjacentMines = getNeighborIndices(cell.row, cell.col, boardSize).reduce(
      (count, neighborIndex) => count + (board[neighborIndex].isMine ? 1 : 0),
      0,
    );

    return { ...cell, adjacentMines };
  });
}

function buildRandomBoard(anchorIndex, boardSize, mineCount) {
  const safeZone = createSafeZone(anchorIndex, boardSize);
  const candidates = Array.from({ length: getBoardArea(boardSize) }, (_, index) => index).filter((index) => !safeZone.has(index));
  const mineIndices = new Set(shuffle(candidates).slice(0, mineCount));

  const board = createEmptyBoard(boardSize).map((cell) => ({
    ...cell,
    isMine: mineIndices.has(cell.index),
  }));

  return calculateAdjacency(board, boardSize);
}

function buildFallbackBoard(anchorIndex, boardSize, mineCount) {
  const safeZone = createSafeZone(anchorIndex, boardSize);
  const board = createEmptyBoard(boardSize).map((cell) => ({ ...cell }));
  let minesPlaced = 0;

  for (let row = boardSize - 1; row >= 0 && minesPlaced < mineCount; row -= 1) {
    for (let col = boardSize - 1; col >= 0 && minesPlaced < mineCount; col -= 1) {
      const index = getCellIndex(row, col, boardSize);

      if (safeZone.has(index)) {
        continue;
      }

      board[index].isMine = true;
      minesPlaced += 1;
    }
  }

  return calculateAdjacency(board, boardSize);
}

function revealZeroCascade(board, startIndex, revealedSet, boardSize) {
  const queue = [startIndex];

  while (queue.length > 0) {
    const index = queue.shift();
    const cell = board[index];

    if (cell.isRevealed || cell.isFlagged) {
      continue;
    }

    cell.isRevealed = true;
    revealedSet.add(index);

    if (cell.adjacentMines !== 0) {
      continue;
    }

    for (const neighborIndex of getNeighborIndices(cell.row, cell.col, boardSize)) {
      if (!board[neighborIndex].isRevealed && !board[neighborIndex].isFlagged) {
        queue.push(neighborIndex);
      }
    }
  }
}

function getHiddenNeighborIndices(board, index, boardSize) {
  const cell = board[index];
  return getNeighborIndices(cell.row, cell.col, boardSize).filter((neighborIndex) => !board[neighborIndex].isRevealed);
}

function solveUsingLogic(board, anchorIndex, boardSize, mineCount) {
  const workingBoard = cloneBoard(board);
  const revealedSet = new Set();
  const flaggedSet = new Set();

  revealZeroCascade(workingBoard, anchorIndex, revealedSet, boardSize);

  let progress = true;
  let iterations = 0;

  while (progress && iterations < 250) {
    iterations += 1;
    progress = false;

    for (const cell of workingBoard) {
      if (!cell.isRevealed || cell.adjacentMines === 0) {
        continue;
      }

      const neighborIndices = getNeighborIndices(cell.row, cell.col, boardSize);
      const hiddenNeighbors = neighborIndices.filter(
        (neighborIndex) => !workingBoard[neighborIndex].isRevealed && !flaggedSet.has(neighborIndex),
      );
      const flaggedNeighbors = neighborIndices.filter((neighborIndex) => flaggedSet.has(neighborIndex));
      const remainingMines = cell.adjacentMines - flaggedNeighbors.length;

      if (remainingMines === 0 && hiddenNeighbors.length > 0) {
        for (const neighborIndex of hiddenNeighbors) {
          revealZeroCascade(workingBoard, neighborIndex, revealedSet, boardSize);
        }

        progress = true;
        continue;
      }

      if (remainingMines > 0 && remainingMines === hiddenNeighbors.length) {
        for (const neighborIndex of hiddenNeighbors) {
          flaggedSet.add(neighborIndex);
          workingBoard[neighborIndex].isFlagged = true;
        }

        progress = true;
      }
    }

    const revealedClues = workingBoard.filter((cell) => cell.isRevealed && cell.adjacentMines > 0);

    for (let leftIndex = 0; leftIndex < revealedClues.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < revealedClues.length; rightIndex += 1) {
        const leftCell = revealedClues[leftIndex];
        const rightCell = revealedClues[rightIndex];
        const leftHidden = getHiddenNeighborIndices(workingBoard, leftCell.index, boardSize).filter(
          (neighborIndex) => !flaggedSet.has(neighborIndex),
        );
        const rightHidden = getHiddenNeighborIndices(workingBoard, rightCell.index, boardSize).filter(
          (neighborIndex) => !flaggedSet.has(neighborIndex),
        );
        const leftRemaining = leftCell.adjacentMines - getNeighborIndices(leftCell.row, leftCell.col, boardSize).filter((neighborIndex) => flaggedSet.has(neighborIndex)).length;
        const rightRemaining = rightCell.adjacentMines - getNeighborIndices(rightCell.row, rightCell.col, boardSize).filter((neighborIndex) => flaggedSet.has(neighborIndex)).length;

        const leftSet = new Set(leftHidden);
        const rightSet = new Set(rightHidden);
        const leftIsSubset = leftHidden.every((index) => rightSet.has(index));
        const rightIsSubset = rightHidden.every((index) => leftSet.has(index));

        if (leftIsSubset && rightHidden.length > leftHidden.length) {
          const difference = rightHidden.filter((index) => !leftSet.has(index));

          if (leftRemaining === rightRemaining) {
            for (const neighborIndex of difference) {
              revealZeroCascade(workingBoard, neighborIndex, revealedSet, boardSize);
            }
            progress = true;
          } else if (rightRemaining - leftRemaining === difference.length) {
            for (const neighborIndex of difference) {
              flaggedSet.add(neighborIndex);
              workingBoard[neighborIndex].isFlagged = true;
            }
            progress = true;
          }
        }

        if (rightIsSubset && leftHidden.length > rightHidden.length) {
          const difference = leftHidden.filter((index) => !rightSet.has(index));

          if (leftRemaining === rightRemaining) {
            for (const neighborIndex of difference) {
              revealZeroCascade(workingBoard, neighborIndex, revealedSet, boardSize);
            }
            progress = true;
          } else if (leftRemaining - rightRemaining === difference.length) {
            for (const neighborIndex of difference) {
              flaggedSet.add(neighborIndex);
              workingBoard[neighborIndex].isFlagged = true;
            }
            progress = true;
          }
        }
      }
    }
  }

  const safeCellCount = getBoardArea(boardSize) - mineCount;
  const revealedSafeCount = workingBoard.filter((cell) => !cell.isMine && revealedSet.has(cell.index)).length;

  return revealedSafeCount === safeCellCount;
}

function generatePlayableBoard(anchorId, boardSize, mineCount) {
  const position = getCellPosition(anchorId, boardSize);
  const anchorIndex = position ? getCellIndex(position.row, position.col, boardSize) : 0;

  for (let attempt = 0; attempt < 220; attempt += 1) {
    const candidate = buildRandomBoard(anchorIndex, boardSize, mineCount);

    if (solveUsingLogic(candidate, anchorIndex, boardSize, mineCount)) {
      return candidate;
    }
  }

  const fallback = buildFallbackBoard(anchorIndex, boardSize, mineCount);

  if (solveUsingLogic(fallback, anchorIndex, boardSize, mineCount)) {
    return fallback;
  }

  return fallback;
}

function revealCell(board, cellId, boardSize) {
  const position = getCellPosition(cellId, boardSize);

  if (!position) {
    return { board, hitMine: false };
  }

  const nextBoard = cloneBoard(board);
  const stack = [getCellIndex(position.row, position.col, boardSize)];
  let hitMine = false;

  while (stack.length > 0) {
    const index = stack.pop();
    const cell = nextBoard[index];

    if (cell.isFlagged || cell.isRevealed) {
      continue;
    }

    cell.isRevealed = true;

    if (cell.isMine) {
      hitMine = true;
      continue;
    }

    if (cell.adjacentMines === 0) {
      for (const neighborIndex of getNeighborIndices(cell.row, cell.col, boardSize)) {
        if (!nextBoard[neighborIndex].isRevealed && !nextBoard[neighborIndex].isFlagged) {
          stack.push(neighborIndex);
        }
      }
    }
  }

  return { board: nextBoard, hitMine };
}

function toggleFlag(board, cellId, boardSize) {
  const position = getCellPosition(cellId, boardSize);

  if (!position) {
    return board;
  }

  const nextBoard = cloneBoard(board);
  const index = getCellIndex(position.row, position.col, boardSize);
  const cell = nextBoard[index];

  if (!cell.isRevealed) {
    cell.isFlagged = !cell.isFlagged;
  }

  return nextBoard;
}

export function useMinesweeper() {
  const [boardSize, setBoardSize] = useState(3);
  const [mineCount, setMineCount] = useState(0);
  const [board, setBoard] = useState(() => createEmptyBoard(3));
  const [status, setStatus] = useState(STATUS.READY);
  const [generated, setGenerated] = useState(false);
  const [moves, setMoves] = useState(0);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [revealedSafeCells, setRevealedSafeCells] = useState(0);
  const [safeCellIds, setSafeCellIds] = useState(new Set());

  const boardArea = getBoardArea(boardSize);
  const remainingMines = mineCount - flagsPlaced;
  const gameWon = status === STATUS.WON;
  const gameLost = status === STATUS.LOST;
  const boardPreset = getBoardPreset(boardSize);

  const metrics = useMemo(
    () => ({
      moves,
      remainingMines,
      revealedSafeCells,
      totalSafeCells: boardArea - mineCount,
      boardSize,
      mineCount,
    }),
    [boardArea, boardSize, mineCount, moves, remainingMines, revealedSafeCells],
  );

  function beginIfNeeded(anchorId) {
    if (generated) {
      return board;
    }

    const nextBoard = generatePlayableBoard(anchorId, boardSize, mineCount);
    
    // Compute safe cells after board generation
    const safeCells = getSafeCells(nextBoard, boardSize, mineCount);
    setSafeCellIds(safeCells);
    
    setBoard(nextBoard);
    setGenerated(true);
    setStatus(STATUS.PLAYING);

    return nextBoard;
  }

  function syncCounts(nextBoard) {
    const flaggedCount = nextBoard.filter((cell) => cell.isFlagged).length;
    const revealedSafeCount = nextBoard.filter((cell) => cell.isRevealed && !cell.isMine).length;

    setFlagsPlaced(flaggedCount);
    setRevealedSafeCells(revealedSafeCount);

    if (revealedSafeCount === boardArea - mineCount) {
      setStatus(STATUS.WON);
    }
  }

  function handleReveal(cellId) {
    if (status === STATUS.LOST || status === STATUS.WON) {
      return;
    }

    const currentBoard = beginIfNeeded(cellId);
    const { board: nextBoard, hitMine } = revealCell(currentBoard, cellId, boardSize);

    setBoard(nextBoard);
    setMoves((value) => value + 1);
    syncCounts(nextBoard);

    if (hitMine) {
      setStatus(STATUS.LOST);
      setBoard((latestBoard) => latestBoard.map((cell) => (cell.isMine ? { ...cell, isRevealed: true } : cell)));
    }
  }

  function handleFlag(cellId) {
    if (status === STATUS.LOST || status === STATUS.WON) {
      return;
    }

    const currentBoard = beginIfNeeded(cellId);
    const nextBoard = toggleFlag(currentBoard, cellId, boardSize);

    setBoard(nextBoard);
    setMoves((value) => value + 1);
    syncCounts(nextBoard);
  }

  function resetGame() {
    setBoard(createEmptyBoard(boardSize));
    setStatus(STATUS.READY);
    setGenerated(false);
    setMoves(0);
    setFlagsPlaced(0);
    setRevealedSafeCells(0);
    setSafeCellIds(new Set());
  }

  function applyDifficulty(size, nextMineCount) {
    setBoardSize(size);
    setMineCount(nextMineCount);
    setBoard(createEmptyBoard(size));
    setStatus(STATUS.READY);
    setGenerated(false);
    setMoves(0);
    setFlagsPlaced(0);
    setRevealedSafeCells(0);
    setSafeCellIds(new Set());
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
  };
}
