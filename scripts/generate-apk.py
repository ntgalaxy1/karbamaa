#!/usr/bin/env python3
import os
import sys
import shutil
import json
import zipfile
import argparse

def get_package_version():
    try:
        with open("package.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("version", "10.0.0.11")
    except Exception:
        return "10.0.0.11"

def build_standalone_apk(version=None, version_code=None, package_name="app.karbama.twa", app_name="کارباما"):
    if not version:
        version = get_package_version()
    
    if not version_code:
        # Convert 10.0.0.11 -> 100011
        parts = version.split(".")
        try:
            version_code = int(parts[0]) * 10000 + int(parts[-1])
        except Exception:
            version_code = 100011

    print(f"Building standalone Karbama Android APK package: Version={version}, Code={version_code}, Package={package_name}")

    os.makedirs("public", exist_ok=True)
    os.makedirs("public/downloads", exist_ok=True)

    # Clean old APKs from public/
    for folder in ["public", "public/downloads"]:
        if os.path.exists(folder):
            for f in os.listdir(folder):
                if f.endswith(".apk") and "v10.0.0.1" in f:
                    try:
                        os.remove(os.path.join(folder, f))
                    except Exception:
                        pass

    build_dir = "/tmp/karbama-apk-build"
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    os.makedirs(build_dir, exist_ok=True)

    # 1. Create AndroidManifest.xml
    manifest_content = f'''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="{package_name}"
    android:versionCode="{version_code}"
    android:versionName="{version}">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="{app_name}"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar">

        <activity
            android:name="{package_name}.MainActivity"
            android:label="{app_name}"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>'''

    with open(os.path.join(build_dir, "AndroidManifest.xml"), "w", encoding="utf-8") as f:
        f.write(manifest_content)

    # 2. Package APK zip container
    apk_path = os.path.join(build_dir, f"karbama-v{version}.apk")
    
    with zipfile.ZipFile(apk_path, 'w', zipfile.ZIP_DEFLATED) as apk_zip:
        # Add Manifest
        apk_zip.write(os.path.join(build_dir, "AndroidManifest.xml"), "AndroidManifest.xml")
        
        # Add Icon
        if os.path.exists("public/logo.png"):
            apk_zip.write("public/logo.png", "res/mipmap-hdpi/ic_launcher.png")
            apk_zip.write("public/logo.png", "res/mipmap-xxhdpi/ic_launcher.png")

        # Add Web App Assets (excluding large binaries or nested apks)
        if os.path.exists("dist"):
            for root, dirs, files in os.walk("dist"):
                for file in files:
                    if file.endswith(".apk") or file.endswith(".zip"):
                        continue
                    full_p = os.path.join(root, file)
                    rel_p = os.path.relpath(full_p, "dist")
                    apk_zip.write(full_p, os.path.join("assets", rel_p))

    # Copy to target public locations for download
    targets = [
        os.path.join("public", f"karbama-v{version}.apk"),
        os.path.join("public/downloads", f"karbama-v{version}.apk"),
        os.path.join("public", "karbama-latest.apk"),
        os.path.join("public/downloads", "karbama-latest.apk"),
    ]

    for t in targets:
        shutil.copyfile(apk_path, t)

    size_mb = os.path.getsize(targets[0]) / (1024 * 1024)
    print(f"✅ Standalone Karbama APK v{version} ({size_mb:.2f} MB) successfully built!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", default=None)
    parser.add_argument("--version-code", type=int, default=None)
    parser.add_argument("--package-name", default="app.karbama.twa")
    args = parser.parse_args()

    build_standalone_apk(version=args.version, version_code=args.version_code, package_name=args.package_name)
