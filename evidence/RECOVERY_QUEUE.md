# Smart Traffic Historical Recovery Queue

This queue tracks recovery leads. It is not a feature registry and must not be used to assign historical IDs without direct source evidence.

## Priority 1 — Reserved historical range 11-199

Status: OPEN.

Objective: recover original numbered feature records from source files or historical conversation artifacts, preserving exact titles, descriptions, numbering and source provenance.

Promotion rule: a candidate may enter `verified_historical` only when a reliable source directly supports the legacy number and feature identity.

Latest controlled search round: `evidence/RECOVERY_SEARCH_LOG_2026-08-12.md`.

Current result: no directly numbered Smart Traffic feature in range `11-199` has yet been recovered.

## Located source anchors

Two original Smart Traffic Library sources are now registered as located-but-not-byte-archived anchors:

- `LOC-TRAFFIC-AR-001` — `المرور الذكي.html` — confirms Arabic historical block `1-10`.
- `LOC-TRAFFIC-EN-001` — `Smart AI Traffic.html` — corroborates the original English source family and initial feature block.

Both were searched for headings in `11-199`; none were recovered. Raw-byte materialization was unavailable through the Library connector during intake, so no SHA-256 or byte-identical archival claim is made for these two sources.

## Priority 2 — Unnumbered candidate capabilities requiring source confirmation

The following are recovery leads only. They are not independently verified historical records:

- Two warnings before issuing a traffic violation.
- Parking-overflow prevention into residential neighborhoods.
- Dedicated mass-event or match traffic management as a separately numbered historical feature.
- VIP or protected-convoy secure-lane management as a separately numbered historical feature.
- Immediate and semi-stable congestion interventions pending permanent infrastructure changes as a separately numbered feature.

Existing verified records may overlap semantically with some of these concepts; overlap is not proof of a missing historical number.

## Priority 3 — High-number historical leads

- Traffic legacy identifiers 373 and 375 remain unverified leads and must not be entered into the verified registry without direct evidence.
- Historical numbers 272 and 274 previously encountered in unrelated material must not be imported into the traffic registry without traffic-specific source proof.

## Intake method

For every newly found file:

1. Identify whether raw-byte archival is technically available.
2. If available, archive the original file under `evidence/source/` without rewriting substantive content and compute SHA-256.
3. If raw-byte archival is unavailable but the source is readable, register it as `located_library_source_not_byte_archived` with its Library file ID; do not claim byte-identical archival.
4. Identify exact numbered features and surrounding context.
5. Compare against all current registry records for duplicates or semantic overlap.
6. Add only genuinely supported new records.
7. Preserve unresolved conflicts as evidence notes rather than forcing a canonical number.
8. Run CI provenance validation after every registry or evidence change.
