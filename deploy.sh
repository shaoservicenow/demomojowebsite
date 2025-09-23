#!/bin/bash

# DemoMojo Website Deployment Script
# This script updates the gh-pages branch with changes from main

echo "🚀 Deploying DemoMojo website to GitHub Pages..."

# Switch to gh-pages branch
git checkout gh-pages

# Merge changes from main branch
git merge main

# Push to GitHub Pages
git push origin gh-pages

# Switch back to main branch
git checkout main

echo "✅ Deployment complete!"
echo "🌐 Your site will be live at: https://shaoservicenow.github.io/demomojowebsite/"
echo ""
echo "📝 To deploy future changes:"
echo "   1. Make changes on main branch"
echo "   2. Run: ./deploy.sh"
echo "   3. Or manually: git checkout gh-pages && git merge main && git push origin gh-pages && git checkout main"
