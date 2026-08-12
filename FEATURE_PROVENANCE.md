# Feature Provenance Policy

The MVP registry preserves source provenance and does not fill historical numbering gaps by invention.

Source groups:

- `verified_historical`: 48 records with verified historical identifiers in ranges 1-10 and 200-237.
- `conversation_recovered`: 23 capabilities recovered from prior project conversations but without verified historical identifiers.
- `additional_history`: 5 capabilities recovered from project history and related records.
- `qtos`: 25 independent capabilities from the documented Quantum Traffic Orchestration System package.

The historical range 11-199 remains reserved pending recovery of reliable original evidence.

QTOS identifiers such as `QTOS-01` are capability identifiers in a separate sub-innovation namespace. They are not legacy feature numbers and must not be used to overwrite missing historical identifiers.

## QTOS original source evidence

The original bilingual QTOS source artifact supplied by the project owner is archived verbatim at:

`evidence/source/Smart_Traffic_QTOS_Additional_Features_Bilingual_Standard.html`

Its SHA-256 evidence fingerprint is:

`a0e7bf1e78e2fb271012dbca722b4d03a2a9e957c0a19778353a23e680472d9f`

The complete capability-to-source mapping for `QTOS-01` through `QTOS-25` is maintained at:

`evidence/QTOS_SOURCE_EVIDENCE.md`

The CI provenance validator checks that the archived source artifact remains byte-identical to this fingerprint, that all 25 QTOS identifiers remain present, and that their source field remains `QTOS Additional Features Bilingual Standard`.

Archiving this source strengthens documentary provenance but does not change the registry count: the 25 QTOS capabilities were already included in the unified total of 101 source records.

Where semantic overlap exists, the source record is preserved rather than deleted. Canonical deduplication can be introduced as a separate mapping layer after historical recovery is sufficiently complete.
