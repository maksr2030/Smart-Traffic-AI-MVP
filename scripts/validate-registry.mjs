import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildCoverage, coverageSummary } from '../coverage/coverageModel.js';

const manifest = JSON.parse(await readFile('data/features.json','utf8'));
const files = manifest.files.map(name => `data/${name}`);
const datasets = await Promise.all(files.map(async file => JSON.parse(await readFile(file,'utf8'))));
const groups = datasets.flat();

if (groups.length !== manifest.total) throw new Error(`registry count mismatch: ${groups.length} != ${manifest.total}`);

const ids = new Set();
for (const feature of groups) {
  if (!feature.id || !feature.group || !feature.title_ar || !feature.title_en || !feature.source) throw new Error(`incomplete feature record: ${JSON.stringify(feature)}`);
  if (ids.has(feature.id)) throw new Error(`duplicate canonical/source id: ${feature.id}`);
  ids.add(feature.id);
  if (feature.group === 'verified_historical') {
    const n = Number(feature.legacy_id);
    const allowed = (n >= 1 && n <= 14) || (n >= 200 && n <= 237);
    if (!allowed) throw new Error(`unverified main historical id entered verified group: ${feature.id}`);
  }
  if (feature.group === 'qcs_recovered' && feature.main_legacy_effect !== 'none') throw new Error(`QCS record cannot fill main legacy gap: ${feature.id}`);
}

const actual = {};
for (const feature of groups) actual[feature.group] = (actual[feature.group] || 0) + 1;
for (const [group,count] of Object.entries(manifest.groups)) if (actual[group] !== count) throw new Error(`group count mismatch for ${group}: ${actual[group]} != ${count}`);

const evidenceRegister = JSON.parse(await readFile('evidence/EVIDENCE_REGISTER.json','utf8'));
if (evidenceRegister.registry_total !== manifest.total) throw new Error(`evidence register count mismatch: ${evidenceRegister.registry_total} != ${manifest.total}`);

const evidenceIds = new Set();
let evidenceCoveredRecords = 0;
for (const item of evidenceRegister.evidence_items ?? []) {
  if (!item.evidence_id || !item.path || !item.sha256 || !Array.isArray(item.covers)) throw new Error(`incomplete evidence item: ${JSON.stringify(item)}`);
  if (evidenceIds.has(item.evidence_id)) throw new Error(`duplicate evidence id: ${item.evidence_id}`);
  evidenceIds.add(item.evidence_id);
  const digest = createHash('sha256').update(await readFile(item.path)).digest('hex');
  if (digest !== item.sha256) throw new Error(`source artifact hash mismatch for ${item.evidence_id}: ${digest}`);
  if (item.mapping_document) await readFile(item.mapping_document,'utf8');
  for (const id of new Set(item.covers)) {
    if (!ids.has(String(id))) throw new Error(`evidence ${item.evidence_id} references missing registry record: ${id}`);
    evidenceCoveredRecords += 1;
  }
}

const locatedSources = evidenceRegister.located_sources ?? [];
let locatedLinks = 0;
for (const source of locatedSources) {
  if (!source.source_id || !source.library_file_id || !source.title || !Array.isArray(source.covers)) throw new Error(`incomplete located source: ${JSON.stringify(source)}`);
  for (const id of source.covers) {
    if (!ids.has(String(id))) throw new Error(`located source ${source.source_id} references missing registry record: ${id}`);
    locatedLinks += 1;
  }
}

const conversationSources = evidenceRegister.conversation_sources ?? [];
let conversationLinks = 0;
for (const source of conversationSources) {
  if (!source.source_id || source.status !== 'direct_conversation_retrieval_verified' || !source.assistant_message_timestamp_utc || !Array.isArray(source.covers)) throw new Error(`incomplete conversation source: ${JSON.stringify(source)}`);
  for (const id of source.covers) {
    if (!ids.has(String(id))) throw new Error(`conversation source ${source.source_id} references missing registry record: ${id}`);
    conversationLinks += 1;
  }
}

const legacyConversation = conversationSources.find(source => source.source_id === 'CONV-TRAFFIC-2024-10-17-001');
for (const id of ['11','12','13','14']) {
  if (!legacyConversation?.covers.includes(id)) throw new Error(`historical recovery source missing feature ${id}`);
  const feature = groups.find(item => item.id === id);
  if (feature?.evidence_status !== 'verified_historical_conversation_retrieval') throw new Error(`feature ${id} lost historical conversation status`);
}

const qcsConversation = conversationSources.find(source => source.source_id === 'CONV-QCS-2025-03-05-102-104');
for (const id of ['QCS-102','QCS-103','QCS-104']) {
  const feature = groups.find(item => item.id === id);
  if (!feature || feature.group !== 'qcs_recovered' || feature.evidence_status !== 'verified_track_local_conversation_retrieval') throw new Error(`QCS direct recovery invalid: ${id}`);
  if (!qcsConversation?.covers.includes(id)) throw new Error(`QCS conversation evidence missing ${id}`);
}
const qcs102 = groups.find(item => item.id === 'QCS-102');
if (!qcs102.version_conflict || !qcs102.alternate_title_en) throw new Error('QCS-102 English title conflict must remain explicitly preserved');

const forensicSources = evidenceRegister.forensic_sources ?? [];
const forensic = forensicSources.find(source => source.source_id === 'FORENSIC-TRAFFIC-V0.3');
if (!forensic || forensic.parsed_record_count !== 213 || forensic.sha256 !== 'b0ca5ef84694fbbeda22c2c03a04ef8adecc1c968f3dc65b63f0510a1dd484f5') throw new Error('forensic v0.3 intake metadata drift detected');
const expectedConfidence = {A:73,B:79,B2:42,C:17,D:2};
for (const [key,value] of Object.entries(expectedConfidence)) if (forensic.confidence_counts?.[key] !== value) throw new Error(`forensic confidence count drift: ${key}`);

const reserved = evidenceRegister.historical_recovery?.reserved_ranges ?? [];
if (!reserved.some(range => range.from === 15 && range.to === 199 && range.status === 'open_pending_original_evidence')) throw new Error('main historical recovery gap must remain 15-199');

const qtos = groups.filter(feature => feature.group === 'qtos');
if (qtos.length !== 25) throw new Error(`QTOS evidence mapping expects 25 records, got ${qtos.length}`);
const qtosEvidence = evidenceRegister.evidence_items.find(item => item.evidence_id === 'SRC-QTOS-001');
for (let i=1;i<=25;i++) {
  const id=`QTOS-${String(i).padStart(2,'0')}`;
  if (!ids.has(id) || !qtosEvidence?.covers.includes(id)) throw new Error(`QTOS evidence mapping missing ${id}`);
}

const coverage = buildCoverage(groups);
const coverageStats = coverageSummary(coverage);
if (coverage.length !== groups.length) throw new Error('coverage matrix must contain exactly one row per registry record');
if (coverageStats.production_verified !== 0) throw new Error('production verification cannot be asserted without separate evidence');
for (const row of coverage) if (!['implemented_demo','represented_demo','catalogued_only'].includes(row.status)) throw new Error(`invalid coverage status: ${row.id}`);

console.log(`Registry valid: ${groups.length} records, ${ids.size} unique IDs.`);
console.log(`Archived evidence valid: ${evidenceRegister.evidence_items.length} source(s), ${evidenceCoveredRecords} linked registry record(s).`);
console.log(`Located library sources valid: ${locatedSources.length} source(s), ${locatedLinks} source-to-registry links.`);
console.log(`Historical conversation evidence valid: ${conversationSources.length} source(s), ${conversationLinks} linked registry record(s).`);
console.log('Main legacy recovery valid: 11-14; QCS track-local recovery valid: 102-104; QCS-102 title conflict preserved.');
console.log(`Forensic v0.3 intake valid: ${forensic.parsed_record_count} records, confidence A/B/B2/C/D = 73/79/42/17/2.`);
console.log(`Coverage valid: ${coverageStats.implemented_demo} implemented demo, ${coverageStats.represented_demo} represented demo, ${coverageStats.catalogued_only} catalogued only, ${coverageStats.production_verified} production verified.`);
console.log(`Reserved main historical gap preserved: ${manifest.historical_gap}`);
