# AQL Gym Architecture

## Goal

Host multiple learning activities in one deployable site, with each activity implemented as an isolated chapter module.

## Layered Chapter Model

Each active chapter is organized into layers:

1. **Config layer** (`config/*`)
   - Board limits, presets, first-click protection, feature toggles, mode profiles.
   - Validation for invalid combinations (for example, mine counts exceeding playable cells).
2. **Engine layer** (`engine/*`)
   - Pure domain logic for board generation, reveal/flag rules, win/loss checks, and deterministic solving support.
3. **Orchestration layer** (`hooks/*`)
   - React hook state and UI-facing actions using pure engine functions.
4. **Persistence layer** (`persistence/*`)
   - Versioned local settings for board setup and mode preferences.
5. **Presentation layer** (`components/*`)
   - Composable UI modules for controls, metrics, board shell, fullscreen, and results.

## Chapter Registry Contract

`src/chapters/index.jsx` registers each chapter with structured metadata:

- `id`: unique chapter identifier
- `title`: display title
- `route`: URL path
- `status`: `active` or `planned`
- `description`: short summary
- `component`: route component
- `configSchema`: persisted/configurable field contract
- `defaultConfig`: default chapter settings
- `capabilities`: feature flags (guide/fullscreen/customization, etc.)
- `training`: optional training/guide metadata

## Current chapter

- `src/chapters/minesweeper/`
  - `chapterConfig.js`
  - `config/gameConfig.js`
  - `engine/gameEngine.js`
  - `hooks/useMinesweeper.js`
  - `persistence/settingsStorage.js`
  - `components/*`

## Adding Chapter 2+

1. Create `src/chapters/<new-chapter>/` with layered modules.
2. Add `<new-chapter>/chapterConfig.js` exporting metadata + schema/default config.
3. Register the chapter object in `src/chapters/index.jsx`.
4. Ensure home cards and routes derive from registry metadata only.
5. Validate with:
   - `npm run build`
   - `npm run test`

## Why This Shape

- Keeps chapter code isolated and maintainable.
- Enables game-level flexibility through centralized config.
- Improves reuse by separating domain logic from UI state.
- Scales chapter onboarding through a consistent registry contract.
