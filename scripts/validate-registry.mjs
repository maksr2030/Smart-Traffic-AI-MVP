import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildCoverage, coverageSummary } from '../coverage/coverageModel.js';

const loadJson = async path => JSON.parse(await readFile(path,'utf8'));
const fail = message => { throw new Error(message); };

const manifest = await loadJson('data/features.json');
const datasets = await Promise.all(manifest.files.map(name => loadJson(`data/${name}`)));
const groups = datasets.flat();
if (groups.length !== manifest.total) fail(`registry count mismatch: ${groups.length} != ${manifest.total}`);

const ids = new Set();
for (const feature of groups) {
  if (!feature.id || !feature.group || !feature.title_ar || !feature.title_en || !feature.source) fail(`incomplete feature record: ${JSON.stringify(feature)}`);
  if (ids.has(feature.id)) fail(`duplicate canonical/source id: ${feature.id}`);
  ids.add(feature.id);
  if (feature.group === 'verified_historical') {
    const n = Number(feature.legacy_id);
    if (!((n >= 1 && n <= 14) || (n >= 200 && n <= 237))) fail(`unverified main historical id entered verified group: ${feature.id}`);
  }
  if (feature.group === 'qcs_recovered' && feature.main_legacy_effect !== 'none') fail(`QCS record cannot fill main legacy gap: ${feature.id}`);
}

const actualGroups = {};
for (const feature of groups) actualGroups[feature.group] = (actualGroups[feature.group] || 0) + 1;
for (const [group,count] of Object.entries(manifest.groups)) if (actualGroups[group] !== count) fail(`group count mismatch for ${group}: ${actualGroups[group]} != ${count}`);

const evidence = await loadJson('evidence/EVIDENCE_REGISTER.json');
if (evidence.registry_total !== manifest.total) fail(`evidence register count mismatch: ${evidence.registry_total} != ${manifest.total}`);

const evidenceIds = new Set();
let evidenceCoveredRecords = 0;
for (const item of evidence.evidence_items ?? []) {
  if (!item.evidence_id || !item.path || !item.sha256 || !Array.isArray(item.covers)) fail(`incomplete evidence item: ${JSON.stringify(item)}`);
  if (evidenceIds.has(item.evidence_id)) fail(`duplicate evidence id: ${item.evidence_id}`);
  evidenceIds.add(item.evidence_id);
  const digest = createHash('sha256').update(await readFile(item.path)).digest('hex');
  if (digest !== item.sha256) fail(`source artifact hash mismatch for ${item.evidence_id}: ${digest}`);
  if (item.mapping_document) await readFile(item.mapping_document,'utf8');
  for (const id of new Set(item.covers)) {
    if (!ids.has(String(id))) fail(`evidence ${item.evidence_id} references missing registry record: ${id}`);
    evidenceCoveredRecords++;
  }
}

const locatedSources = evidence.located_sources ?? [];
let locatedLinks = 0;
for (const source of locatedSources) {
  if (!source.source_id || !source.library_file_id || !source.title || !Array.isArray(source.covers)) fail(`incomplete located source: ${JSON.stringify(source)}`);
  for (const id of source.covers) {
    if (!ids.has(String(id))) fail(`located source ${source.source_id} references missing registry record: ${id}`);
    locatedLinks++;
  }
}

const conversationSources = evidence.conversation_sources ?? [];
let conversationLinks = 0;
for (const source of conversationSources) {
  if (!source.source_id || source.status !== 'direct_conversation_retrieval_verified' || !source.assistant_message_timestamp_utc || !Array.isArray(source.covers)) fail(`incomplete conversation source: ${JSON.stringify(source)}`);
  for (const id of source.covers) {
    if (!ids.has(String(id))) fail(`conversation source ${source.source_id} references missing registry record: ${id}`);
    conversationLinks++;
  }
}

const legacyConversation = conversationSources.find(source => source.source_id === 'CONV-TRAFFIC-2024-10-17-001');
for (const id of ['11','12','13','14']) {
  if (!legacyConversation?.covers.includes(id)) fail(`historical recovery source missing feature ${id}`);
  if (groups.find(item => item.id === id)?.evidence_status !== 'verified_historical_conversation_retrieval') fail(`feature ${id} lost historical conversation status`);
}

const qcsConversation = conversationSources.find(source => source.source_id === 'CONV-QCS-2025-03-05-102-104');
for (const id of ['QCS-102','QCS-103','QCS-104']) {
  const feature = groups.find(item => item.id === id);
  if (!feature || feature.group !== 'qcs_recovered' || feature.evidence_status !== 'verified_track_local_conversation_retrieval') fail(`QCS direct recovery invalid: ${id}`);
  if (!qcsConversation?.covers.includes(id)) fail(`QCS conversation evidence missing ${id}`);
}
const qcs102 = groups.find(item => item.id === 'QCS-102');
if (!qcs102.version_conflict || !qcs102.alternate_title_en) fail('QCS-102 English title conflict must remain explicitly preserved');

const forensic = (evidence.forensic_sources ?? []).find(source => source.source_id === 'FORENSIC-TRAFFIC-V0.3');
if (!forensic || forensic.parsed_record_count !== 213 || forensic.sha256 !== 'b0ca5ef84694fbbeda22c2c03a04ef8adecc1c968f3dc65b63f0510a1dd484f5') fail('forensic v0.3 intake metadata drift detected');
for (const [key,value] of Object.entries({A:73,B:79,B2:42,C:17,D:2})) if (forensic.confidence_counts?.[key] !== value) fail(`forensic confidence count drift: ${key}`);

const mapMeta = id => (evidence.forensic_candidate_maps ?? []).find(map => map.map_id === id) ?? fail(`missing candidate map ${id}`);
const loadMap = async id => {
  const meta = mapMeta(id);
  const map = await loadJson(meta.path);
  return {meta,map};
};

const {map:qcsMap} = await loadMap('FORENSIC-MAP-QCS-V0.3');
if (qcsMap.record_count !== 54 || qcsMap.records?.length !== 54) fail('QCS forensic candidate map must preserve exactly 54 records');
const qcsConfidence = qcsMap.records.reduce((acc,row) => ((acc[row.confidence]=(acc[row.confidence]||0)+1),acc),{});
for (const [key,value] of Object.entries({B:49,B2:3,C:2})) if (qcsConfidence[key] !== value) fail(`QCS forensic confidence drift: ${key}`);
for (const row of qcsMap.records) {
  const shouldBePromoted = [102,103,104].includes(row.number);
  if (shouldBePromoted && row.current_status !== 'promoted_direct') fail(`QCS promoted status lost: ${row.number}`);
  if (!shouldBePromoted && row.current_status !== 'candidate_not_promoted') fail(`unreviewed QCS candidate silently promoted: ${row.number}`);
}

const {map:mainMap} = await loadMap('FORENSIC-MAP-MAIN-15-199-V0.3');
if (mainMap.record_count !== 23 || mainMap.records?.length !== 23) fail('Main Legacy forensic candidate map must preserve exactly 23 records');
for (const row of mainMap.records) {
  if (row.number < 15 || row.number > 199) fail(`Main Legacy candidate outside reserved range: ${row.number}`);
  if (ids.has(String(row.number))) fail(`Main Legacy candidate ${row.number} entered registry without promotion workflow`);
}
for (const n of [46,47,77,114,115,116,117,118,148,149,152]) if (!mainMap.records.some(row => row.number === n)) fail(`Main Legacy candidate map lost recovery lead ${n}`);

const {map:qtcMap} = await loadMap('FORENSIC-MAP-QTC-V0.3');
if (qtcMap.record_count !== 14 || qtcMap.records?.length !== 14) fail('QTC forensic candidate map must preserve exactly 14 records');
for (const row of qtcMap.records) if (!['B','B2'].includes(row.confidence)) fail(`unexpected QTC confidence class: ${row.number}/${row.confidence}`);
for (const n of [4,46,47,48,56,57,58,59,60,61,62,78,82,83]) if (!qtcMap.records.some(row => row.number === n)) fail(`QTC candidate map lost recovery lead ${n}`);

const {map:oct17Map} = await loadMap('FORENSIC-MAP-OCT17-APP-V0.3');
if (oct17Map.record_count !== 14 || oct17Map.records?.length !== 14) fail('OCT17 app map must preserve exactly 14 records');
if (!oct17Map.records.every(row => row.confidence === 'B' && row.current_status === 'candidate_reconciliation_pending')) fail('OCT17 app rows must remain B candidates pending reconciliation');
if (!oct17Map.records.every(row => Array.isArray(row.possible_overlap) && row.possible_overlap.length)) fail('OCT17 app rows must retain explicit overlap candidates');

const {map:ideasMap} = await loadMap('FORENSIC-MAP-IDEAS100-V0.3');
if (ideasMap.recovered_record_count !== 3 || ideasMap.records?.length !== 3 || ideasMap.declared_track_size !== 100 || ideasMap.open_numbers !== '4-100') fail('100-ideas map metadata drift detected');
if (ideasMap.records.map(row => row.number).join(',') !== '1,2,3') fail('100-ideas recovered sequence must remain 1-3');
if (!ideasMap.records.every(row => row.current_status === 'candidate_reconciliation_pending')) fail('100-ideas recovered rows must remain reconciliation candidates');

const reserved = evidence.historical_recovery?.reserved_ranges ?? [];
if (!reserved.some(range => range.from === 15 && range.to === 199 && range.status === 'open_pending_original_evidence')) fail('main historical recovery gap must remain 15-199');

const qtos = groups.filter(feature => feature.group === 'qtos');
if (qtos.length !== 25) fail(`QTOS evidence mapping expects 25 records, got ${qtos.length}`);
const qtosEvidence = evidence.evidence_items.find(item => item.evidence_id === 'SRC-QTOS-001');
for (let i=1;i<=25;i++) {
  const id=`QTOS-${String(i).padStart(2,'0')}`;
  if (!ids.has(id) || !qtosEvidence?.covers.includes(id)) fail(`QTOS evidence mapping missing ${id}`);
}

const coverage = buildCoverage(groups);
const coverageStats = coverageSummary(coverage);
if (coverage.length !== groups.length) fail('coverage matrix must contain exactly one row per registry record');
if (coverageStats.production_verified !== 0) fail('production verification cannot be asserted without separate evidence');
for (const row of coverage) if (!['implemented_demo','represented_demo','catalogued_only'].includes(row.status)) fail(`invalid coverage status: ${row.id}`);

console.log(`Registry valid: ${groups.length} records, ${ids.size} unique IDs.`);
console.log(`Archived evidence valid: ${evidence.evidence_items.length} source(s), ${evidenceCoveredRecords} linked registry record(s).`);
console.log(`Located library sources valid: ${locatedSources.length} source(s), ${locatedLinks} source-to-registry links.`);
console.log(`Historical conversation evidence valid: ${conversationSources.length} source(s), ${conversationLinks} linked registry record(s).`);
console.log('Direct promotions valid: Main Legacy 11-14; QCS 102-104; QCS-102 title conflict preserved.');
console.log(`Forensic v0.3 valid: ${forensic.parsed_record_count} recovery-ledger rows, confidence A/B/B2/C/D = 73/79/42/17/2.`);
console.log('Candidate maps valid: QCS=54, Main15-199=23, QTC=14, OCT17-APP=14, IDEAS100 recovered=3/open=4-100.');
console.log(`Coverage valid: ${coverageStats.implemented_demo} implemented demo, ${coverageStats.represented_demo} represented demo, ${coverageStats.catalogued_only} catalogued only, ${coverageStats.production_verified} production verified.`);
console.log(`Reserved main historical gap preserved: ${manifest.historical_gap}`);
