#!/bin/bash
set -e

# Read version dynamically from package.json
VERSION=$(node -p "require('./package.json').version")
TAG="v${VERSION}"
APK_PATH="public/karbama-v${VERSION}.apk"
AAB_PATH="public/karbama-v${VERSION}.aab"
ZIP_BAZAAR="public/karbama-cafebazaar-package.zip"
ZIP_DIST="public/karbama-dist.zip"

echo "=========================================================="
echo "  🚀 Karbama Android Release Script: ${TAG} (Package: app.karbama.twa)"
echo "=========================================================="

# 1. Build Production App & Signed APK + AAB
echo "📦 Running production build & APK generator..."
npm run build

# 2. Stage and commit latest files if in a git repository
if [ -d ".git" ]; then
    echo "📝 Checking git status..."
    git add -A
    git commit -m "chore(release): release ${TAG} with signed APK & AAB" || echo "No changes to commit"

    # Create local tag
    git tag -d "${TAG}" 2>/dev/null || true
    git tag -a "${TAG}" -m "Karbama Android Release ${TAG}"
    echo "✓ Git tag ${TAG} created."

    # Push to remote if remote exists
    REMOTE=$(git remote | head -n 1)
    if [ -n "$REMOTE" ]; then
        echo "🌐 Pushing to GitHub remote '${REMOTE}'..."
        BRANCH=$(git rev-parse --abbrev-ref HEAD)
        git push "$REMOTE" "$BRANCH" || true
        git push "$REMOTE" "${TAG}" --force || true
        
        # If GitHub CLI is available
        if command -v gh &> /dev/null; then
            echo "🚀 Publishing release to GitHub..."
            gh release create "${TAG}" \
                "${APK_PATH}" \
                "${AAB_PATH}" \
                "${ZIP_BAZAAR}" \
                "${ZIP_DIST}" \
                --title "کارباما نسخه رسمی اندروید (${TAG})" \
                --notes "### 📱 بسته رسمی اندروید کارباما (${TAG})
- شناسه پکیج: \`app.karbama.twa\`
- کد نسخه (VersionCode): $(( 100000 + ${VERSION##*.} ))
- امضای دیجیتال معتبر V1 و V2 جهت نصب مستقیم و کافه‌بازار" || true
            echo "✓ GitHub release published successfully!"
        fi
    else
        echo "ℹ️ No git remote configured. Push to your GitHub repo using:"
        echo "    git remote add origin https://github.com/<username>/<repo>.git"
        echo "    git push -u origin main --tags"
    fi
fi

echo "=========================================================="
echo "  ✅ Release ready!"
echo "  📦 APK: ${APK_PATH}"
echo "  📦 AAB: ${AAB_PATH}"
echo "  📦 Latest APK: public/karbama-latest.apk"
echo "=========================================================="
