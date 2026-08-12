# Feature Provenance Policy

The MVP registry preserves source provenance and does not fill historical numbering gaps by invention.

Source groups:

- `verified_historical`: 52 Main Legacy records with verified historical identifiers in ranges 1-14 and 200-237.
- `conversation_recovered`: 23 capabilities recovered from prior project conversations but without verified Main Legacy identifiers.
- `additional_history`: 5 capabilities recovered from project history and related records.
- `qtos`: 25 independent capabilities from the documented Quantum Traffic Orchestration System package.
- `qcs_recovered`: 3 directly recovered track-local capabilities from the Quantum AI-Enhanced Collision Prevention Sensor sequence: QCS-102 through QCS-104.

Unified registry total: 108 records.

The Main Legacy historical range 15-199 remains reserved pending recovery of reliable direct evidence.

## Namespace separation rule

Main Legacy identifiers, QTOS identifiers and QCS identifiers are separate historical namespaces.

- Main Legacy uses numeric IDs such as `11`, `200`.
- QTOS uses IDs such as `QTOS-01`.
- QCS uses IDs such as `QCS-102`.

A track-local number is never used to fill a missing Main Legacy identifier solely because the number falls inside the same numerical range.

## Main Legacy historical conversation recovery rule

Direct historical conversation retrieval may support promotion to `verified_historical` when a recovered message directly binds all three of the following in one coherent source context:

1. Smart Traffic project identity.
2. Explicit Main Legacy feature number.
3. Explicit feature identity/title or description.

The recovered Smart Traffic assistant output dated `2024-10-17T05:05:26Z` satisfies this rule for features 11-14 and is registered as `CONV-TRAFFIC-2024-10-17-001`.

Recovered Arabic source wording is preserved. English fields created for registry parity are marked as editorial translations where no original English wording was retrieved.

Semantic overlap does not erase the historical record. Feature 11 overlaps `CR-13`, feature 14 overlaps `CR-08`, and later records may overlap features 12-13. These relationships are recorded rather than used to delete either source record.

## QCS direct recovery rule

The QCS sub-innovation is documented under:

- `نظام الاستشعار الكمومي الذكي لمنع التصادم`
- `Quantum AI-Enhanced Collision Prevention Sensor`

Direct historical conversation retrieval from 5 March 2025 re-established QCS-102, QCS-103 and QCS-104. These records are stored in `data/qcs_verified_102_104.json` with `main_legacy_effect: none`.

QCS-102 contains a genuine historical English-title conflict. Both recovered variants are preserved in the record and in `evidence/QCS_RECOVERY_EVIDENCE.md`; neither is silently selected as the single original version.

QCS-101 remains outside the unified registry until a primary source can be independently reopened and reviewed.

## Central evidence framework

All evidence is registered in:

`evidence/EVIDENCE_REGISTER.json`

The register distinguishes:

- archived source artifacts with SHA-256 fingerprints;
- located Library sources where raw-byte repository archival is unavailable;
- direct historical conversation retrieval with source timestamp and covered IDs;
- secondary forensic recovery artifacts used to guide, but not automatically authorize, feature promotion.

Every newly recovered file should be processed using:

`evidence/SOURCE_INTAKE_TEMPLATE.md`

Open recovery targets and unverified leads are tracked separately in:

`evidence/RECOVERY_QUEUE.md`

A recovery lead is not a verified feature record merely because it appears in a later forensic artifact.

## Secondary forensic source — v0.3

`Smart_Traffic_Forensic_Master_Recovery_v0_3.html` was materialized and fingerprinted during recovery.

SHA-256:

`b0ca5ef84694fbbeda22c2c03a04ef8adecc1c968f3dc65b63f0510a1dd484f5`

Parsed Arabic recovery-ledger records: 213.

Confidence distribution:

- A: 73
- B: 79
- B2: 42
- C: 17
- D: 2

This is a secondary forensic recovery artifact. Its confidence labels are preserved as historical recovery metadata but do not automatically convert its records into unified-registry entries. Direct source reopening is preferred before promotion, particularly for Main Legacy numbers inside 15-199.

Examples that remain candidates rather than promoted Main Legacy records include the December 2024 leads around 77, 114-118, 148-149 and 152 unless their primary evidence is independently reopened to the required standard.

## QTOS original source evidence

The original bilingual QTOS source artifact is archived at:

`evidence/source/Smart_Traffic_QTOS_Additional_Features_Bilingual_Standard.html`

Its SHA-256 evidence fingerprint is:

`a0e7bf1e78e2fb271012dbca722b4d03a2a9e957c0a19778353a23e680472d9f`

The complete capability-to-source mapping for `QTOS-01` through `QTOS-25` is maintained at:

`evidence/QTOS_SOURCE_EVIDENCE.md`

The central evidence item for this source is `SRC-QTOS-001`.

## Automated provenance safeguards

The CI provenance validator checks that:

- the registry total and source-group totals remain internally consistent;
- Main Legacy verified IDs stay inside explicitly supported historical ranges;
- QCS records cannot affect the Main Legacy gap;
- every archived evidence item points to an existing artifact with the registered SHA-256;
- located Library sources cannot masquerade as byte-identical repository archives;
- direct conversation evidence for Main Legacy 11-14 remains explicitly mapped;
- direct QCS evidence remains mapped to QCS-102 through QCS-104;
- the QCS-102 historical title conflict remains explicitly preserved;
- forensic v0.3 fingerprint, record count and confidence distribution do not drift silently;
- the Main Legacy historical range 15-199 remains open pending evidence;
- the QTOS source maps to all 25 QTOS identifiers;
- production verification remains separate from source documentation and MVP demonstration.

Where semantic overlap or historical version conflict exists, the source record is preserved rather than deleted. Canonical reconciliation can be introduced as a separate mapping layer after historical recovery is sufficiently complete.
