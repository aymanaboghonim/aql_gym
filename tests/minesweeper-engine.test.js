import test from 'node:test';
import assert from 'node:assert/strict';

import {
  countBoardState,
  createEmptyBoard,
  generatePlayableBoard,
  revealCellOnBoard,
  toggleFlagOnBoard,
} from '../src/chapters/minesweeper/engine/gameEngine.js';

test('createEmptyBoard creates correct shape and ids', () => {
  const board = createEmptyBoard(3);
  assert.equal(board.length, 9);
  assert.equal(board[0].id, 'A1');
  assert.equal(board[8].id, 'C3');
});

test('toggleFlagOnBoard toggles non-revealed cell flag', () => {
  const board = createEmptyBoard(3);
  const flagged = toggleFlagOnBoard(board, 'A1', 3);
  assert.equal(flagged[0].isFlagged, true);
  const unflagged = toggleFlagOnBoard(flagged, 'A1', 3);
  assert.equal(unflagged[0].isFlagged, false);
});

test('revealCellOnBoard reveals clicked area', () => {
  const board = createEmptyBoard(3);
  const result = revealCellOnBoard(board, 'A1', 3);
  assert.equal(result.hitMine, false);
  assert.ok(result.board.some((cell) => cell.isRevealed));
});

test('countBoardState returns flagged and revealed-safe counts', () => {
  const board = createEmptyBoard(3);
  board[0].isFlagged = true;
  board[1].isRevealed = true;
  const counts = countBoardState(board);
  assert.equal(counts.flaggedCount, 1);
  assert.equal(counts.revealedSafeCount, 1);
});

test('generatePlayableBoard returns board with expected area and safe first click', () => {
  const board = generatePlayableBoard('A1', 9, 10);
  assert.equal(board.length, 81);
  const firstCell = board.find((cell) => cell.id === 'A1');
  assert.equal(firstCell.isMine, false);
});
