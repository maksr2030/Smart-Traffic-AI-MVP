# Smart Traffic Historical Recovery Queue

This queue tracks recovery leads. It is not a feature registry and must not be used to assign Main Legacy IDs without direct source evidence.

## Priority 1 — Main Legacy reserved historical range 15-199

Status: OPEN.

Confirmed Main Legacy recovery remains:

- 11 — إشعارات حول جودة الهواء
- 12 — نظام التنبيهات الطارئة
- 13 — تكامل مع وسائل النقل العامة
- 14 — تتبع موقع السيارة

The next contiguous Main Legacy target remains feature 15. Exact searches for 15-30 and sampled anchors through 199 have not independently reopened a new primary Main Legacy record in the current recovery chain.

Normalized candidate map:

`evidence/MAIN_LEGACY_FORENSIC_CANDIDATES_15_199_v0_3.json`

It preserves 23 candidates from the December 2024 recovery tracks. None is promoted yet.

### Highest-priority Main Legacy source-reopening targets

1. 46 — نظام ذكي للتحكم التلقائي بحركة المرور ومنع الازدحام باستخدام الذكاء الاصطناعي — forensic B.
2. 47 — نظام ذكي لإدارة إشارات المرور لمنع الازدحام — forensic B.
3. 114 — نظام ذكي لتقديم حلول مرورية فورية أثناء الأزمات المفاجئة باستخدام الذكاء الاصطناعي — forensic B.
4. 117 — نظام ذكي لتحليل وتقديم حلول ذكية لتقليل الانبعاثات الكربونية في حركة المرور باستخدام الذكاء الاصطناعي — forensic B.
5. 118 — نظام ذكي لتحليل حركة الشاحنات وتحسين كفاءة النقل اللوجستي باستخدام الذكاء الاصطناعي — forensic B.
6. 152 — نظام ذكي للتعرف على المخالفات المرورية في الوقت الفعلي — forensic B.
7. 77 — نظام ذكي لمراقبة وتنظيم حركة الشاحنات الثقيلة — forensic B2.
8. 115 — road-fee management and financial flows — forensic B2.
9. 116 — parking management and financial utilization — forensic B2.
10. 149 — comprehensive AI traffic-violation monitoring platform — forensic B2.
11. 148 — existence lead only; title unrecovered — forensic C.

Current exact Arabic and English searches have not independently reproduced the primary historical messages for these candidates. They therefore remain candidates even where the secondary forensic artifact labels a record as direct or prior conversation recovery.

## Priority 2 — QCS track-local recovery

This is a separate namespace and does not close Main Legacy gaps.

Direct primary conversation recovery completed:

- `QCS-102` — مراقبة أداء الحساسات الكمومية ذاتيًا في الزمن الحقيقي.
- `QCS-103` — تحسين قدرة المركبات ذاتية القيادة على التعامل مع الظروف الجوية القاسية باستخدام الاستشعار الكمومي.
- `QCS-104` — جعل المركبات جزءًا من نظام مرور ذكي متكامل عبر الاستشعار الكمومي المتصل.

Evidence document:

`evidence/QCS_RECOVERY_EVIDENCE.md`

Full forensic candidate map:

`evidence/QCS_FORENSIC_CANDIDATE_MAP_v0_3.json`

The map preserves 54 QCS rows. QCS-102 through QCS-104 are separately promoted from direct evidence; 51 QCS rows remain candidates.

Next source-reopening sequence:

`QCS-101 → QCS-100 → QCS-99 → QCS-98 → QCS-97 → QCS-96 → QCS-95 → QCS-94 → QCS-93`

If a primary block is reopened, continue chronologically around that source rather than assuming missing intermediate numbers.

## Priority 3 — QTC quantum traffic-computing track

QTC is separate from QTOS, QCS and Main Legacy.

Normalized map:

`evidence/QTC_FORENSIC_CANDIDATE_MAP_v0_3.json`

It preserves 14 QTC candidate rows and currently has zero promoted records.

First direct-source targets:

- QTC 46 — تحسين استهلاك الطاقة في البنية التحتية المرورية باستخدام الحوسبة الكمومية.
- QTC 47 — تحسين إدارة إشارات المرور الديناميكية باستخدام الحوسبة الكمومية.
- QTC 48 — تحسين التنبؤ بحركة المرور باستخدام الحوسبة الكمومية.
- QTC 82 — نظام التشفير الفائق الأمان لبيانات المركبات باستخدام الحوسبة الكمومية.
- QTC 83 — تحسين إدارة الطاقة في المركبات الذكية باستخدام الحوسبة الكمومية.

Exact Arabic/English Library searches have not independently located the original QTC source yet. Do not merge QTC numbering with any other namespace.

## Priority 4 — Forensic v0.3 structured recovery map

Source: `Smart_Traffic_Forensic_Master_Recovery_v0_3.html`.

Fingerprint:

`b0ca5ef84694fbbeda22c2c03a04ef8adecc1c968f3dc65b63f0510a1dd484f5`

Parsed Arabic recovery records: 213.

Confidence distribution: A=73, B=79, B2=42, C=17, D=2.

The currently normalized high-value candidate layers preserve:

- 54 QCS rows — 3 promoted direct / 51 still candidates.
- 23 Main Legacy 15-199 candidates — zero promoted.
- 14 QTC candidates — zero promoted.

Total currently unpromoted rows in these three maps: 88.

This does not change the unified registry total of 108.

## Priority 5 — Other historical tracks still to normalize or reopen

- `IDEAS100-2025-02`: only items 1-3 are currently preserved in the forensic artifact; 4-100 remain an open extraction target from the original 100-ideas conversation.
- `OCT17-APP`: 14 unnumbered traffic-app capabilities are preserved in the forensic artifact and should be normalized against the existing `CR` registry before any additional count effect is considered.
- `DEC17-TRAFFIC`: existence-only records around 23-26, 35-39 and 43-45 remain useful neighbor anchors but must not receive invented titles.
- High-number leads 373 and 375 remain unverified and must not be imported without traffic-specific source proof.
- Numbers 272 and 274 previously encountered in unrelated material remain excluded.

## Priority 6 — Other unnumbered candidate capabilities

Recovery leads only:

- Two warnings before issuing a traffic violation.
- Parking-overflow prevention into residential neighborhoods.
- Dedicated mass-event or match traffic management as a separately numbered Main Legacy feature.
- VIP or protected-convoy secure-lane management as a separately numbered Main Legacy feature.
- Immediate and semi-stable congestion interventions pending permanent infrastructure changes as a separately numbered Main Legacy feature.

Existing verified or track-local records may overlap semantically; overlap is not proof of a missing historical number.

## Intake method

For every newly found source:

1. Establish project identity and namespace: Main Legacy, QCS, QTC, QTOS, or another historical track.
2. Require a direct binding between the relevant number and feature identity before promotion.
3. Archive raw bytes and compute SHA-256 when technically available.
4. If byte-level repository archival is unavailable, register the source type explicitly without overstating archival status.
5. Preserve competing historical versions rather than silently reconciling them.
6. Compare against all current registry records for duplicates or semantic overlap.
7. Update a reserved Main Legacy range only for Main Legacy numbers directly recovered.
8. Preserve candidate-map rows even when they overlap existing registry capabilities; use a separate reconciliation mapping rather than deleting history.
9. Run CI provenance validation after every registry or evidence change.
