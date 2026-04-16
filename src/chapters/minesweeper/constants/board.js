export const BOARD_PRESETS = [
  { size: 9, mines: 10, label: '9 x 9' },
  { size: 12, mines: 20, label: '12 x 12' },
  { size: 16, mines: 40, label: '16 x 16' },
];

export const MIN_BOARD_SIZE = 3;
export const MAX_BOARD_SIZE = 20;
export const DEFAULT_BOARD_SIZE = 9;
export const DEFAULT_MINE_COUNT = 10;
export const X_LABELS = 'ABCDEFGHIJKLMNOPQRST'.split('');
export const AQL_GRAPH_NAME = 'Mines';

export function calculateMinesForSize(size) {
  return Math.max(1, Math.ceil(size * size * 0.15));
}

export function getBoardPreset(size) {
  return BOARD_PRESETS.find((preset) => preset.size === size) ?? {
    size,
    mines: calculateMinesForSize(size),
    label: `${size} x ${size}`,
  };
}

export function getBoardArea(size) {
  return size * size;
}

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