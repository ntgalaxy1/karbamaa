import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const packageJsonPath = path.join(rootDir, 'package.json');
const versionTsPath = path.join(rootDir, 'src', 'version.ts');
const generateApkPath = path.join(rootDir, 'scripts', 'generate-apk.py');

try {
  const pkgData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const oldVersion = pkgData.version || '10.0.0.19';

  // Parse version numbers (e.g. 10.0.0.19)
  const parts = oldVersion.split('.').map((p) => parseInt(p, 10));
  
  if (parts.some((n) => isNaN(n))) {
    console.error(`Invalid version format in package.json: ${oldVersion}`);
    process.exit(1);
  }

  // Increment last number
  parts[parts.length - 1] += 1;
  const newVersion = parts.join('.');
  const newVersionCode = parts[0] * 10000 + parts[parts.length - 1];

  // 1. Update package.json
  pkgData.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkgData, null, 2) + '\n', 'utf8');

  // 2. Update src/version.ts
  const versionTsContent = `export const APP_VERSION = '${newVersion}';
export const APP_VERSION_CODE = ${newVersionCode};
export const APP_PACKAGE_NAME = 'app.karbama.twa';
`;
  fs.writeFileSync(versionTsPath, versionTsContent, 'utf8');

  // 3. Update default fallback in scripts/generate-apk.py if present
  if (fs.existsSync(generateApkPath)) {
    let apkGen = fs.readFileSync(generateApkPath, 'utf8');
    apkGen = apkGen.replace(/return data\.get\("version", "[^"]+"\)/g, `return data.get("version", "${newVersion}")`);
    apkGen = apkGen.replace(/return "10\.0\.0\.\d+"/g, `return "${newVersion}"`);
    fs.writeFileSync(generateApkPath, apkGen, 'utf8');
  }

  console.log(`\n=======================================================`);
  console.log(`🚀 KARBAMA VERSION BUMP SUCCESSFUL: v${oldVersion} ➔ v${newVersion} (Code: ${newVersionCode})`);
  console.log(`=======================================================\n`);

  // Attempt git commit, tag, and push if git is initialized
  try {
    execSync('git --version', { stdio: 'ignore' });
    const isGit = fs.existsSync(path.join(rootDir, '.git'));
    if (isGit) {
      execSync('git add package.json src/version.ts scripts/generate-apk.py', { cwd: rootDir, stdio: 'inherit' });
      execSync(`git commit -m "chore(release): bump version to v${newVersion}"`, { cwd: rootDir, stdio: 'inherit' });
      execSync(`git tag -a "v${newVersion}" -m "Release v${newVersion}"`, { cwd: rootDir, stdio: 'inherit' });
      console.log(`\n🎉 Git commit & tag created: v${newVersion}`);
    }
  } catch (gitErr) {
    console.log(`Note: Git commit/tag skipped (${gitErr.message || 'not in git repo'})`);
  }
} catch (err) {
  console.error('Error bumping version:', err);
  process.exit(1);
}
