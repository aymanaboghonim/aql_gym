import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyModeProfile,
  getDefaultFeatureState,
  getMaxPlayableMines,
  sanitizeMineCount,
  validateGameConfig,
} from '../src/chapters/minesweeper/config/gameConfig.js';

test('sanitizeMineCount clamps mine count to playable max', () => {
  assert.equal(sanitizeMineCount(3, 999), getMaxPlayableMines(3));
  assert.equal(sanitizeMineCount(9, -4), 0);
});

test('mode profile applies deterministic overrides', () => {
  const base = getDefaultFeatureState();
  const coach = applyModeProfile('coach', base);
  assert.equal(coach.teacherMode, true);
  assert.equal(coach.showFlagDiscovery, true);
});

test('validateGameConfig rejects presets exceeding playable mine count', () => {
  const result = validateGameConfig({
    presets: [{ size: 3, mines: 99, label: 'invalid' }],
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});
