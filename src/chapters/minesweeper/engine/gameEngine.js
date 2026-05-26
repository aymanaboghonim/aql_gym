import {
  GAME_GENERATION,
  getBoardArea,
  getProtectedCellCount,
  sanitizeMineCount,
} from '../config/gameConfig.js';
import {
  getCellId,
  getCellIndex,
  getCellPosition,
  getNeighborIndices,
} from '../constants/board.js';

export const GAME_STATUS = {
  READY: 'ready',
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost',
};

export function getSafeCells(board) {
  const safeIds = new Set();
  for (const cell of board) {
    if (!cell.isMine && cell.adjacentMines === 0) {
      safeIds.add(cell.id);
    }
  }
  return safeIds;
}

export function createEmptyBoard(boardSize) {
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
  const protectedCells = getProtectedCellCount(boardSize);

  if (protectedCells === 1) {
    return new Set([anchorIndex]);
  }

  return new Set([anchorIndex, ...getNeighborIndices(row, col, boardSize)]);
}

function secureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    return 0;
  }

  const maxUint32 = 0x100000000;
  const limit = Math.floor(maxUint32 / maxExclusive) * maxExclusive;
  const random = new Uint32Array(1);

  const maxAttempts = 2048;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    crypto.getRandomValues(random);
    const value = random[0];
    if (value < limit) {
      return value % maxExclusive;
    }
  }

  return random[0] % maxExclusive;
}

function shuffle(values) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomInt(index + 1);
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

  while (progress && iterations < GAME_GENERATION.solvabilityCheckMaxIterations) {
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

export function generatePlayableBoard(anchorId, boardSize, mineCount) {
  const position = getCellPosition(anchorId, boardSize);
  const anchorIndex = position ? getCellIndex(position.row, position.col, boardSize) : 0;
  const safeMineCount = sanitizeMineCount(boardSize, mineCount);

  for (let attempt = 0; attempt < GAME_GENERATION.maxGenerationAttempts; attempt += 1) {
    const candidate = buildRandomBoard(anchorIndex, boardSize, safeMineCount);

    if (solveUsingLogic(candidate, anchorIndex, boardSize, safeMineCount)) {
      return candidate;
    }
  }

  const fallback = buildFallbackBoard(anchorIndex, boardSize, safeMineCount);
  return fallback;
}

export function revealCellOnBoard(board, cellId, boardSize) {
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

export function toggleFlagOnBoard(board, cellId, boardSize) {
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

export function countBoardState(board) {
  const flaggedCount = board.filter((cell) => cell.isFlagged).length;
  const revealedSafeCount = board.filter((cell) => cell.isRevealed && !cell.isMine).length;
  return { flaggedCount, revealedSafeCount };
}
