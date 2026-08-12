# Feature Provenance Policy

The MVP registry preserves source provenance and does not fill historical numbering gaps by invention.

Source groups:

- `verified_historical`: 48 records with verified historical identifiers in ranges 1-10 and 200-237.
- `conversation_recovered`: 23 capabilities recovered from prior project conversations but without verified historical identifiers.
- `additional_history`: 5 capabilities recovered from project history and related records.
- `qtos`: 25 independent capabilities from the documented Quantum Traffic Orchestration System package.

The historical range 11-199 remains reserved pending recovery of reliable original evidence.

QTOS identifiers such as `QTOS-01` are capability identifiers in a separate sub-innovation namespace. They are not legacy feature numbers and must not be used to overwrite missing historical identifiers.

Where semantic overlap exists, the source record is preserved rather than deleted. Canonical deduplication can be introduced as a separate mapping layer after historical recovery is sufficiently complete.
