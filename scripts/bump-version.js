import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const packageJsonPath = path.join(rootDir, 'package.json');
const headerPath = path.join(rootDir, 'src', 'components', 'Header.tsx');
const apkModalPath = path.join(rootDir, 'src', 'components', 'ApkDownloadModal.tsx');

try {
  const pkgData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const oldVersion = pkgData.version || '10.0.0.1';

  // Parse version numbers (e.g. 10.0.0.3)
  const parts = oldVersion.split('.').map((p) => parseInt(p, 10));
  
  if (parts.some((n) => isNaN(n))) {
    console.error(`Invalid version format in package.json: ${oldVersion}`);
    process.exit(1);
  }

  // Increment last number
  parts[parts.length - 1] += 1;
  const newVersion = parts.join('.');

  // 1. Update package.json
  pkgData.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkgData, null, 2) + '\n', 'utf8');

  // 2. Update Header.tsx version badge if present
  if (fs.existsSync(headerPath)) {
    let headerContent = fs.readFileSync(headerPath, 'utf8');
    headerContent = headerContent.replace(/v10\.0\.0\.\d+/g, `v${newVersion}`);
    fs.writeFileSync(headerPath, headerContent, 'utf8');
  }

  // 3. Update ApkDownloadModal.tsx version references
  if (fs.existsSync(apkModalPath)) {
    let apkContent = fs.readFileSync(apkModalPath, 'utf8');
    apkContent = apkContent.replace(/10\.0\.0\.\d+/g, newVersion);
    fs.writeFileSync(apkModalPath, apkContent, 'utf8');
  }

  console.log(`\n=======================================================`);
  console.log(`🚀 KARBAMA VERSION BUMP SUCCESSFUL: v${oldVersion} ➔ v${newVersion}`);
  console.log(`=======================================================\n`);

  // Attempt git commit, tag, and push to GitHub
  try {
    execSync('git add .', { cwd: rootDir, stdio: 'inherit' });
    execSync(`git commit -m "bump: release v${newVersion}"`, { cwd: rootDir, stdio: 'inherit' });
    execSync(`git tag -a "v${newVersion}" -m "Release v${newVersion}"`, { cwd: rootDir, stdio: 'inherit' });
    console.log(`\n🎉 Git commit & tag created: v${newVersion}`);

    try {
      execSync('git push origin main --tags', { cwd: rootDir, stdio: 'inherit' });
      console.log(`\n🌐 Pushed release tag v${newVersion} to GitHub successfully!`);
    } catch (pushErr) {
      console.log(`Note: Local tag v${newVersion} created. Run 'git push origin main --tags' to publish to GitHub Releases.`);
    }
  } catch (gitErr) {
    console.log(`Note: Git operations complete or awaiting remote sync (${gitErr.message})`);
  }
} catch (err) {
  console.error('Error bumping version:', err);
  process.exit(1);
}
