# AQL Gym - Pedagogical Minesweeper

Interactive Minesweeper game with AI solver guidance for learning optimal strategies.

**Live:** https://aymanaboghonim.github.io/aql_gym/

## Features

- **Interactive Gameplay**: 3×3 to 20×20 boards with adjustable difficulty
- **Config-driven Modes**: capability toggles and mode profiles (Beginner / Coach / Advanced)
- **AI Solver**: teacher mode and hint support from deterministic safe-cell logic
- **Persistence**: board setup and mode preferences are saved locally with schema versioning
- **Accessibility**:
  - Highlight mode, sound feedback, flag counter, flag confirmation
  - Dark/light and color-vision themes
  - Responsive desktop/tablet layout

## Quick Start

```bash
npm install
npm run dev        # Dev server
npm run build      # Production build
npm run test       # Unit + integration-style tests (node:test)
npm run preview    # Preview production
```

## Project Structure

```
src/
├── chapters/minesweeper/
│   ├── config/              # Game config, features, profiles, validation
│   ├── engine/              # Pure game domain logic
│   ├── hooks/               # UI orchestration hook
│   ├── persistence/         # Local settings storage + versioning
│   ├── components/          # Board, Cell, Guide, modular UI panels
│   └── chapterConfig.js     # Chapter metadata, config schema/defaults
├── chapters/index.jsx       # Chapter registry contract
├── App.jsx                  # Route shell
└── main.jsx                 # Entry point
```

## Flexibility model

Minesweeper behavior is now centralized in configuration:

- Board limits and presets
- First-click protection constraints
- UI feature capability map
- Mode profiles for quickly applying feature sets
- Config validation to reject invalid combinations

## License

MIT
