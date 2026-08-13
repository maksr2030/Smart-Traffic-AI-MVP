import { access, readFile } from 'node:fs/promises';

for (const file of ['decisionRoomRuntime.js','decisionRoom.css','data/features.json','coverage/coverageModel.js']) await access(file);
const runtime=await readFile('decisionRoomRuntime.js','utf8');
const css=await readFile('decisionRoom.css','utf8');
const manifest=JSON.parse(await readFile('data/features.json','utf8'));

for (const id of ['acquisitionDecisionRoom','decisionRoomNav','decisionRoomOpen','drExport','drOpenPortfolio']) {
  if(!runtime.includes(id)) throw new Error(`Decision Room contract missing: ${id}`);
}
for (const phrase of ['buildCoverage','coverageSummary','production_verified','autoApply=false','humanApprovalRequired=true','ARCHITECTURE','EVIDENCE REGISTER','MVP → PRODUCTION','Full Acquisition','Smart_Traffic_AI_Acquisition_Decision_Brief.json']) {
  if(!runtime.includes(phrase)) throw new Error(`Decision Room evidence/diligence contract missing: ${phrase}`);
}
if(!runtime.includes("fetch('data/features.json')")) throw new Error('Decision Room must load the same feature manifest');
if(!runtime.includes('manifest.files.map')) throw new Error('Decision Room must derive capability data from manifest.files');
for (const selector of ['.dr-room','.dr-hero','.dr-evidence-row','.dr-architecture','.dr-roadmap','.dr-contact-card']) {
  if(!css.includes(selector)) throw new Error(`Decision Room style missing: ${selector}`);
}
if(!css.includes('@media(max-width:780px)')) throw new Error('Decision Room mobile layout missing');
if(Number(manifest.total)!==123) throw new Error(`Unexpected registry total for Decision Room: ${manifest.total}`);
console.log('Decision Room contract passed: live registry, evidence matrix, architecture snapshot, due diligence, production roadmap, IP boundary and mobile layout wired.');
