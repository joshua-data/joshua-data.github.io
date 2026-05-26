---
title: "Issues I Faced When Unifying Accumulating Snapshot and Transactional Fact Tables"
lang: en
tags:
  - analytics-engineering
  - data-modeling
  - sql-bigquery
---

> "I want to share the trade-offs I ran into when I tried to fold an Accumulating Snapshot Fact table and a Transactional Fact table into a single unified Fact table with Union All — and the framework I landed on for deciding when it's actually worth doing."

---

# Table of Contents
1. **Prerequisites for reading this post**
2. **Background**
3. **Characteristics of the two tables**
4. **Union All modeling strategies — three cases**
5. **So what's the best approach?**
6. **Am I really right about this?**

---

# ☑️ 1. Prerequisites for reading this post

- Basic familiarity with dbt modeling
- Fact table types (Transactional / Periodic Snapshot / Accumulating Snapshot)
- BigQuery partitioning concepts

---

# ☑️ 2. Background

> "What if I Union All the Accumulating Snapshot Fact table and the Transactional Fact table into a single combined Fact table, just to simplify the read-side queries?"

That was the question that kicked this off. The idea was that if every event a user produces lives in one All Fact table, downstream analysts can stop joining (or `UNION`ing) two differently shaped tables every time, and the metrics they ship become more consistent.

![]({{ site.baseurl }}/assets/2025-07-16-issues-i-faced-when-unifying-accumulating-snapshot-and-transactional-fact-tables/1.webp)

The plan was to materialize this unified table with dbt's Incremental Strategy. That's where the trouble started.

---

# ☑️ 3. Characteristics of the two tables

### 3.1. Accumulating Snapshot Fact Table

- A single record represents the entire lifecycle of a transaction, and that record is **progressively updated** as the state moves forward (e.g. Initiated → Completed).
- Uses `created_at`, `updated_at`, and `status` columns to track state.
- Loaded via **upsert**.
- Partition Key: `date(created_at)`

![]({{ site.baseurl }}/assets/2025-07-16-issues-i-faced-when-unifying-accumulating-snapshot-and-transactional-fact-tables/2.webp)

### 3.2. Transactional Fact Table

- A new record is created for every event (**append-only**).
- Records are never updated — each row is immutable.
- Partition Key: `date(created_at)`

![]({{ site.baseurl }}/assets/2025-07-16-issues-i-faced-when-unifying-accumulating-snapshot-and-transactional-fact-tables/3.webp)

---

# ☑️ 4. Union All modeling strategies — three cases

To `UNION ALL` these two tables into one incremental dbt model, the central question is: **which column do I use as the incremental watermark?** That single choice ripples into recency, completeness, cost, and usability. Below are the three cases I considered.

### 4.1. Case 1 — Incremental load on `created_at`

**Pros**
- Newly created accumulating-snapshot transactions land in the All Fact table immediately (strong **recency**).

**Cons**
- Subsequent `updated_at` changes on an accumulating-snapshot row are **never picked up again** once that row's `created_at` partition has been processed (weak **completeness**).

```sql
with

fact__accmulating_fact_events as (
  select
    user_id,
    'purchase' as event_name,
    created_at,
    updated_at,
  from
    {% raw %}{{ source('events', 'fact__accmulating_fact_events') }}{% endraw %}
  where true
    {% raw %}{% if is_incremental() %}{% endraw %}
    and (select max(date(created_at)) from {% raw %}{{ this }}{% endraw %}) < date(created_at)
    and date(created_at) < current_date()
    {% raw %}{% endif %}{% endraw %}
),

fact__transactional_fact_events as (
  select
    user_id,
    event_name,
    created_at,
    created_at as updated_at,
  from
    {% raw %}{{ source('events', 'fact__transactional_fact_events') }}{% endraw %}
  where true
    {% raw %}{% if is_incremental() %}{% endraw %}
    and (select max(date(created_at)) from {% raw %}{{ this }}{% endraw %}) < date(created_at)
    and date(created_at) < current_date()
    {% raw %}{% endif %}{% endraw %}
)

select * from fact__accmulating_fact_events
union all
select * from fact__transactional_fact_events
```

```yaml
models:
  - name: fact__all_events
    description: |
      Unified user-event fact table
      - Grain: user_id, created_at
      - Partition Key: created_at
    meta:
      owner: Joshua Kim
    config:
      tags: ["fact", "...", "..."]
      materialized: incremental
      incremental_strategy: insert_overwrite
      on_schema_change: append_new_columns
      partition_by:
        field: created_at
        data_type: datetime
        granularity: day
      time_ingestion_partitioning: true
      require_partition_filter: true
      copy_partitions: true
    columns:
      - name: ...
        description: ...
```

### 4.2. Case 2 — Incremental load on `updated_at`

**Pros**
- Only fully-settled transaction states get loaded, so each row in the All Fact table is effectively immutable (strong **completeness**).

**Cons**
- Rows don't show up until the transaction has actually completed (weak **recency**).
- The source tables are partitioned on `created_at`, so filtering on `updated_at` **can't leverage the source partition filter** — every incremental run pays for a wider scan (weak **cost-efficiency**).
- Downstream users almost always filter by `created_at`, not by the table's `updated_at` partition key, so the table is harder to use correctly (weak **usability**).

```sql
with

fact__accmulating_fact_events as (
  select
    user_id,
    'purchase' as event_name,
    created_at,
    updated_at,
  from
    {% raw %}{{ source('events', 'fact__accmulating_fact_events') }}{% endraw %}
  where true
    {% raw %}{% if is_incremental() %}{% endraw %}
    and (select max(date(updated_at)) from {% raw %}{{ this }}{% endraw %}) < date(updated_at)
    and date(updated_at) < current_date()
    {% raw %}{% endif %}{% endraw %}
),

fact__transactional_fact_events as (
  select
    user_id,
    event_name,
    created_at,
    created_at as updated_at,
  from
    {% raw %}{{ source('events', 'fact__transactional_fact_events') }}{% endraw %}
  where true
    {% raw %}{% if is_incremental() %}{% endraw %}
    and (select max(date(updated_at)) from {% raw %}{{ this }}{% endraw %}) < date(updated_at)
    and date(updated_at) < current_date()
    {% raw %}{% endif %}{% endraw %}
)

select * from fact__accmulating_fact_events
union all
select * from fact__transactional_fact_events
```

```yaml
models:
  - name: fact__all_events
    description: |
      Unified user-event fact table
      - Grain: user_id, created_at
      - Partition Key: updated_at
    meta:
      owner: Joshua Kim
    config:
      tags: ["fact", "...", "..."]
      materialized: incremental
      incremental_strategy: insert_overwrite
      on_schema_change: append_new_columns
      partition_by:
        field: updated_at
        data_type: datetime
        granularity: day
      time_ingestion_partitioning: true
      require_partition_filter: true
      copy_partitions: true
    columns:
      - name: ...
        description: ...
```

### 4.3. Case 3 — `created_at`-based load with a rolling N-day window (e.g. 7 days)

**Pros**
- Splits the difference between Case 1 and Case 2 — strong on both **recency** and **completeness** for the typical case.

**Cons**
- There's no hard guarantee that every accumulating-snapshot transaction completes within 7 days. If a transaction takes longer, its late `updated_at` change still gets missed (incomplete **completeness**).

> **⚠️ Critical caveat:** in this approach **both source CTEs must apply the exact same N-day window**. Because `incremental_strategy: insert_overwrite` rewrites every partition that appears in the incremental query, if only one of the two CTEs touches a given partition, the other source's rows in that partition will be **silently deleted**.

```sql
with

fact__accmulating_fact_events as (
  select
    user_id,
    'purchase' as event_name,
    created_at,
    updated_at,
  from
    {% raw %}{{ source('events', 'fact__accmulating_fact_events') }}{% endraw %}
  where true
    {% raw %}{% if is_incremental() %}{% endraw %}
    and (select max(date(created_at)) - interval 7 day from {% raw %}{{ this }}{% endraw %}) < date(created_at)
    and date(created_at) < current_date()
    {% raw %}{% endif %}{% endraw %}
),

fact__transactional_fact_events as (
  select
    user_id,
    event_name,
    created_at,
    created_at as updated_at,
  from
    {% raw %}{{ source('events', 'fact__transactional_fact_events') }}{% endraw %}
  where true
    {% raw %}{% if is_incremental() %}{% endraw %}
    and (select max(date(created_at)) - interval 7 day from {% raw %}{{ this }}{% endraw %}) < date(created_at)
    and date(created_at) < current_date()
    {% raw %}{% endif %}{% endraw %}
)

select * from fact__accmulating_fact_events
union all
select * from fact__transactional_fact_events
```

```yaml
models:
  - name: fact__all_events
    description: |
      Unified user-event fact table
      - Grain: user_id, created_at
      - Partition Key: created_at
    meta:
      owner: Joshua Kim
    config:
      tags: ["fact", "...", "..."]
      materialized: incremental
      incremental_strategy: insert_overwrite
      on_schema_change: append_new_columns
      partition_by:
        field: created_at
        data_type: datetime
        granularity: day
      time_ingestion_partitioning: true
      require_partition_filter: true
      copy_partitions: true
    columns:
      - name: ...
        description: ...
```

---

# ☑️ 5. So what's the best approach?

There is no universal winner — the right call depends on **what the mart is for**.

### 5.1. Analytical marts serving a broad set of stakeholders (analysts, POs, etc.)

→ **Case 3 is the sweet spot.** You get most of the **recency** of Case 1 and most of the **completeness** of Case 2, and the act of unifying the two Fact tables gives stakeholders a single, consistent surface to query — a big win for **usability**.

### 5.2. Operations-critical marts where accuracy is non-negotiable

→ **Keep the two tables separate.** Operational contexts (settlement, payouts, anything customer-facing) can't accept the small leaks of recency or completeness that any windowed approach introduces, even if separating tables hurts **usability**. In that case, the better lever for **usability** is **not** modeling — it's encapsulation. Wrap the join logic in a function so users call one thing instead of writing the same `UNION` boilerplate everywhere. I wrote about that pattern here: [Automating Marketing Event Reconciliation Queries with BigQuery TVFs]({{ site.baseurl }}/automating-marketing-event-reconciliation-queries-with-bigquery-tvfs-en/).

---

# ☑️ 6. Am I really right about this?

I did consider going the BigQuery `MERGE` route for the accumulating-snapshot side so that I could update in place instead of overwriting partitions. I rejected it: merging at the Fact level scans the full target table for matching keys on every run, which trends toward O(n²) work as the table grows — a serious **cost-efficiency** liability for a high-volume Fact table.

That's the framework I'm using today, but I'd genuinely love to hear better ones. If you've found an approach that beats Case 3 across **recency**, **completeness**, **cost-efficiency**, and **usability** at the same time, please share — I'm all ears.
