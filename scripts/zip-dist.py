#!/usr/bin/env python3
import os
import json
import shutil
import zipfile


def get_package_version():
    try:
        with open("package.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("version", "10.0.0.46")
    except Exception:
        return "10.0.0.46"


def zip_dist():
    version = get_package_version()
    dist_dir = "dist"
    os.makedirs("public/downloads", exist_ok=True)

    output_public_dl = "public/downloads/karbama-dist.zip"
    bazaar_zip_dl = f"public/downloads/karbama-cafebazaar-v{version}.zip"

    if not os.path.exists(dist_dir):
        print("dist directory does not exist. Run build first.")
        return

    print(f"Creating karbama-dist.zip (v{version}) from dist/ contents (including updated APK & AAB)...")
    apk_src = f"public/downloads/karbama-v{version}.apk"
    aab_src = f"public/downloads/karbama-v{version}.aab"

    with zipfile.ZipFile(output_public_dl, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(dist_dir):
            rel_root = os.path.relpath(root, dist_dir)
            if rel_root.startswith("downloads") or rel_root.startswith("assets/aistudio"):
                continue
            for file in files:
                if (
                    file.endswith(".zip")
                    or file.endswith(".apk")
                    or file.endswith(".aab")
                ):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, dist_dir)
                zipf.write(full_path, rel_path)
        if os.path.exists(apk_src):
            zipf.write(apk_src, f"downloads/karbama-v{version}.apk")
            zipf.write(apk_src, "downloads/karbama-latest.apk")
        if os.path.exists(aab_src):
            zipf.write(aab_src, f"downloads/karbama-v{version}.aab")
            zipf.write(aab_src, "downloads/karbama-latest.aab")

    try:
        parts = version.split('.')
        version_code = 100000 + int(parts[-1]) if len(parts) >= 4 else 100042
    except Exception:
        version_code = 100042

    readme_bazaar = f"""راهنمای آپلود نسخه {version} کارباما در پیشخوان کافه‌بازار
==========================================================
نام بسته (Package Name): app.karbama.twa
نام نسخه (Version Name): {version}
کد نسخه (Version Code): {version_code}
حداقل اندروید (Min SDK): 21 (Android 5.0)
اندروید هدف (Target SDK): 34 (Android 14)
امضای دیجیتال: V1 (JAR) + V2 (APK Signature Scheme v2)

محتویات این فایل زیپ:
1. karbama-v{version}.apk : فایل نصبی استاندارد اندروید (قابل بارگذاری در بخش APK کافه‌بازار و نصب مستقیم روی گوشی)
2. karbama-v{version}.aab : فایل Android App Bundle (قابل بارگذاری در بخش App Bundle / AAB پیشخوان کافه‌بازار)
"""

    with zipfile.ZipFile(bazaar_zip_dl, "w", zipfile.ZIP_DEFLATED) as bzip:
        if os.path.exists(apk_src):
            bzip.write(apk_src, f"karbama-v{version}.apk")
        if os.path.exists(aab_src):
            bzip.write(aab_src, f"karbama-v{version}.aab")
        bzip.writestr("README-CAFEBAZAAR-FA.txt", readme_bazaar.encode("utf-8"))

    if os.path.exists(dist_dir):
        os.makedirs("dist/downloads", exist_ok=True)
        shutil.copyfile(output_public_dl, "dist/downloads/karbama-dist.zip")
        shutil.copyfile(bazaar_zip_dl, f"dist/downloads/karbama-cafebazaar-v{version}.zip")

    dist_mb = os.path.getsize(output_public_dl) / (1024 * 1024)
    bazaar_mb = os.path.getsize(bazaar_zip_dl) / (1024 * 1024)
    print(
        f"✅ karbama-dist.zip ({dist_mb:.2f} MB) & karbama-cafebazaar-v{version}.zip ({bazaar_mb:.2f} MB) created!"
    )


if __name__ == "__main__":
    zip_dist()
