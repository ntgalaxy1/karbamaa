#!/usr/bin/env python3
import os
import zipfile

def zip_dist():
    dist_dir = 'dist'
    output_public = 'public/karbama-dist.zip'
    output_dist = 'dist/karbama-dist.zip'

    if not os.path.exists(dist_dir):
        print("dist directory does not exist. Run build first.")
        return

    os.makedirs('public', exist_ok=True)

    print("Creating karbama-dist.zip from dist/ contents...")
    with zipfile.ZipFile(output_public, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                if file.endswith('.zip') or file.endswith('.apk'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, dist_dir)
                zipf.write(full_path, rel_path)

    # Copy to dist so both routes serve it
    if os.path.exists(dist_dir):
        with open(output_public, 'rb') as f_in:
            with open(output_dist, 'wb') as f_out:
                f_out.write(f_in.read())

    size_mb = os.path.getsize(output_public) / (1024 * 1024)
    print(f"✅ karbama-dist.zip ({size_mb:.2f} MB) created successfully!")

if __name__ == '__main__':
    zip_dist()
