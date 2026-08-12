import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildCoverage, coverageSummary } from '../coverage/coverageModel.js';

const loadJson = async path => JSON.parse(await readFile(path,'utf8'));
const fail = message => { throw new Error(message); };

const manifest = await loadJson('data/features.json');
const datasets = await Promise.all(manifest.files.map(name => loadJson(`data/${name}`)));
const records = datasets.flat();
if (records.length !== manifest.total) fail(`registry count mismatch: ${records.length} != ${manifest.total}`);

const ids = new Set();
for (const feature of records) {
  if (!feature.id || !feature.group || !feature.title_ar || !feature.title_en || !feature.source) fail(`incomplete feature record: ${JSON.stringify(feature)}`);
  if (ids.has(feature.id)) fail(`duplicate canonical/source id: ${feature.id}`);
  ids.add(feature.id);
  if (feature.group === 'verified_historical') {
    const n = Number(feature.legacy_id);
    if (!((n >= 1 && n <= 14) || (n >= 200 && n <= 237))) fail(`unverified Main Legacy ID entered verified group: ${feature.id}`);
  }
  if (feature.group === 'qcs_recovered' && feature.main_legacy_effect !== 'none') fail(`QCS record cannot fill Main Legacy gap: ${feature.id}`);
}

const groupCounts = {};
for (const feature of records) groupCounts[feature.group] = (groupCounts[feature.group] || 0) + 1;
for (const [group,count] of Object.entries(manifest.groups)) if (groupCounts[group] !== count) fail(`group count mismatch for ${group}: ${groupCounts[group]} != ${count}`);

const evidence = await loadJson('evidence/EVIDENCE_REGISTER.json');
if (evidence.registry_total !== manifest.total) fail(`evidence register count mismatch: ${evidence.registry_total} != ${manifest.total}`);

let archivedLinks = 0;
const archivedIds = new Set();
for (const item of evidence.evidence_items ?? []) {
  if (!item.evidence_id || !item.path || !item.sha256 || !Array.isArray(item.covers)) fail(`incomplete evidence item: ${JSON.stringify(item)}`);
  if (archivedIds.has(item.evidence_id)) fail(`duplicate evidence id: ${item.evidence_id}`);
  archivedIds.add(item.evidence_id);
  const digest = createHash('sha256').update(await readFile(item.path)).digest('hex');
  if (digest !== item.sha256) fail(`source artifact hash mismatch for ${item.evidence_id}: ${digest}`);
  if (item.mapping_document) await readFile(item.mapping_document,'utf8');
  for (const id of new Set(item.covers)) {
    if (!ids.has(String(id))) fail(`archived evidence ${item.evidence_id} references missing registry record: ${id}`);
    archivedLinks++;
  }
}

let locatedLinks = 0;
for (const source of evidence.located_sources ?? []) {
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

const legacyConv = conversationSources.find(source => source.source_id === 'CONV-TRAFFIC-2024-10-17-001');
for (const id of ['11','12','13','14']) {
  if (!legacyConv?.covers.includes(id)) fail(`historical recovery source missing feature ${id}`);
  if (records.find(item => item.id === id)?.evidence_status !== 'verified_historical_conversation_retrieval') fail(`feature ${id} lost historical conversation status`);
}

const qcsConv = conversationSources.find(source => source.source_id === 'CONV-QCS-2025-03-05-102-104');
for (const id of ['QCS-102','QCS-103','QCS-104']) {
  const feature = records.find(item => item.id === id);
  if (!feature || feature.group !== 'qcs_recovered' || feature.evidence_status !== 'verified_track_local_conversation_retrieval') fail(`QCS direct recovery invalid: ${id}`);
  if (!qcsConv?.covers.includes(id)) fail(`QCS conversation evidence missing ${id}`);
}
const qcs102 = records.find(item => item.id === 'QCS-102');
if (!qcs102.version_conflict || !qcs102.alternate_title_en) fail('QCS-102 historical English-title conflict must remain explicit');

const oct07 = (evidence.precursor_sources ?? []).find(source => source.source_id === 'CONV-SMARTCITY-2024-10-07-IDEA9');
if (!oct07 || oct07.idea_number !== 9 || oct07.registry_effect !== 'none' || !oct07.direct_brd_title?.includes('Smart Toll Management')) fail('October 7 smart-toll precursor evidence metadata drift detected');
await readFile(oct07.evidence_document,'utf8');
if (ids.has('OCT07-009')) fail('October 7 precursor must not silently enter unified registry');

const forensic = (evidence.forensic_sources ?? []).find(source => source.source_id === 'FORENSIC-TRAFFIC-V0.3');
if (!forensic || forensic.parsed_record_count !== 213 || forensic.sha256 !== 'b0ca5ef84694fbbeda22c2c03a04ef8adecc1c968f3dc65b63f0510a1dd484f5') fail('forensic v0.3 intake metadata drift detected');
for (const [key,value] of Object.entries({A:73,B:79,B2:42,C:17,D:2})) if (forensic.confidence_counts?.[key] !== value) fail(`forensic confidence count drift: ${key}`);

const mapMetas = evidence.forensic_candidate_maps ?? [];
const getMap = async id => {
  const meta = mapMetas.find(item => item.map_id === id);
  if (!meta) fail(`missing forensic candidate map: ${id}`);
  return {meta,map:await loadJson(meta.path)};
};

const {map:qcsMap} = await getMap('FORENSIC-MAP-QCS-V0.3');
if (qcsMap.record_count !== 54 || qcsMap.records?.length !== 54) fail('QCS map must preserve 54 rows');
const qcsConf = qcsMap.records.reduce((a,r)=>((a[r.confidence]=(a[r.confidence]||0)+1),a),{});
for (const [key,value] of Object.entries({B:49,B2:3,C:2})) if (qcsConf[key] !== value) fail(`QCS confidence drift: ${key}`);
for (const row of qcsMap.records) {
  const promoted = [102,103,104].includes(row.number);
  if (promoted && row.current_status !== 'promoted_direct') fail(`QCS promoted status lost: ${row.number}`);
  if (!promoted && row.current_status !== 'candidate_not_promoted') fail(`QCS candidate silently promoted: ${row.number}`);
}

const {map:mainMap} = await getMap('FORENSIC-MAP-MAIN-15-199-V0.3');
if (mainMap.record_count !== 23 || mainMap.records?.length !== 23) fail('Main Legacy candidate map must preserve 23 rows');
for (const row of mainMap.records) {
  if (row.number < 15 || row.number > 199) fail(`Main candidate outside reserved range: ${row.number}`);
  if (ids.has(String(row.number))) fail(`Main candidate ${row.number} entered registry without promotion workflow`);
}
for (const n of [46,47,77,114,115,116,117,118,148,149,152]) if (!mainMap.records.some(row => row.number === n)) fail(`Main candidate map lost ${n}`);

const {map:qtcMap} = await getMap('FORENSIC-MAP-QTC-V0.3');
if (qtcMap.record_count !== 14 || qtcMap.records?.length !== 14) fail('QTC map must preserve 14 rows');
for (const n of [4,46,47,48,56,57,58,59,60,61,62,78,82,83]) if (!qtcMap.records.some(row => row.number === n)) fail(`QTC map lost ${n}`);

const {map:oct17Map} = await getMap('FORENSIC-MAP-OCT17-APP-V0.3');
if (oct17Map.record_count !== 14 || oct17Map.records?.length !== 14) fail('OCT17 app map must preserve 14 rows');
if (!oct17Map.records.every(row => row.confidence === 'B' && row.current_status === 'candidate_reconciliation_pending' && row.possible_overlap?.length)) fail('OCT17 app reconciliation metadata invalid');

const {map:ideasMap} = await getMap('FORENSIC-MAP-IDEAS100-V0.3');
if (ideasMap.recovered_record_count !== 3 || ideasMap.records?.length !== 3 || ideasMap.declared_track_size !== 100 || ideasMap.open_numbers !== '4-100') fail('100-ideas recovery metadata drift detected');
if (ideasMap.records.map(row => row.number).join(',') !== '1,2,3') fail('100-ideas recovered sequence must remain 1-3');

const {map:dec17Map} = await getMap('FORENSIC-MAP-DEC17-TRACK-V0.3');
if (dec17Map.record_count !== 16 || dec17Map.records?.length !== 16) fail('DEC17 full track must preserve 16 rows');
const dec17Conf = dec17Map.records.reduce((a,r)=>((a[r.confidence]=(a[r.confidence]||0)+1),a),{});
if (dec17Conf.B !== 2 || dec17Conf.C !== 14) fail('DEC17 confidence distribution must remain B=2/C=14');
for (const n of [11,12,23,24,25,26,35,36,37,38,39,43,44,45,46,47]) if (!dec17Map.records.some(row => row.number === n)) fail(`DEC17 full track lost ${n}`);

const {map:envMap} = await getMap('FORENSIC-MAP-CROSS-PROJECT-ENV-V0.3');
if (envMap.record_count !== 2 || envMap.records?.length !== 2 || !envMap.records.every(row => row.confidence === 'D' && row.unified_registry_effect === 'none')) fail('cross-project environment candidate boundary drift detected');
for (const n of [306,568]) if (!envMap.records.some(row => row.source_number === n)) fail(`cross-project environment map lost ${n}`);

const coverageIndexMeta = evidence.forensic_track_coverage_index;
if (!coverageIndexMeta?.path || coverageIndexMeta.source_record_count !== 213 || coverageIndexMeta.track_count !== 14 || coverageIndexMeta.registry_effect !== 'none') fail('forensic coverage-index metadata drift detected');
const coverageIndex = await loadJson(coverageIndexMeta.path);
if (coverageIndex.forensic_arabic_record_count !== 213 || coverageIndex.track_row_sum !== 213 || coverageIndex.tracks?.length !== 14) fail('forensic track coverage index must account for exactly 213 rows across 14 tracks');
const trackNames = new Set();
let trackSum = 0;
for (const track of coverageIndex.tracks) {
  if (!track.track || !Number.isInteger(track.source_rows) || track.source_rows < 1 || !track.destination || !track.coverage_status) fail(`invalid forensic track coverage row: ${JSON.stringify(track)}`);
  if (trackNames.has(track.track)) fail(`duplicate forensic track coverage row: ${track.track}`);
  trackNames.add(track.track);
  trackSum += track.source_rows;
  if (forensic.track_counts?.[track.track] !== track.source_rows) fail(`forensic track count mismatch for ${track.track}: ${track.source_rows} != ${forensic.track_counts?.[track.track]}`);
}
if (trackSum !== 213 || trackNames.size !== Object.keys(forensic.track_counts ?? {}).length) fail('forensic track coverage index is incomplete');
for (const [track,count] of Object.entries(forensic.track_counts ?? {})) if (!coverageIndex.tracks.some(row => row.track === track && row.source_rows === count)) fail(`forensic coverage index missing ${track}`);

const reserved = evidence.historical_recovery?.reserved_ranges ?? [];
if (!reserved.some(range => range.from === 15 && range.to === 199 && range.status === 'open_pending_original_evidence')) fail('Main Legacy gap must remain 15-199');

const qtos = records.filter(feature => feature.group === 'qtos');
if (qtos.length !== 25) fail(`QTOS mapping expects 25 records, got ${qtos.length}`);
const qtosEvidence = evidence.evidence_items.find(item => item.evidence_id === 'SRC-QTOS-001');
for (let i=1;i<=25;i++) {
  const id=`QTOS-${String(i).padStart(2,'0')}`;
  if (!ids.has(id) || !qtosEvidence?.covers.includes(id)) fail(`QTOS evidence mapping missing ${id}`);
}

const coverage = buildCoverage(records);
const coverageStats = coverageSummary(coverage);
if (coverage.length !== records.length) fail('coverage matrix must contain exactly one row per registry record');
if (coverageStats.production_verified !== 0) fail('production verification cannot be asserted without separate evidence');
for (const row of coverage) if (!['implemented_demo','represented_demo','catalogued_only'].includes(row.status)) fail(`invalid coverage status: ${row.id}`);

console.log(`Registry valid: ${records.length} records, ${ids.size} unique IDs.`);
console.log(`Archived evidence valid: ${evidence.evidence_items.length} source(s), ${archivedLinks} linked registry record(s).`);
console.log(`Located library sources valid: ${(evidence.located_sources ?? []).length} source(s), ${locatedLinks} links.`);
console.log(`Direct registry conversation evidence valid: ${conversationSources.length} source(s), ${conversationLinks} links.`);
console.log('Direct promotions valid: Main Legacy 11-14; QCS 102-104. October 7 Idea 9 retained as verified precursor with zero registry effect.');
console.log(`Forensic v0.3 valid: ${forensic.parsed_record_count} recovery-ledger rows, confidence A/B/B2/C/D = 73/79/42/17/2.`);
console.log('Normalized forensic maps valid: QCS=54, Main15-199=23, QTC=14, OCT17=14, IDEAS100=3/open4-100, DEC17=16, RelatedEnv=2.');
console.log(`Forensic track coverage complete: ${coverageIndex.tracks.length} tracks account for ${trackSum} / ${forensic.parsed_record_count} v0.3 rows.`);
console.log(`Coverage valid: ${coverageStats.implemented_demo} implemented demo, ${coverageStats.represented_demo} represented demo, ${coverageStats.catalogued_only} catalogued only, ${coverageStats.production_verified} production verified.`);
console.log(`Reserved Main Legacy gap preserved: ${manifest.historical_gap}`);
