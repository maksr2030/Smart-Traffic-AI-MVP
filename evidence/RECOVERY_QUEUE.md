# Smart Traffic Historical Recovery Queue

This queue tracks recovery leads. It is not a feature registry and must not be used to assign historical IDs without direct source evidence.

## Priority 1 — Reserved historical range 15-199

Status: OPEN.

Recovered breakthrough: historical Smart Traffic features `11-14` were directly retrieved from a single assistant output dated `2024-10-17T05:05:26Z` in the Smart Traffic project context and have been promoted to `verified_historical`.

Recovered titles:

- 11 — إشعارات حول جودة الهواء
- 12 — نظام التنبيهات الطارئة
- 13 — تكامل مع وسائل النقل العامة
- 14 — تتبع موقع السيارة

The next active target is feature 15 and onward. A targeted search for exact Smart Traffic feature outputs in the range 15-30 did not return a directly retrievable numbered hit in this round, so the range remains open rather than inferred.

Promotion rule: a candidate may enter `verified_historical` only when a reliable source directly supports the legacy number and feature identity.

## Located source anchors

- `LOC-TRAFFIC-AR-001` — `المرور الذكي.html` — confirms Arabic historical block `1-10`.
- `LOC-TRAFFIC-EN-001` — `Smart AI Traffic.html` — corroborates the original English source family and initial feature block.
- `CONV-TRAFFIC-2024-10-17-001` — direct historical conversation retrieval — confirms `11-14`.

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

For every newly found source:

1. Establish project identity and source type.
2. Require a direct binding between legacy number and feature identity.
3. Archive raw bytes and compute SHA-256 when technically available.
4. If raw-byte archival is unavailable, register the source type explicitly without claiming byte-identical archival.
5. Compare against all current registry records for duplicates or semantic overlap.
6. Preserve historical originals even when later records overlap semantically.
7. Update the reserved range only for numbers directly recovered.
8. Run CI provenance validation after every registry or evidence change.
