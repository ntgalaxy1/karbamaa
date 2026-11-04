#!/usr/bin/env python3
import os
import sys
import json
import urllib.request
import urllib.error

TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO = os.environ.get("GITHUB_REPOSITORY", "ntgalaxy1/karbamaa")

def get_version():
    try:
        with open("package.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("version", "10.0.0.19")
    except Exception:
        return "10.0.0.19"

VERSION = get_version()
TAG_NAME = f"v{VERSION}"
RELEASE_NAME = f"کارباما نسخه رسمی و نهایی {TAG_NAME}"
APK_FILE = f"public/karbama-v{VERSION}.apk"
AAB_FILE = f"public/karbama-v{VERSION}.aab"
ZIP_FILE = "public/karbama-cafebazaar-package.zip"

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
- امضای معتبر V1 و V2 جهت نصب مستقیم و کافه‌بازار
- توسعه‌دهنده: ناصر توکلی (@Ntgalaxy)""",
        "draft": True,
        "prerelease": False
    }

    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")

    upload_url = None
    release_id = None
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            upload_url = res_data.get("upload_url", "").split("{")[0]
            release_id = res_data.get("id")
            print(f"✅ Draft release created! ID: {release_id}")
    except urllib.error.HTTPError as e:
        print(f"Release creation notice: {e}")
        # Fetch existing release if already exists
        check_url = f"https://api.github.com/repos/{REPO}/releases/tags/{TAG_NAME}"
        chk_req = urllib.request.Request(check_url, headers=headers)
        try:
            with urllib.request.urlopen(chk_req) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                upload_url = res_data.get("upload_url", "").split("{")[0]
                release_id = res_data.get("id")
        except Exception:
            pass

    # 2. Upload Assets
    for file_path, content_type in [
        (APK_FILE, "application/vnd.android.package-archive"),
        ("karbama-latest.apk", "application/vnd.android.package-archive"),
        (AAB_FILE, "application/octet-stream"),
        (ZIP_FILE, "application/zip"),
    ]:
        if os.path.exists(file_path) and upload_url:
            asset_name = os.path.basename(file_path)
            upload_endpoint = f"{upload_url}?name={asset_name}"
            print(f"Uploading asset {asset_name} ({os.path.getsize(file_path) / (1024*1024):.2f} MB)...")

            with open(file_path, "rb") as f:
                file_bytes = f.read()

            upload_headers = {
                "Authorization": f"token {TOKEN}",
                "Content-Type": content_type,
                "Content-Length": str(len(file_bytes)),
                "User-Agent": "Karbama-Release-Script"
            }

            try:
                up_req = urllib.request.Request(upload_endpoint, data=file_bytes, headers=upload_headers, method="POST")
                with urllib.request.urlopen(up_req) as up_res:
                    asset_data = json.loads(up_res.read().decode("utf-8"))
                    print(f"🎉 Asset uploaded: {asset_data.get('browser_download_url')}")
            except Exception as up_err:
                print(f"Asset upload warning for {asset_name}: {up_err}")

    # 3. Publish the release (draft: False)
    if release_id:
        publish_url = f"https://api.github.com/repos/{REPO}/releases/{release_id}"
        publish_body = {"draft": False}
        pub_req = urllib.request.Request(publish_url, data=json.dumps(publish_body).encode("utf-8"), headers=headers, method="PATCH")
        try:
            with urllib.request.urlopen(pub_req) as pub_res:
                pub_data = json.loads(pub_res.read().decode("utf-8"))
                print(f"🚀 Release officially published on GitHub: {pub_data.get('html_url')}")
        except Exception as e:
            print(f"Notice during publish: {e}")

if __name__ == "__main__":
    main()
