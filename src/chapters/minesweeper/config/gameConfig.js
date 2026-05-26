export const GAME_CONFIG_VERSION = 1;

export const BOARD_LIMITS = {
  minSize: 3,
  maxSize: 20,
  defaultSize: 9,
};

export const BOARD_PRESETS = [
  { size: 9, mines: 10, label: '9 x 9' },
  { size: 12, mines: 20, label: '12 x 12' },
  { size: 16, mines: 40, label: '16 x 16' },
];

export const GAME_GENERATION = {
  maxGenerationAttempts: 220,
  solverMaxIterations: 250,
};

export const FIRST_CLICK_PROTECTION = {
  smallBoardProtectedCells: 1,
  defaultProtectedCells: 9,
};

export const UI_FEATURES = {
  highlightMode: {
    id: 'highlightMode',
    label: 'Highlight mode',
    accentClass: 'accent-sky-400',
    defaultEnabled: false,
  },
  teacherMode: {
    id: 'teacherMode',
    label: 'Teacher mode',
    accentClass: 'accent-cyan-400',
    defaultEnabled: false,
  },
  hintMode: {
    id: 'hintMode',
    label: 'Hint mode',
    accentClass: 'accent-emerald-400',
    defaultEnabled: false,
  },
  soundEnabled: {
    id: 'soundEnabled',
    label: 'Sound',
    accentClass: 'accent-amber-400',
    defaultEnabled: true,
  },
  showRemainingFlags: {
    id: 'showRemainingFlags',
    label: 'Flag counter',
    accentClass: 'accent-lime-400',
    defaultEnabled: true,
  },
  showFlagDiscovery: {
    id: 'showFlagDiscovery',
    label: 'Flag feedback',
    accentClass: 'accent-rose-400',
    defaultEnabled: false,
  },
};

export const MODE_PROFILES = {
  beginner: {
    id: 'beginner',
    label: 'Beginner',
    features: {
      hintMode: true,
      teacherMode: true,
      showRemainingFlags: true,
      soundEnabled: true,
    },
  },
  coach: {
    id: 'coach',
    label: 'Coach',
    features: {
      highlightMode: true,
      teacherMode: true,
      hintMode: true,
      showRemainingFlags: true,
      showFlagDiscovery: true,
      soundEnabled: true,
    },
  },
  advanced: {
    id: 'advanced',
    label: 'Advanced',
    features: {
      hintMode: false,
      teacherMode: false,
      highlightMode: false,
      showFlagDiscovery: false,
      soundEnabled: true,
    },
  },
};

export const AQL_GRAPH_NAME = 'Mines';

export function getBoardArea(size) {
  return size * size;
}

export function getProtectedCellCount(size) {
  return size === BOARD_LIMITS.minSize
    ? FIRST_CLICK_PROTECTION.smallBoardProtectedCells
    : FIRST_CLICK_PROTECTION.defaultProtectedCells;
}

export function getMaxPlayableMines(size) {
  return Math.max(0, getBoardArea(size) - getProtectedCellCount(size));
}

export function sanitizeBoardSize(size) {
  if (!Number.isFinite(size)) return BOARD_LIMITS.defaultSize;
  return Math.max(BOARD_LIMITS.minSize, Math.min(BOARD_LIMITS.maxSize, Math.floor(size)));
}

export function sanitizeMineCount(size, mineCount) {
  const safeSize = sanitizeBoardSize(size);
  const maxMines = getMaxPlayableMines(safeSize);
  if (!Number.isFinite(mineCount)) return 0;
  return Math.max(0, Math.min(maxMines, Math.floor(mineCount)));
}

export function calculateMinesForSize(size) {
  return Math.max(1, Math.ceil(getBoardArea(size) * 0.15));
}

export function getBoardPreset(size) {
  const safeSize = sanitizeBoardSize(size);
  return BOARD_PRESETS.find((preset) => preset.size === safeSize) ?? {
    size: safeSize,
    mines: sanitizeMineCount(safeSize, calculateMinesForSize(safeSize)),
    label: `${safeSize} x ${safeSize}`,
  };
}

export function getDefaultFeatureState() {
  return Object.values(UI_FEATURES).reduce((acc, feature) => {
    acc[feature.id] = Boolean(feature.defaultEnabled);
    return acc;
  }, {});
}

export function applyModeProfile(profileId, currentFeatures = getDefaultFeatureState()) {
  const profile = MODE_PROFILES[profileId];
  if (!profile) return currentFeatures;
  return {
    ...currentFeatures,
    ...profile.features,
  };
}

export function validateGameConfig(overrides = {}) {
  const errors = [];

  const minSize = overrides?.boardLimits?.minSize ?? BOARD_LIMITS.minSize;
  const maxSize = overrides?.boardLimits?.maxSize ?? BOARD_LIMITS.maxSize;

  if (!Number.isInteger(minSize) || !Number.isInteger(maxSize) || minSize < 2 || maxSize < minSize) {
    errors.push('Invalid board limits: minSize/maxSize.');
  }

  const presets = overrides?.presets ?? BOARD_PRESETS;
  for (const preset of presets) {
    if (!preset || !Number.isInteger(preset.size) || !Number.isInteger(preset.mines)) {
      errors.push('Invalid preset shape.');
      continue;
    }

    if (preset.mines > getMaxPlayableMines(preset.size)) {
      errors.push(`Preset ${preset.size} has too many mines.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
