# AQL Gym - Pedagogical Minesweeper

Interactive Minesweeper game with AI solver guidance for learning optimal strategies.

**Live:** https://aymanaboghonim.github.io/aql_gym/

## Features

- **Interactive Gameplay**: 3×3 to 20×20 boards with adjustable difficulty
- **AI Solver**: Teacher mode shows optimal moves step-by-step
- **Smart Hints**: Get next recommended move
- **Accessibility**: 
  - Highlight mode, sound feedback, flag counter, flag confirmation
  - Dark/light theme toggle
  - Responsive desktop/tablet layout

## Quick Start

```bash
npm install
npm run dev        # Dev server: http://localhost:5176/mine_sweeper/
npm run build      # Production build
npm run preview    # Preview production
```

## Project Structure

```
src/
├── chapters/minesweeper/
│   ├── components/        # Board, Cell, Solver UI
│   ├── hooks/            # useMinesweeper game engine
│   └── constants/        # Board config
├── App.jsx              # Main app with routing
└── main.jsx             # Entry point
```

## How to Play

**Left Panel (Toggles):**
- Highlight, Teacher, Hint, Sound, Flag Counter, Flag Feedback

**Right Panel (Setup):**
- Board Size (3-20), Mine Count
- Game status and metrics

## Tech Stack

- React 18.3
- Vite 6.4
- Tailwind CSS 3.4
- GitHub Pages (auto-deploy)

## License

MIT
