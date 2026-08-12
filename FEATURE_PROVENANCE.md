# Feature Provenance Policy

The MVP registry preserves source provenance and does not fill historical numbering gaps by invention.

## Unified registry groups

- `verified_historical`: 52 Main Legacy records in verified ranges 1-14 and 200-237.
- `conversation_recovered`: 23 capabilities without verified Main Legacy identifiers.
- `additional_history`: 5 capabilities recovered from project history.
- `qtos`: 25 independent QTOS capabilities.
- `qcs_recovered`: 3 directly reopened QCS capabilities: QCS-102 through QCS-104.

Unified registry total: 108 records.

Main Legacy 15-199 remains reserved pending reliable direct evidence.

## Core rule: source history is not canonical count

The repository separates:

1. Unified registry records.
2. Direct/original evidence.
3. Historical precursor evidence.
4. Secondary forensic recovery rows.
5. Candidate and reconciliation maps.
6. Cross-project integration candidates.
7. MVP implementation and production-verification evidence.

None of these layers is silently converted into another.

## Namespace separation

Main Legacy, QTOS, QCS, QTC, IDEAS100 and other historical tracks are separate namespaces.

A reused number does not establish identity. A track-local number never fills a missing Main Legacy number merely because the numeric value is the same.

## Main Legacy direct-promotion rule

Promotion to `verified_historical` requires a reliable source that binds:

1. Smart Traffic project identity.
2. Explicit Main Legacy feature number.
3. Explicit feature identity/title or description.

The directly reopened 17 October 2024 Smart Traffic conversation satisfies this for Main Legacy 11-14. Original file evidence supports 1-10, and the verified REDS2 historical block supports 200-237.

Main Legacy candidate map:

`evidence/MAIN_LEGACY_FORENSIC_CANDIDATES_15_199_v0_3.json`

It preserves 23 candidates and currently promotes none.

High-priority candidates include 46, 47, 77, 114-118, 148-149 and 152. Secondary forensic confidence does not replace direct-source reopening.

## Directly reopened October 7 precursor

A historical conversation dated 7 October 2024 was directly reopened. It began as AI-enabled smart-city project ideation for Saudi Arabia with a direct-revenue emphasis. A subsequent message explicitly referred to Idea 9, followed by a BRD titled:

`AI-Powered Smart Toll Management System for Optimizing Traffic Flow and Revenue Generation`

Evidence document:

`evidence/OCT07_TRAFFIC_PRECURSOR_EVIDENCE.md`

This source confirms a traffic-related precursor and the historical reuse of number 9, but it does not establish that the record belongs to the later Main Legacy Smart Traffic numbering. Registry effect remains zero.

## QCS direct and forensic boundaries

Direct historical conversation retrieval from 5 March 2025 re-established:

- QCS-102
- QCS-103
- QCS-104

`QCS-102` retains two historical English title variants as an explicit version conflict.

Direct evidence:

`evidence/QCS_RECOVERY_EVIDENCE.md`

Full forensic map:

`evidence/QCS_FORENSIC_CANDIDATE_MAP_v0_3.json`

The map preserves 54 QCS rows: B=49, B2=3, C=2. Only 102-104 are separately promoted by direct evidence; 51 remain candidates.

## QTC boundary

QTC is a separate quantum traffic-computing track.

`evidence/QTC_FORENSIC_CANDIDATE_MAP_v0_3.json`

It preserves 14 candidate rows with zero current promotion effect. Important anchors include 46-48, 78 and 82-83.

## October 17 app-track reconciliation

`evidence/OCT17_APP_FORENSIC_CANDIDATE_MAP_v0_3.json`

The map preserves 14 unnumbered October 2024 traffic-app rows. Every row contains an explicit possible-overlap crosswalk to existing registry records where applicable. These historical rows are not counted again until source and distinctness review demonstrates a separate capability.

## February 2025 100-ideas track

`evidence/IDEAS100_FORENSIC_CANDIDATE_MAP_v0_3.json`

Only rows 1-3 are currently recovered from the secondary forensic source. The declared historical track is 100 ideas; 4-100 remain explicitly open. No missing title is invented.

## Full December 17 track

`evidence/DEC17_TRAFFIC_TRACK_FORENSIC_MAP_v0_3.json`

This preserves all 16 forensic rows from the December 17 track:

- B: 2 — Features 46 and 47 with recovered titles in the forensic artifact.
- C: 14 — existence-only rows with unrecovered titles, including 11, 12, 23-26, 35-39 and 43-45.

Features 46 and 47 remain unpromoted because their primary historical messages have not been independently reopened in the current evidence chain.

## Cross-project boundary

`evidence/CROSS_PROJECT_TRAFFIC_INTEGRATION_CANDIDATES_v0_3.json`

Records 306 and 568 originate from Smart AI Environment historical material. They remain cross-project integration candidates and have zero Smart Traffic legacy effect unless independent Smart Traffic provenance is recovered.

## Complete forensic v0.3 accounting

Primary secondary-forensic artifact:

`Smart_Traffic_Forensic_Master_Recovery_v0_3.html`

SHA-256:

`b0ca5ef84694fbbeda22c2c03a04ef8adecc1c968f3dc65b63f0510a1dd484f5`

Arabic recovery-ledger rows: 213.

Confidence distribution:

- A: 73
- B: 79
- B2: 42
- C: 17
- D: 2

Complete track accounting:

`evidence/FORENSIC_V0_3_TRACK_COVERAGE_INDEX.json`

The index requires every one of the 14 v0.3 tracks to have an explicit preservation destination or exclusion boundary. The track-row sum is exactly 213/213.

The 14 tracks are:

- BASE-LEGACY — 10
- OCT07-TRAFFIC — 1
- OCT17-APP — 14
- DEC17-TRAFFIC — 16
- DEC20-TRAFFIC — 1
- DEC25-TRAFFIC — 8
- IDEAS100-2025-02 — 3
- QCS — 54
- QTC — 14
- VERIFIED-200 — 38
- CR — 22
- AR — 5
- QTOS — 25
- RELATED-ENV — 2

These sum to 213. This is recovery-ledger accounting, not a statement that 213 unique canonical features exist.

## Central evidence framework

Central register:

`evidence/EVIDENCE_REGISTER.json`

Source intake:

`evidence/SOURCE_INTAKE_TEMPLATE.md`

Recovery queue:

`evidence/RECOVERY_QUEUE.md`

The central register distinguishes archived source artifacts, located Library sources, directly reopened registry evidence, precursor evidence, forensic sources, candidate maps and complete forensic track accounting.

## QTOS original source evidence

Archived source:

`evidence/source/Smart_Traffic_QTOS_Additional_Features_Bilingual_Standard.html`

SHA-256:

`a0e7bf1e78e2fb271012dbca722b4d03a2a9e957c0a19778353a23e680472d9f`

Mapping:

`evidence/QTOS_SOURCE_EVIDENCE.md`

This evidence strengthens provenance without duplicating the 25 QTOS registry records.

## Automated provenance safeguards

CI checks that:

- unified registry totals and group totals remain consistent;
- Main Legacy verified IDs stay inside supported ranges;
- QCS/QTC/IDEAS100 numbering cannot silently fill Main Legacy gaps;
- archived-source hashes remain unchanged;
- direct Main Legacy 11-14 and QCS 102-104 evidence remains mapped;
- the QCS-102 title conflict remains explicit;
- the October 7 precursor remains zero-count and cannot replace Main Feature 9;
- forensic v0.3 remains 213 rows with the recorded confidence distribution;
- QCS remains 54 rows with only 102-104 promoted direct;
- Main 15-199 candidate map remains 23 rows with zero silent promotion;
- QTC remains 14 rows;
- OCT17 app remains 14 reconciliation rows;
- IDEAS100 remains recovered 1-3 with 4-100 open;
- DEC17 remains 16 rows with B=2/C=14;
- cross-project environment rows remain D-class zero-count candidates;
- all 14 forensic tracks are accounted for and sum to 213/213;
- Main Legacy 15-199 remains reserved;
- QTOS maps to all 25 source records;
- production verification remains separate from historical documentation and MVP demonstration.

Historical overlap and conflicting versions are preserved. Canonical reconciliation is a separate controlled layer and must never erase provenance.
