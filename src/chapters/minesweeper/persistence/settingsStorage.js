import {
  GAME_CONFIG_VERSION,
  getBoardPreset,
  getDefaultFeatureState,
  sanitizeBoardSize,
  sanitizeMineCount,
} from '../config/gameConfig.js';

const STORAGE_KEY = 'aql-gym-minesweeper-settings';

export function getDefaultSettings() {
  const defaultSize = sanitizeBoardSize(getBoardPreset(9).size);
  return {
    version: GAME_CONFIG_VERSION,
    boardSize: defaultSize,
    mineCount: getBoardPreset(defaultSize).mines,
    features: getDefaultFeatureState(),
    modeProfile: 'beginner',
  };
}

export function sanitizeSettings(input) {
  const defaults = getDefaultSettings();
  const nextBoardSize = sanitizeBoardSize(input?.boardSize ?? defaults.boardSize);
  const nextMineCount = sanitizeMineCount(nextBoardSize, input?.mineCount ?? defaults.mineCount);
  const featureDefaults = getDefaultFeatureState();

  const features = {
    ...featureDefaults,
    ...(input?.features ?? {}),
  };

  for (const key of Object.keys(featureDefaults)) {
    features[key] = Boolean(features[key]);
  }

  return {
    version: GAME_CONFIG_VERSION,
    boardSize: nextBoardSize,
    mineCount: nextMineCount,
    features,
    modeProfile: typeof input?.modeProfile === 'string' ? input.modeProfile : defaults.modeProfile,
  };
}

export function loadSettings() {
  if (typeof window === 'undefined') {
    return getDefaultSettings();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultSettings();
    }

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== GAME_CONFIG_VERSION) {
      return getDefaultSettings();
    }

    return sanitizeSettings(parsed);
  } catch {
    return getDefaultSettings();
  }
}

export function saveSettings(settings) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeSettings(settings)));
}

export const SETTINGS_STORAGE_KEY = STORAGE_KEY;
