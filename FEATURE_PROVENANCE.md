# Feature Provenance Policy

The MVP registry preserves source provenance and does not fill historical numbering gaps by invention.

Source groups:

- `verified_historical`: 52 records with verified historical identifiers in ranges 1-14 and 200-237.
- `conversation_recovered`: 23 capabilities recovered from prior project conversations but without verified historical identifiers.
- `additional_history`: 5 capabilities recovered from project history and related records.
- `qtos`: 25 independent capabilities from the documented Quantum Traffic Orchestration System package.

The historical range 15-199 remains reserved pending recovery of reliable evidence.

## Historical conversation recovery rule

Direct historical conversation retrieval may support promotion to `verified_historical` when a recovered message directly binds all three of the following in one coherent source context:

1. Smart Traffic project identity.
2. Explicit legacy feature number.
3. Explicit feature identity/title or description.

The recovered Smart Traffic assistant output dated `2024-10-17T05:05:26Z` satisfies this rule for features 11-14 and is registered as `CONV-TRAFFIC-2024-10-17-001`.

Recovered Arabic source wording is preserved. English fields created for registry parity are marked as editorial translations where no original English wording was retrieved.

Semantic overlap does not erase the historical record. For example, feature 11 overlaps `CR-13`, feature 14 overlaps `CR-08`, and later records may overlap features 12-13. These relationships are recorded rather than used to delete either source record.

QTOS identifiers such as `QTOS-01` are capability identifiers in a separate sub-innovation namespace. They are not legacy feature numbers and must not be used to overwrite missing historical identifiers.

## Central evidence framework

All evidence is registered in:

`evidence/EVIDENCE_REGISTER.json`

The register distinguishes:

- archived source artifacts with SHA-256 fingerprints;
- located Library sources where raw-byte archival is unavailable;
- direct historical conversation retrieval with timestamp and covered IDs.

Every newly recovered file should be processed using:

`evidence/SOURCE_INTAKE_TEMPLATE.md`

Open recovery targets and unverified leads are tracked separately in:

`evidence/RECOVERY_QUEUE.md`

A recovery lead is not a feature record and must not be promoted to `verified_historical` until direct evidence establishes the legacy identifier and feature identity.

## QTOS original source evidence

The original bilingual QTOS source artifact supplied by the project owner is archived verbatim at:

`evidence/source/Smart_Traffic_QTOS_Additional_Features_Bilingual_Standard.html`

Its SHA-256 evidence fingerprint is:

`a0e7bf1e78e2fb271012dbca722b4d03a2a9e957c0a19778353a23e680472d9f`

The complete capability-to-source mapping for `QTOS-01` through `QTOS-25` is maintained at:

`evidence/QTOS_SOURCE_EVIDENCE.md`

The central evidence item for this source is `SRC-QTOS-001`.

## Automated provenance safeguards

The CI provenance validator checks that:

- the registry total and source-group totals remain internally consistent;
- verified historical IDs stay inside explicitly supported historical ranges;
- every archived evidence item points to an existing artifact with the registered SHA-256;
- located Library sources cannot masquerade as byte-identical archives;
- direct conversation evidence for features 11-14 remains explicitly mapped to those IDs;
- the reserved historical range 15-199 remains open pending evidence;
- the QTOS source maps to all 25 QTOS identifiers;
- production verification remains separate from source documentation and MVP demonstration.

Where semantic overlap exists, the source record is preserved rather than deleted. Canonical deduplication can be introduced as a separate mapping layer after historical recovery is sufficiently complete.
