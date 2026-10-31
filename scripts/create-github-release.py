#!/usr/bin/env python3
import os
import sys
import json
import urllib.request
import urllib.error

TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO = "ntgalaxy1/karbamaa"
VERSION = "v10.0.0.12"
TAG_NAME = "v10.0.0.12"
RELEASE_NAME = "کارباما نسخه رسمی و نهایی v10.0.0.12"
APK_FILE = "public/karbama-v10.0.0.12.apk"

def main():
    if not TOKEN:
        print("Notice: GITHUB_TOKEN environment variable not set. Skipping automated release upload.")
        return

    print(f"Creating GitHub Release {TAG_NAME} as draft on {REPO}...")

    # 1. Create Draft Release
    url = f"https://api.github.com/repos/{REPO}/releases"
    headers = {
        "Authorization": f"token {TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Karbama-Release-Script"
    }

    body = {
        "tag_name": TAG_NAME,
        "target_commitish": "main",
        "name": RELEASE_NAME,
        "body": f"""دانلود مستقیم و رسمی بسته نصبی اپلیکیشن کاریابی و اقامت کارباما ({TAG_NAME}).

- نسخه: `{VERSION}`
- نام بسته (Package): `app.karbama.twa`
- استعلام قیمت زنده ارز NetArz و لیر ترکیه
- توسعه‌دهنده: ناصر توکلی (@Ntgalaxy)""",
        "draft": True,
        "prerelease": False
    }

    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")

    upload_url = None
    release_id = None
    with urllib.request.urlopen(req) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        upload_url = res_data.get("upload_url", "").split("{")[0]
        release_id = res_data.get("id")
        print(f"✅ Draft release created! ID: {release_id}")

    # 2. Upload APK Asset while still a draft
    if os.path.exists(APK_FILE) and upload_url:
        asset_name = os.path.basename(APK_FILE)
        upload_endpoint = f"{upload_url}?name={asset_name}"
        print(f"Uploading APK asset {asset_name} ({os.path.getsize(APK_FILE) / (1024*1024):.2f} MB)...")

        with open(APK_FILE, "rb") as f:
            apk_bytes = f.read()

        upload_headers = {
            "Authorization": f"token {TOKEN}",
            "Content-Type": "application/vnd.android.package-archive",
            "Content-Length": str(len(apk_bytes)),
            "User-Agent": "Karbama-Release-Script"
        }

        up_req = urllib.request.Request(upload_endpoint, data=apk_bytes, headers=upload_headers, method="POST")
        with urllib.request.urlopen(up_req) as up_res:
            asset_data = json.loads(up_res.read().decode("utf-8"))
            download_url = asset_data.get("browser_download_url")
            print(f"🎉 Asset uploaded successfully! Direct download URL: {download_url}")

    # 3. Publish the release (draft: False)
    if release_id:
        publish_url = f"https://api.github.com/repos/{REPO}/releases/{release_id}"
        publish_body = {"draft": False}
        pub_req = urllib.request.Request(publish_url, data=json.dumps(publish_body).encode("utf-8"), headers=headers, method="PATCH")
        with urllib.request.urlopen(pub_req) as pub_res:
            pub_data = json.loads(pub_res.read().decode("utf-8"))
            print(f"🚀 Release officially published on GitHub: {pub_data.get('html_url')}")

if __name__ == "__main__":
    main()
