# GitHub Pages Deployment Setup

## ✅ Completed Locally

- ✅ Git repository initialized
- ✅ All project files committed (25 files)
- ✅ Modern GitHub Actions workflow configured (`.github/workflows/deploy-pages.yml`)
- ✅ Workflow uses latest artifacts method: `upload-pages-artifact@v4` + `deploy-pages@v4`

## 📝 Manual Steps Required (Run in Terminal)

### Step 1: Add GitHub Remote
Replace `YOUR_USERNAME` with your GitHub username and run:

```bash
cd /home/ayman/educative-cs/mine_sweeper
git remote add origin https://github.com/YOUR_USERNAME/mine_sweeper.git
git branch -M main
git push -u origin main
```

**Or if you prefer SSH:**
```bash
git remote add origin git@github.com:YOUR_USERNAME/mine_sweeper.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages (if not auto-enabled)
1. Go to: https://github.com/YOUR_USERNAME/mine_sweeper
2. Settings → Pages
3. **Source:** Select "Deploy from a branch" or "GitHub Actions"
4. Save

### Step 3: Verify Deployment
- GitHub Actions will automatically trigger on push
- Workflow: `.github/workflows/deploy-pages.yml`
- Check: **Actions** tab in your repo to watch the build
- Live URL: `https://YOUR_USERNAME.github.io/mine_sweeper/`

## 🔧 Workflow Details

**Trigger:** Push to `main` branch or manual `workflow_dispatch`  
**Build:** Node 20, npm ci, `npm run build`  
**Artifact:** Modern `upload-pages-artifact@v4`  
**Deploy:** Modern `deploy-pages@v4` (no git push required)  

## 📦 Environment Variables

The workflow automatically sets:
- `VITE_BASE_PATH=/mine_sweeper/` (from repo name)

This ensures all assets load correctly on GitHub Pages.

---

**Status:** Everything is committed and ready to push! Just provide your username or repo URL to proceed.
