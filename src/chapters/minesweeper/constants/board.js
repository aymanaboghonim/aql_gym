import {
  AQL_GRAPH_NAME,
  BOARD_LIMITS,
  BOARD_PRESETS,
  calculateMinesForSize,
  getBoardArea,
  getBoardPreset,
} from '../config/gameConfig.js';

export { BOARD_PRESETS, calculateMinesForSize, getBoardPreset, getBoardArea, AQL_GRAPH_NAME };

export const MIN_BOARD_SIZE = BOARD_LIMITS.minSize;
export const MAX_BOARD_SIZE = BOARD_LIMITS.maxSize;
export const DEFAULT_BOARD_SIZE = BOARD_LIMITS.defaultSize;
export const DEFAULT_MINE_COUNT = getBoardPreset(DEFAULT_BOARD_SIZE).mines;

export const X_LABELS = 'ABCDEFGHIJKLMNOPQRST'.split('');

export function getXLabels(size) {
  return X_LABELS.slice(0, size);
}

export function getYLabels(size) {
  return Array.from({ length: size }, (_, index) => String(index + 1));
}

export function getCellId(row, col, size = MAX_BOARD_SIZE) {
  const xLabels = getXLabels(size);
  const yLabels = getYLabels(size);
  return `${xLabels[col]}${yLabels[row]}`;
}

export function getCellPosition(cellId, size = MAX_BOARD_SIZE) {
  const xLabels = getXLabels(size);
  const yLabels = getYLabels(size);
  const match = new RegExp(`^([${xLabels.join('')}])(\\d{1,2})$`).exec(cellId);

  if (!match) {
    return null;
  }

  const col = xLabels.indexOf(match[1]);
  const row = Number(match[2]) - 1;

  if (row < 0 || row >= size || col < 0 || col >= size || yLabels[row] !== match[2]) {
    return null;
  }

  return { row, col };
}

export function getCellIndex(row, col, size = MAX_BOARD_SIZE) {
  return row * size + col;
}

export function getNeighborIndices(row, col, size = MAX_BOARD_SIZE) {
  const neighbors = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) {
        continue;
      }

      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;

      if (nextRow < 0 || nextRow >= size || nextCol < 0 || nextCol >= size) {
        continue;
      }

      neighbors.push(getCellIndex(nextRow, nextCol, size));
    }
  }

  return neighbors;
}

export function getNeighborIds(cellId, size = MAX_BOARD_SIZE) {
  const position = getCellPosition(cellId, size);

  if (!position) {
    return [];
  }

  return getNeighborIndices(position.row, position.col, size).map((index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    return getCellId(row, col, size);
  });
}

export function buildAqlQuery(cellId) {
  return `FOR v IN 1..1 ANY 'cells/${cellId}' GRAPH '${AQL_GRAPH_NAME}'\n  RETURN v`;
}
