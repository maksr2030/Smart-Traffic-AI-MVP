import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const outDir = process.argv[2] || 'site';
const rootFiles = [
  'index.html','styles.css','acquisition.css','guidedDemo.css','decisionRoom.css','hardeningRuntime.css',
  'app.js','v18Runtime.js','acquisitionRuntime.js','decisionRoomRuntime.js','hardeningRuntime.js'
];

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} exited with ${code}`)));
    child.on('error', reject);
  });
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
for (const file of rootFiles) {
  await access(file);
  await cp(file, join(outDir, file));
}
await cp('guidedDemoRuntime.v183.js', join(outDir, 'guidedDemoRuntime.js'));
for (const dir of ['engine','coverage','data']) await cp(dir, join(outDir, dir), { recursive: true });

await run(process.execPath, ['scripts/prepare-runtime-sync-v183.mjs', outDir]);

const indexPath = join(outDir, 'index.html');
let html = await readFile(indexPath, 'utf8');
const cssAnchor = '<link rel="stylesheet" href="styles.css">';
const appAnchor = '<script type="module" src="app.js"></script>';
const v18Anchor = '<script type="module" src="v18Runtime.js"></script>';
if (!html.includes(cssAnchor) || !html.includes(appAnchor) || !html.includes(v18Anchor)) {
  throw new Error('Executable page injection anchors missing');
}
html = html.replace(cssAnchor,
  '<link rel="stylesheet" href="styles.css?v=190">\n' +
  '  <link rel="stylesheet" href="acquisition.css?v=190">\n' +
  '  <link rel="stylesheet" href="guidedDemo.css?v=190">\n' +
  '  <link rel="stylesheet" href="decisionRoom.css?v=190">\n' +
  '  <link rel="stylesheet" href="hardeningRuntime.css?v=190">');
html = html.replace(appAnchor, '<script type="module" src="app.js?v=190"></script>');
html = html.replace(v18Anchor,
  '<script type="module" src="v18Runtime.js?v=190"></script>\n' +
  '<script type="module" src="acquisitionRuntime.js?v=190"></script>\n' +
  '<script type="module" src="decisionRoomRuntime.js?v=190"></script>\n' +
  '<script type="module" src="hardeningRuntime.js?v=190"></script>\n' +
  '<script type="module" src="guidedDemoRuntime.js?v=190"></script>');
await writeFile(indexPath, html, 'utf8');
await writeFile(join(outDir, '.nojekyll'), '', 'utf8');

const builtIndex = await readFile(indexPath, 'utf8');
for (const contract of [
  'app.js?v=190','v18Runtime.js?v=190','acquisitionRuntime.js?v=190','decisionRoomRuntime.js?v=190',
  'hardeningRuntime.js?v=190','guidedDemoRuntime.js?v=190','hardeningRuntime.css?v=190'
]) {
  if (!builtIndex.includes(contract)) throw new Error(`Built index contract missing: ${contract}`);
}
const runtime = await readFile(join(outDir, 'hardeningRuntime.js'), 'utf8');
for (const contract of ['runtimeIntegrityPanel','captureReplayPackage','verifyLedgerChain','digitalSignature=false','blockchainAnchored=false','nonRepudiation=false']) {
  if (!runtime.includes(contract)) throw new Error(`Built hardening runtime contract missing: ${contract}`);
}
const mobileCss = await readFile(join(outDir, 'acquisition.css'), 'utf8');
for (const contract of ['overflow-y:auto','position:fixed;left:12px;right:12px']) {
  if (!mobileCss.includes(contract)) throw new Error(`Built mobile entry contract missing: ${contract}`);
}

console.log(`Executable site v1.9.0 built successfully at ${outDir}.`);
