#!/bin/bash

# AQL Gym GitHub Setup & Deploy Script
# This script authenticates with GitHub and creates/pushes to the remote repository

set -e

echo "🚀 AQL Gym - GitHub Setup & Deploy"
echo "===================================="
echo ""

# Repo configuration
REPO_NAME="${1:-aql_gym}"
REPO_DESC="Pedagogical Algorithm Quest: Interactive Minesweeper with AI Solver Guidance"

echo "📋 Configuration:"
echo "  Repo Name: $REPO_NAME"
echo "  GitHub User: aymanaboghonim"
echo ""

# Step 1: Authenticate with GitHub CLI
echo "🔐 Step 1: Authenticating with GitHub..."
if ! gh auth status > /dev/null 2>&1; then
  echo "  ℹ️  GitHub CLI not authenticated. Running: gh auth login"
  gh auth login --web --git-protocol https
else
  echo "  ✅ Already authenticated"
fi

echo ""

# Step 2: Check if repo exists, create if not
echo "🏗️  Step 2: Checking/Creating remote repository..."
if gh repo view "aymanaboghonim/$REPO_NAME" > /dev/null 2>&1; then
  echo "  ℹ️  Repository already exists: aymanaboghonim/$REPO_NAME"
else
  echo "  📝 Creating repository: aymanaboghonim/$REPO_NAME"
  gh repo create "$REPO_NAME" \
    --public \
    --source=. \
    --remote=origin \
    --push \
    --description "$REPO_DESC"
  echo "  ✅ Repository created and code pushed!"
  echo ""
  echo "  🎉 Your repo is live at:"
  echo "     https://github.com/aymanaboghonim/$REPO_NAME"
  echo ""
  exit 0
fi

# Step 3: Add remote if not exists
echo ""
echo "🔗 Step 3: Configuring git remote..."
if git remote get-url origin > /dev/null 2>&1; then
  echo "  ℹ️  Remote already configured"
  git remote -v
else
  echo "  ➕ Adding origin remote..."
  git remote add origin "https://github.com/aymanaboghonim/$REPO_NAME.git"
fi

# Step 4: Push to GitHub
echo ""
echo "📤 Step 4: Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Done! Your repository is set up and pushed."
echo ""
echo "📍 Next Steps:"
echo "  1. Enable GitHub Pages in repo settings (if not auto-enabled)"
echo "  2. Go to: https://github.com/aymanaboghonim/$REPO_NAME/settings/pages"
echo "  3. Select 'Deploy from a branch' or 'GitHub Actions' as source"
echo "  4. Watch Actions tab for auto-deployment"
echo ""
echo "🌐 Your site will be live at:"
echo "   https://aymanaboghonim.github.io/$REPO_NAME/"
echo ""
