import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('data/features.json','utf8'));
const files = manifest.files.map(name => `data/${name}`);
const groups = (await Promise.all(files.map(async file => JSON.parse(await readFile(file,'utf8'))))).flat();

if (groups.length !== manifest.total) throw new Error(`registry count mismatch: ${groups.length} != ${manifest.total}`);

const ids = new Set();
for (const feature of groups) {
  if (!feature.id || !feature.group || !feature.title_ar || !feature.title_en || !feature.source) {
    throw new Error(`incomplete feature record: ${JSON.stringify(feature)}`);
  }
  if (ids.has(feature.id)) throw new Error(`duplicate canonical/source id: ${feature.id}`);
  ids.add(feature.id);
  if (feature.group === 'verified_historical') {
    const n = Number(feature.legacy_id);
    const allowed = (n >= 1 && n <= 10) || (n >= 200 && n <= 237);
    if (!allowed) throw new Error(`unverified historical id entered verified group: ${feature.id}`);
  }
}

const actual = {};
for (const feature of groups) actual[feature.group] = (actual[feature.group] || 0) + 1;
for (const [group,count] of Object.entries(manifest.groups)) {
  if (actual[group] !== count) throw new Error(`group count mismatch for ${group}: ${actual[group]} != ${count}`);
}

console.log(`Registry valid: ${groups.length} records, ${ids.size} unique IDs.`);
console.log(`Reserved historical gap preserved: ${manifest.historical_gap}`);
