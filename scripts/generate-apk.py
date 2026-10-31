#!/usr/bin/env python3
import os
import sys
import shutil
import subprocess
import argparse
import zipfile

def build_standalone_apk(version="10.0.0.8", version_code=100008, package_name="app.karbama.twa", app_name="کارباما"):
    print(f"Building standalone Karbama Android APK package: Version={version}, Code={version_code}, Package={package_name}")

    os.makedirs("public", exist_ok=True)
    os.makedirs("public/downloads", exist_ok=True)

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

        # Add Web App Assets
        if os.path.exists("dist"):
            for root, dirs, files in os.walk("dist"):
                for file in files:
                    full_p = os.path.join(root, file)
                    rel_p = os.path.relpath(full_p, "dist")
                    apk_zip.write(full_p, os.path.join("assets", rel_p))

    # Copy to public locations
    targets = [
        os.path.join("public", f"karbama-v{version}.apk"),
        os.path.join("public/downloads", f"karbama-v{version}.apk"),
        os.path.join("public", "karbama-v10.0.0.1.apk"),
        os.path.join("public/downloads", "karbama-v10.0.0.1.apk"),
        os.path.join("public", "karbama-v10.0.0.8.apk"),
        os.path.join("public/downloads", "karbama-v10.0.0.8.apk"),
    ]

    for t in targets:
        shutil.copyfile(apk_path, t)

    # Create dist.zip
    dist_zip_path = os.path.join("public", "dist.zip")
    with zipfile.ZipFile(dist_zip_path, 'w', zipfile.ZIP_DEFLATED) as dzip:
        if os.path.exists("dist"):
            for root, dirs, files in os.walk("dist"):
                for file in files:
                    full_p = os.path.join(root, file)
                    rel_p = os.path.relpath(full_p, "dist")
                    dzip.write(full_p, rel_p)

    size_mb = os.path.getsize(targets[0]) / (1024 * 1024)
    print(f"✅ Standalone Karbama APK ({size_mb:.2f} MB) successfully built in public directory!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", default="10.0.0.8")
    parser.add_argument("--version-code", type=int, default=100008)
    parser.add_argument("--package-name", default="app.karbama.twa")
    args = parser.parse_args()

    build_standalone_apk(version=args.version, version_code=args.version_code, package_name=args.package_name)
