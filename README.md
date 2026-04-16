# AQL Gym - Pedagogical Algorithm Quest Playground

AQL Gym is a front-end-only chapter-based learning playground featuring interactive algorithm implementations with AI guidance. This repository currently ships **Chapter 1: Minesweeper**, a pedagogical implementation with step-by-step solver guidance.

## 🎮 Features

### Minesweeper Chapter
- **Interactive Gameplay**: 3×3 to 20×20 boards with adjustable difficulty
- **AI Solver Guidance**: Teacher mode with step-by-step optimal move suggestions
- **Smart Hints**: Get the next recommended move based on constraint solving
- **Accessibility Options**:
  - Highlight mode for first-click protection visualization
  - Sound feedback for interactions
  - Flag counter display
  - Flag feedback system
- **Dark/Light Theme**: Modern slate and glass-morphic design
- **Responsive Layout**: Optimized for desktop and tablet

## 🚀 Live Structure

- **Home**: `/aql_gym/`
- **Chapter 1 (Minesweeper)**: `/aql_gym/chapters/minesweeper`
- **Planned Chapters**:
  - Pathfinding algorithms
  - Sorting visualizers
  - Dynamic programming problems

## 📦 Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5176/mine_sweeper/)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture (Chapter Model)

- **App shell + routing**: `src/App.jsx` - Main entry point with theme context
- **Chapter registry**: `src/chapters/index.jsx` - Metadata-driven chapter loader
- **Minesweeper module**: `src/chapters/minesweeper/**`
  - `components/` - Board, Cell, SolverGuidePage
  - `hooks/useMinesweeper.js` - Game engine and AI logic
  - `constants/board.js` - Board configuration
  - `index.js` - Chapter export

**Chapter Extension Model**: New chapters are registered through metadata (`id`, `title`, `route`, `status`, `component`) without modifying the shell.

## ⚙️ Minesweeper Controls

### Left Sidebar (Toggle Switches)
- **Highlight**: Show first-click safe zone
- **Teacher**: Auto-play with optimal moves
- **Hint**: Suggest next move
- **Sound**: Audio feedback
- **Flag Counter**: Show mine count
- **Flag Feedback**: Confirm flags

### Right Sidebar (Setup + Info)
- **Board Size**: 3-20 grid
- **Mine Count**: 0 to (boardSize² - safe zone)
- **Game Status**: Win/Loss/Playing
- **Metrics**: Flags placed, cells revealed

## 🤖 AI Solver Algorithm

Implements constraint-solving for Minesweeper:
- **First-click protection**: Safe opening guaranteed
- **Pattern recognition**: Identifies deterministic cells
- **Constraint propagation**: Deduces hidden mines
- **Strategic flagging**: Marks definite mines

## 🚀 Deployment (GitHub Pages + CI/CD)

**Modern GitHub Actions workflow** (no legacy branch publishing):

```yaml
# Workflow file: .github/workflows/deploy-pages.yml
- Build on push to main
- Upload artifacts: upload-pages-artifact@v4
- Deploy: deploy-pages@v4
- Automatic VITE_BASE_PATH configuration
```

**Live Site**: https://aymanaboghonim.github.io/aql_gym/

Setup guide: See `docs/deployment-github-pages.md`

## 🔧 Tech Stack

- **React 18.3** - Component-based UI
- **Vite 6.4** - Ultra-fast build tool & dev server
- **Tailwind CSS 3.4** - Utility-first styling
- **React Router 6.30** - Client-side routing
- **PostCSS** - CSS processing & autoprefixing

## 📊 Build Performance

| Metric | Value |
|--------|-------|
| Bundle (JS) | ~221 KB |
| Gzip (JS) | ~68 KB |
| Bundle (CSS) | ~37 KB |
| Gzip (CSS) | ~7 KB |
| Build Time | ~5s |

## 📝 License

MIT

## 👨‍💻 Author

Ayman Aboghonim

---

**Status**: 🟢 In Development | ✅ Production Ready | 🔄 CI/CD Active (GitHub Pages)

- Chapter 1 (Minesweeper) is integrated as the first AQL Gym chapter.
- Additional chapters are intentionally placeholders for upcoming milestones.
