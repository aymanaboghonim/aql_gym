import MinesweeperChapter from './MinesweeperChapter';
import { BOARD_LIMITS, GAME_CONFIG_VERSION, MODE_PROFILES, UI_FEATURES, getBoardPreset } from './config/gameConfig';

export const MINESWEEPER_CHAPTER_CONFIG_SCHEMA = {
  version: GAME_CONFIG_VERSION,
  boardSize: {
    type: 'number',
    min: BOARD_LIMITS.minSize,
    max: BOARD_LIMITS.maxSize,
  },
  mineCount: {
    type: 'number',
    min: 0,
  },
  features: {
    type: 'object',
    allowedKeys: Object.keys(UI_FEATURES),
  },
  modeProfile: {
    type: 'string',
    allowedValues: Object.keys(MODE_PROFILES),
  },
};

export const MINESWEEPER_DEFAULT_CONFIG = {
  version: GAME_CONFIG_VERSION,
  boardSize: getBoardPreset(9).size,
  mineCount: getBoardPreset(9).mines,
  features: Object.values(UI_FEATURES).reduce((acc, feature) => {
    acc[feature.id] = feature.defaultEnabled;
    return acc;
  }, {}),
  modeProfile: 'beginner',
};

export const MINESWEEPER_CAPABILITIES = {
  guide: true,
  fullscreen: true,
  customizableBoard: true,
  modeProfiles: true,
};

export const MINESWEEPER_CHAPTER_META = {
  id: 'minesweeper',
  title: 'Minesweeper',
  route: '/chapters/minesweeper',
  status: 'active',
  description: 'Chapter 1: pattern reasoning and constraint logic.',
  component: MinesweeperChapter,
  configSchema: MINESWEEPER_CHAPTER_CONFIG_SCHEMA,
  defaultConfig: MINESWEEPER_DEFAULT_CONFIG,
  capabilities: MINESWEEPER_CAPABILITIES,
  training: {
    hasGuidePage: true,
  },
};
