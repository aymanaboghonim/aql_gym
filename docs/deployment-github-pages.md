# Deploying AQL Gym to GitHub Pages (Actions)

This repository uses the **modern GitHub Pages custom workflow** path.

## Official References

- Creating a GitHub Pages site:
  - https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- Using custom workflows with GitHub Pages:
  - https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Workflow in This Repo

- File: `.github/workflows/deploy-pages.yml`
- Trigger: `push` to `main` + manual dispatch
- Build output: `dist/`
- Deploy target environment: `github-pages`

Actions chain:

1. `actions/configure-pages@v5`
2. `actions/upload-pages-artifact@v4`
3. `actions/deploy-pages@v4`

Required permissions are configured:

- `pages: write`
- `id-token: write`
- `contents: read`

## Pages Settings

In repository settings:

1. Open **Settings -> Pages**
2. Ensure publishing source is **GitHub Actions**

## Base Path

Vite base path is environment-driven in `vite.config.js`:

- default: `/mine_sweeper/`
- workflow override: `/${{ github.event.repository.name }}/`

## Verify Deployment

1. Push to `main`
2. Check Actions run for `Deploy AQL Gym to GitHub Pages`
3. Confirm deploy job outputs `page_url`
4. Open published URL and verify:
   - `/` home loads
   - `/chapters/minesweeper` chapter route loads
