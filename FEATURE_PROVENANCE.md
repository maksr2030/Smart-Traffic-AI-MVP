# Feature Provenance Policy

The MVP registry preserves source provenance and does not fill historical numbering gaps by invention.

Source groups:

- `verified_historical`: 48 records with verified historical identifiers in ranges 1-10 and 200-237.
- `conversation_recovered`: 23 capabilities recovered from prior project conversations but without verified historical identifiers.
- `additional_history`: 5 capabilities recovered from project history and related records.
- `qtos`: 25 independent capabilities from the documented Quantum Traffic Orchestration System package.

The historical range 11-199 remains reserved pending recovery of reliable original evidence.

QTOS identifiers such as `QTOS-01` are capability identifiers in a separate sub-innovation namespace. They are not legacy feature numbers and must not be used to overwrite missing historical identifiers.

## Central evidence framework

All archived source evidence is registered in:

`evidence/EVIDENCE_REGISTER.json`

This machine-readable register records the evidence ID, archived path, SHA-256 fingerprint, capability IDs covered by the source, optional mapping document and whether the source changes the unified registry count.

Every newly recovered source should be processed using:

`evidence/SOURCE_INTAKE_TEMPLATE.md`

Open recovery targets and unverified leads are tracked separately in:

`evidence/RECOVERY_QUEUE.md`

A recovery lead is not a feature record and must not be promoted to `verified_historical` until direct source evidence establishes the legacy identifier and feature identity.

## QTOS original source evidence

The original bilingual QTOS source artifact supplied by the project owner is archived verbatim at:

`evidence/source/Smart_Traffic_QTOS_Additional_Features_Bilingual_Standard.html`

Its SHA-256 evidence fingerprint is:

`a0e7bf1e78e2fb271012dbca722b4d03a2a9e957c0a19778353a23e680472d9f`

The complete capability-to-source mapping for `QTOS-01` through `QTOS-25` is maintained at:

`evidence/QTOS_SOURCE_EVIDENCE.md`

The central evidence item for this source is `SRC-QTOS-001`.

Archiving this source strengthens documentary provenance but does not change the registry count: the 25 QTOS capabilities were already included in the unified total of 101 source records.

## Automated provenance safeguards

The CI provenance validator checks that:

- the registry total and source-group totals remain internally consistent;
- verified historical IDs stay inside explicitly supported historical ranges;
- every evidence item points to an existing archived artifact;
- archived source SHA-256 fingerprints remain unchanged;
- every capability referenced by an evidence item exists in the registry;
- the reserved historical range 11-199 remains open pending original evidence;
- the QTOS source maps to all 25 QTOS identifiers;
- archived evidence cannot silently increase the registry count;
- production verification remains separate from source documentation and MVP demonstration.

Where semantic overlap exists, the source record is preserved rather than deleted. Canonical deduplication can be introduced as a separate mapping layer after historical recovery is sufficiently complete.
