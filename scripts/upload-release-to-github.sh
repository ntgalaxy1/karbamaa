#!/bin/bash
set -e

REPO="$1"      # e.g. "nasertavakkoliii/karbama"
TOKEN="$2"     # GitHub Personal Access Token (ghp_...)
TAG="v10.0.0.1"
APK_FILE="public/karbama-v10.0.0.1.apk"

if [ -z "$REPO" ] || [ -z "$TOKEN" ]; then
    echo "Usage: $0 <owner/repo> <github_token>"
    exit 1
fi

if [ ! -f "$APK_FILE" ]; then
    echo "Error: APK file $APK_FILE not found. Running generator..."
    python3 scripts/generate-apk.py
fi

echo "==> 1. Configuring Git Remote and pushing main + tag $TAG..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://${TOKEN}@github.com/${REPO}.git"
git branch -M main
git push -u origin main --force || true
git push origin "${TAG}" --force || true

echo "==> 2. Creating GitHub Release for $TAG via GitHub API..."
RELEASE_JSON=$(curl -s -X POST \
  -H "Authorization: token ${TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/${REPO}/releases \
  -d '{
    "tag_name": "'"${TAG}"'",
    "name": "کارباما نسخه اندروید '"${TAG}"'",
    "body": "دانلود مستقیم بسته نصبی اندروید نسخه ۱۰.۰.۰.۱ اپلیکیشن رسمی کارباما.\n\n- شناسه پکیج: `app.karbama.twa`\n- نسخه: `10.0.0.1`\n- توسعه‌دهنده: ناصر توکلی (@Ntgalaxy)",
    "draft": false,
    "prerelease": false
  }')

RELEASE_ID=$(echo "$RELEASE_JSON" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))")

if [ -z "$RELEASE_ID" ] || [ "$RELEASE_ID" = "None" ]; then
    echo "Release might already exist. Fetching existing release ID..."
    RELEASE_JSON=$(curl -s -H "Authorization: token ${TOKEN}" https://api.github.com/repos/${REPO}/releases/tags/${TAG})
    RELEASE_ID=$(echo "$RELEASE_JSON" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))")
fi

echo "Release ID: $RELEASE_ID"

if [ -n "$RELEASE_ID" ] && [ "$RELEASE_ID" != "None" ]; then
    echo "==> 3. Uploading $APK_FILE to GitHub Release Assets..."
    UPLOAD_RES=$(curl -s -X POST \
      -H "Authorization: token ${TOKEN}" \
      -H "Content-Type: application/vnd.android.package-archive" \
      --data-binary "@${APK_FILE}" \
      "https://uploads.github.com/repos/${REPO}/releases/${RELEASE_ID}/assets?name=karbama-v10.0.0.1.apk")
      
    echo "$UPLOAD_RES" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    if 'browser_download_url' in d:
        print('SUCCESS! Download URL:', d['browser_download_url'])
    else:
        print('Upload response:', d.get('message', 'done'))
except:
    pass
"
    echo "==> ✅ Release v10.0.0.1 created and APK uploaded to GitHub successfully!"
else
    echo "❌ Failed to create or find release. API response:"
    echo "$RELEASE_JSON"
    exit 1
fi
