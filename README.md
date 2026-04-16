# AQL Gym

AQL Gym is a front-end-only chapter-based learning playground. This repository currently ships **Chapter 1: Minesweeper**, with placeholders for upcoming activities.

## Live Structure

- Home: `/`
- Chapter 1: `/chapters/minesweeper`
- Planned placeholders:
  - `/chapters/pathfinding`
  - `/chapters/sorting`

## Local Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Architecture (Chapter Model)

- App shell + chapter routing: `src/App.jsx`
- Chapter registry: `src/chapters/index.js`
- Minesweeper chapter module: `src/chapters/minesweeper/**`

Chapter modules are registered through metadata (`id`, `title`, `route`, `status`, `component`) and can be added without rewriting the shell.

## GitHub Pages (Modern Actions Flow)

This repository uses **GitHub Pages via GitHub Actions**, not legacy branch publishing.

Workflow: `.github/workflows/deploy-pages.yml`

Deployment chain:

1. `actions/configure-pages@v5`
2. `actions/upload-pages-artifact@v4`
3. `actions/deploy-pages@v4`

See `docs/deployment-github-pages.md` for setup and verification.

## Current Scope

- Chapter 1 (Minesweeper) is integrated as the first AQL Gym chapter.
- Additional chapters are intentionally placeholders for upcoming milestones.
