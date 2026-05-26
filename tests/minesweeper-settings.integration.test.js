import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SETTINGS_STORAGE_KEY,
  getDefaultSettings,
  loadSettings,
  sanitizeSettings,
  saveSettings,
} from '../src/chapters/minesweeper/persistence/settingsStorage.js';

function createStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

test('settings sanitize handles invalid data and preserves supported feature keys', () => {
  const settings = sanitizeSettings({
    boardSize: 999,
    mineCount: 999,
    features: { teacherMode: 'yes' },
  });

  assert.ok(settings.boardSize <= 20);
  assert.equal(typeof settings.features.teacherMode, 'boolean');
});

test('save/load roundtrip persists settings with schema version', () => {
  global.window = {};
  global.localStorage = createStorage();

  const defaults = getDefaultSettings();
  const next = {
    ...defaults,
    boardSize: 12,
    mineCount: 15,
    modeProfile: 'coach',
    features: {
      ...defaults.features,
      hintMode: true,
    },
  };

  saveSettings(next);
  const loaded = loadSettings();

  assert.equal(loaded.boardSize, 12);
  assert.equal(loaded.mineCount, 15);
  assert.equal(loaded.modeProfile, 'coach');
  assert.equal(loaded.features.hintMode, true);
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  assert.ok(raw);

  const parsed = JSON.parse(raw);
  assert.equal(typeof parsed.version, 'number');
  assert.equal(parsed.boardSize, 12);
  assert.equal(parsed.mineCount, 15);
  assert.equal(parsed.modeProfile, 'coach');
});
