#!/bin/bash
set -e

VERSION="10.0.0.1"
TAG="v${VERSION}"
APK_PATH="public/karbama-v${VERSION}.apk"

echo "=========================================================="
echo "  🚀 Karbama Android APK v${VERSION} GitHub Release Script"
echo "=========================================================="

# 1. Ensure latest APK is built
python3 scripts/generate-apk.py

# 2. Stage and commit latest files
git add -A
git commit -m "Release Karbama Android APK v${VERSION}" || echo "No new changes to commit"

# 3. Create or update tag
git tag -d "${TAG}" 2>/dev/null || true
git tag -a "${TAG}" -m "Karbama Android Release ${TAG}"
echo "✓ Git tag ${TAG} created."

# 4. Push if remote exists
REMOTE=$(git remote | head -n 1)
if [ -n "$REMOTE" ]; then
    echo "Pushing code and tag ${TAG} to remote '${REMOTE}'..."
    git push "$REMOTE" main || git push "$REMOTE" master || true
    git push "$REMOTE" "${TAG}" --force || true
    
    # If GitHub CLI is installed, create GitHub Release directly
    if command -v gh &> /dev/null; then
        echo "Creating GitHub Release with APK attachment..."
        gh release create "${TAG}" "${APK_PATH}" \
            --title "کارباما نسخه اندروید ${TAG}" \
            --notes "دانلود مستقیم بسته نصبی اندروید نسخه ${VERSION} کارباما (شروع از ورژن ۱۰.۰.۰.۱)" || true
        echo "✓ GitHub release created successfully!"
    fi
else
    echo "ℹ️ No git remote configured yet. Add your GitHub repository via:"
    echo "    git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git"
    echo "    git push -u origin main --tags"
fi

echo "=========================================================="
echo "  ✅ Done! APK file ready at: ${APK_PATH}"
echo "=========================================================="
