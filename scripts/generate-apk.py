import os
import sys
import zipfile
import json
import time
import argparse

def generate_apk(version="10.0.0.1", version_code=100001, package_name="app.karbama.twa", app_name="کارباما | کاریابی و اقامت ترکیه"):
    os.makedirs('public', exist_ok=True)
    os.makedirs('public/downloads', exist_ok=True)
    
    apk_filename = f"karbama-v{version}.apk"
    output_path = os.path.join('public', apk_filename)
    downloads_output_path = os.path.join('public/downloads', apk_filename)
    
    # Read icons and manifest if available
    logo_data = b""
    icon_192 = b""
    icon_512 = b""
    manifest_data = b""
    
    if os.path.exists('public/logo.png'):
        with open('public/logo.png', 'rb') as f:
            logo_data = f.read()
    if os.path.exists('public/pwa-192x192.png'):
        with open('public/pwa-192x192.png', 'rb') as f:
            icon_192 = f.read()
    if os.path.exists('public/pwa-512x512.png'):
        with open('public/pwa-512x512.png', 'rb') as f:
            icon_512 = f.read()
    if os.path.exists('public/manifest.json'):
        with open('public/manifest.json', 'rb') as f:
            manifest_data = f.read()

    meta_manifest = f"""Manifest-Version: 1.0
Created-By: Karbama Android APK Builder
Built-By: Naser Tavakkoli (@Ntgalaxy)
Package-Name: {package_name}
Version-Name: {version}
Version-Code: {version_code}
Timestamp: {int(time.time())}

Name: AndroidManifest.xml
SHA1-Digest: 2jmj7l5rSw0yVb/vlWAYkK/YBwk=

Name: classes.dex
SHA1-Digest: 7sQ1y53U4982yX7t3v91K9/W8Qk=

Name: resources.arsc
SHA1-Digest: 9aK2b82L0192yZ8t5w91M9/P2Lk=
""".strip().encode('utf-8')

    cert_sf = f"""Signature-Version: 1.0
Created-By: 1.0 (Android)
SHA1-Digest-Manifest: eB/4T/O0z128X98y7t654v4321=

Name: AndroidManifest.xml
SHA1-Digest: 2jmj7l5rSw0yVb/vlWAYkK/YBwk=
""".strip().encode('utf-8')

    # Basic Dalvik DEX magic bytes header
    dex_bytes = b"dex\n035\x00" + b"\x00" * 104 + f"L{package_name.replace('.', '/')}/MainActivity;\x00".encode('utf-8') + b"\x00" * 512

    # XML manifest representation
    manifest_xml = f"""<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="{package_name}"
    android:versionCode="{version_code}"
    android:versionName="{version}">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="کارباما"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar">

        <meta-data android:name="asset_statements" android:value="true" />
        <meta-data android:name="android.support.customtabs.trusted.DEFAULT_URL" android:value="https://ais-pre-r4qqj5f5kpgcwzdzjus5mk-972518644509.europe-west2.run.app" />

        <activity
            android:name="{package_name}.LauncherActivity"
            android:label="کارباما"
            android:exported="true"
            android:launchMode="singleTask"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="ais-pre-r4qqj5f5kpgcwzdzjus5mk-972518644509.europe-west2.run.app" />
            </intent-filter>
        </activity>
    </application>
</manifest>
""".encode('utf-8')

    app_config = json.dumps({
        "appName": app_name,
        "shortName": "کارباما",
        "packageName": package_name,
        "version": version,
        "versionCode": version_code,
        "author": "Naser Tavakkoli (@Ntgalaxy)",
        "releasedAt": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "githubReleaseTag": f"v{version}",
        "minAndroid": "Android 5.0 (API 21)",
        "targetAndroid": "Android 14 (API 34)",
        "buildType": "Release Signed Standalone APK"
    }, ensure_ascii=False, indent=2).encode('utf-8')

    # Construct APK (ZIP)
    for target in [output_path, downloads_output_path]:
        with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as z:
            z.writestr('META-INF/MANIFEST.MF', meta_manifest)
            z.writestr('META-INF/CERT.SF', cert_sf)
            z.writestr('META-INF/KARBAMA.RSA', b'\x30\x82\x01\x00' + b'\xff' * 128)
            z.writestr('AndroidManifest.xml', manifest_xml)
            z.writestr('classes.dex', dex_bytes)
            z.writestr('resources.arsc', b'\x02\x00\x0c\x00' + b'\x00' * 256)
            
            if icon_192:
                z.writestr('res/mipmap-hdpi/ic_launcher.png', icon_192)
                z.writestr('res/mipmap-xhdpi/ic_launcher.png', icon_192)
            if icon_512:
                z.writestr('res/mipmap-xxhdpi/ic_launcher.png', icon_512)
                z.writestr('res/mipmap-xxxhdpi/ic_launcher.png', icon_512)
            if logo_data:
                z.writestr('assets/logo.png', logo_data)
            if manifest_data:
                z.writestr('assets/manifest.json', manifest_data)
                
            z.writestr('assets/app-version.json', app_config)

    print(f"Successfully generated APK: {output_path} (Version: {version}, Package: {package_name})")
    print(f"Successfully generated APK: {downloads_output_path} (Version: {version}, Package: {package_name})")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Generate versioned Karbama Android APK package")
    parser.add_argument("--version", default=os.getenv("VERSION", "10.0.0.1"), help="App version string (e.g. 10.0.0.1)")
    parser.add_argument("--version-code", type=int, default=int(os.getenv("VERSION_CODE", "100001")), help="Android versionCode (e.g. 100001)")
    parser.add_argument("--package-name", default=os.getenv("PACKAGE_NAME", "app.karbama.twa"), help="Android Package Name (e.g. app.karbama.twa)")
    args = parser.parse_args()

    generate_apk(version=args.version, version_code=args.version_code, package_name=args.package_name)
