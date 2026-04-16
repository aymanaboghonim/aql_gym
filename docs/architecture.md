# AQL Gym Architecture

## Goal

Host multiple learning activities in one deployable site, with each activity implemented as an isolated chapter module.

## Module Boundaries

- `src/App.jsx`
  - Route shell and chapter composition.
- `src/chapters/index.js`
  - Chapter metadata registry.
- `src/chapters/<chapter-id>/`
  - Chapter-local implementation.

Current chapter:

- `src/chapters/minesweeper/`
  - `MinesweeperChapter.jsx`
  - `components/*`
  - `hooks/*`
  - `constants/*`

## Chapter Contract

Each chapter in `src/chapters/index.js` defines:

- `id`: unique chapter identifier
- `title`: display title
- `route`: URL path
- `status`: `active` or `planned`
- `description`: short chapter summary
- `component`: route component

## Adding Chapter 2+

1. Create `src/chapters/<new-chapter>/` module.
2. Export chapter entry from `src/chapters/<new-chapter>/index.js`.
3. Register metadata in `src/chapters/index.js`.
4. Add route-safe UI card text/description.
5. Verify with `npm run build`.

## Why This Shape

- Keeps chapter code isolated and maintainable.
- Allows placeholders while shipping one active chapter.
- Avoids large monolithic growth in the app shell.
