# Smart Traffic Historical Recovery Queue

This queue tracks recovery leads. It is not a feature registry and must not be used to assign historical IDs without direct source evidence.

## Priority 1 — Reserved historical range 11-199

Status: OPEN.

Objective: recover original numbered feature records from source files or historical conversation artifacts, preserving exact titles, descriptions, numbering and source provenance.

Promotion rule: a candidate may enter `verified_historical` only when a reliable source directly supports the legacy number and feature identity.

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

1. Archive the original file under `evidence/source/` without rewriting its substantive content.
2. Compute and record SHA-256.
3. Identify exact numbered features and surrounding context.
4. Compare against all current registry records for duplicates or semantic overlap.
5. Add only genuinely supported new records.
6. Preserve unresolved conflicts as evidence notes rather than forcing a canonical number.
7. Run CI provenance validation after every registry or evidence change.
