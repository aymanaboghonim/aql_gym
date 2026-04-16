#!/bin/bash

# GitHub Pages Deployment Script for Minesweeper
# Usage: ./deploy.sh YOUR_GITHUB_USERNAME

if [ -z "$1" ]; then
  echo "❌ Usage: ./deploy.sh YOUR_GITHUB_USERNAME"
  echo ""
  echo "Example:"
  echo "  ./deploy.sh aymanaboghonim"
  echo ""
  exit 1
fi

GITHUB_USER="$1"
REPO_NAME="mine_sweeper"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "🚀 Setting up GitHub Pages deployment..."
echo "📍 Repository: $REPO_URL"
echo ""

# Check if remote already exists
if git remote | grep -q origin; then
  echo "⚠️  Remote 'origin' already exists. Removing..."
  git remote remove origin
fi

# Add remote
echo "➕ Adding remote origin..."
git remote add origin "$REPO_URL"

# Ensure on main branch
echo "🔀 Switching to main branch..."
git branch -M main

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Push successful!"
  echo ""
  echo "📋 Next steps:"
  echo "  1. Check GitHub Actions: https://github.com/${GITHUB_USER}/${REPO_NAME}/actions"
  echo "  2. Enable Pages if needed: https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/pages"
  echo "  3. Your site will be live at: https://${GITHUB_USER}.github.io/${REPO_NAME}/"
  echo ""
else
  echo "❌ Push failed. Please check your credentials and try again."
  exit 1
fi
