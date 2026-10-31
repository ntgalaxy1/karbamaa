#!/usr/bin/env python3
import os
import sys
import json
import urllib.request
import urllib.error

TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO = "ntgalaxy1/karbamaa"
VERSION = "v10.0.0.11"
TAG_NAME = "v10.0.0.11"
RELEASE_NAME = "کارباما نسخه رسمی و نهایی v10.0.0.11"
APK_FILE = "public/karbama-v10.0.0.11.apk"

def main():
    if not TOKEN:
        print("Notice: GITHUB_TOKEN environment variable not set. Skipping automated release upload.")
        return

    print(f"Creating GitHub Release {TAG_NAME} on {REPO}...")

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
        "draft": False,
        "prerelease": False
    }

    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")

    upload_url = None
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            upload_url = res_data.get("upload_url", "").split("{")[0]
            html_url = res_data.get("html_url")
            print(f"✅ Release created successfully! URL: {html_url}")
    except urllib.error.HTTPError as e:
        # If release exists, retrieve it
        get_req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases/tags/{TAG_NAME}", headers=headers)
        try:
            with urllib.request.urlopen(get_req) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                upload_url = res_data.get("upload_url", "").split("{")[0]
                html_url = res_data.get("html_url")
                print(f"Found existing release: {html_url}")
        except Exception:
            pass

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
        try:
            with urllib.request.urlopen(up_req) as up_res:
                asset_data = json.loads(up_res.read().decode("utf-8"))
                download_url = asset_data.get("browser_download_url")
                print(f"🎉 Asset uploaded successfully! Direct download URL: {download_url}")
        except Exception as e:
            print(f"Asset upload notice: {e}")

if __name__ == "__main__":
    main()
