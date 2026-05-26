---
title: "How We Optimized BigQuery Partition Filtering"
lang: en
tags:
  - sql-bigquery
  - analytics-engineering
---

# Table of contents
1. Background
2. Scenario design
3. Initial approach
4. What went wrong
5. New approach
6. Closing thoughts
7. Postscript

---

# 1. Background

At IOTRUST we operate the **D'CENT Wallet** app, and like most product teams we collect app usage data through **GA4** and stream it into **BigQuery**. On top of that warehouse we run:

- **BI dashboards** — Redash
- **Core-metric alerts** — Slack via the Slack API
- **Ad-hoc analysis** — Python and DBeaver clients

![]({{ site.baseurl }}/assets/2024-09-04-how-we-optimized-bigquery-partition-filtering/1.webp)

> D'CENT app data pipeline

Early on, every team was reading the **GA4 Export source tables directly** to build dashboards and run analyses. That approach quickly started to creak:

1. The source tables kept growing, so per-query scan cost rose accordingly.
2. The schema is full of nested-repeated columns (`event_params`, `user_properties`, `items`), which raised the bar for non-engineers to query it.
3. We wanted to extend the warehouse with **text-to-SQL** features later on, which only works well when the underlying data mart has clean, well-defined tables.

With those problems in mind, the first step was to use **dbt** to build out the **Core Layer** of the warehouse.

![]({{ site.baseurl }}/assets/2024-09-04-how-we-optimized-bigquery-partition-filtering/2.webp)

> Author's illustration

---

# 2. Scenario design

While designing the central Fact table for all event logs — `fct_events` — we ran into an unexpected wall: **the update cadence of the GA4 Export source tables is irregular.**

There are two types of tables to deal with:

- **`events_YYYYMMDD`** — daily-partitioned event logs
- **`events_intraday_YYYYMMDD`** — real-time-streamed intraday event logs

![]({{ site.baseurl }}/assets/2024-09-04-how-we-optimized-bigquery-partition-filtering/3.webp)

> Author's illustration

Both tables effectively take about **3 days** to settle into their final shape:

- `events_YYYYMMDD` is typically created 1–2 days after the actual event date, and additional rows trickle in for another day after that before the partition is "done".
- `events_intraday_YYYYMMDD` is created in real time, but it is missing some fields (notably UTM parameters), so the rows ultimately have to be re-migrated into the corresponding `events_YYYYMMDD` partition for full fidelity.

You can see this in the `__TABLES__` metadata:

```sql
SELECT
    table_id,
    FORMAT_TIMESTAMP('%F %T', TIMESTAMP_MILLIS(creation_time))      AS creation_time,
    FORMAT_TIMESTAMP('%F %T', TIMESTAMP_MILLIS(last_modified_time)) AS last_modified_time
FROM
    `project_id.dataset_id.__TABLES__`
WHERE
    STARTS_WITH(table_id, 'events_') = TRUE
    OR STARTS_WITH(table_id, 'events_intraday_') = TRUE
ORDER BY
    table_id DESC
```

![]({{ site.baseurl }}/assets/2024-09-04-how-we-optimized-bigquery-partition-filtering/4.webp)

> Each D'CENT `date` partition table keeps receiving updates for 2–3 days after creation.

Because the value of data drops sharply when it lags, we needed a warehouse with **no 3-day delay** — every `date` partition should reflect both the initial creation and any later modifications **as soon as they happen**.

So we designed the following scenario:

- New `date` partitions should be picked up by orchestration in real time.
- Existing `date` partitions should also be re-processed whenever they receive a late update.

![]({{ site.baseurl }}/assets/2024-09-04-how-we-optimized-bigquery-partition-filtering/5.webp)

> Author's illustration

In other words: **dynamically detect creation and updates of each `date` partition in real time, and reflect those changes across every downstream warehouse table.**

---

# 3. Initial approach

Our first instinct was to solve this entirely inside BigQuery, using dbt.

**(1) `stg_ga4_tables.sql`** — an **Ephemeral** model that queries `__TABLES__` to get the latest metadata for every partition:

```sql
SELECT
    table_id,
    RIGHT(table_id, 8) AS table_suffix,
    CASE
        WHEN CONTAINS_SUBSTR(table_id, 'intraday') THEN 'intraday'
        ELSE 'daily'
    END AS table_type,
    creation_time      AS creation_timestamp_millis,
    last_modified_time AS last_modified_timestamp_millis
FROM
    `project_id.dataset_id.__TABLES__`
WHERE
    STARTS_WITH(table_id, 'events_') = TRUE
    OR STARTS_WITH(table_id, 'events_intraday_') = TRUE
```

**(2) `fct_events.sql`** — an **Incremental** model that dynamically filters source-table partitions using the metadata above:

```sql
-- depends_on: {% raw %}{{ ref('stg_ga4_tables') }}{% endraw %}
SELECT
    ...
FROM
    `project_id.dataset_id.events_*`
WHERE
    ...
    {% raw %}{% if var("last_run_timestamp_millis", None) is not none %}{% endraw %}
    AND _table_suffix IN (
        SELECT
            table_suffix
        FROM
            {% raw %}{{ ref('stg_ga4_tables') }}{% endraw %}
        WHERE
            {% raw %}{{ var("last_run_timestamp_millis") }}{% endraw %} < last_modified_timestamp_millis
            AND table_type = 'daily'
    )
    {% raw %}{% endif %}{% endraw %}
```

The idea: compare the dbt variable `last_run_timestamp_millis` (set at orchestration time) against `last_modified_timestamp_millis` from the metadata table, and pull only the partitions that have been touched since the last run — so we never have to do a full scan.

---

# 4. What went wrong

It didn't work — and not in a small way. The symptom was severe: **"Partition filtering was not being applied as intended, so every orchestration run scanned the entire source table and racked up a huge query bill."**

If you read the compiled BigQuery SQL, it looks logically correct. But the partition filter is silently a no-op:

```sql
SELECT
    ...
FROM
    `project_id.dataset_id.events_*`
WHERE
    _table_suffix IN (
        SELECT
            table_suffix
        FROM (
            SELECT
                table_id,
                RIGHT(table_id, 8) AS table_suffix,
                CASE
                    WHEN CONTAINS_SUBSTR(table_id, 'intraday') THEN 'intraday'
                    ELSE 'daily'
                END AS table_type,
                creation_time      AS creation_timestamp_millis,
                last_modified_time AS last_modified_timestamp_millis
            FROM
                `project_id.dataset_id.__TABLES__`
            WHERE
                STARTS_WITH(table_id, 'events_') = TRUE
                OR STARTS_WITH(table_id, 'events_intraday_') = TRUE
        )
        WHERE
            1725189555000 < last_modified_timestamp_millis
            AND table_type = 'daily'
    )
```

![]({{ site.baseurl }}/assets/2024-09-04-how-we-optimized-bigquery-partition-filtering/6.webp)

> Testing on the BigQuery Public Datasets GA4 Export sample shows the partition filter is not applied.

**Why?** Because the approach violated **BigQuery's partition pruning rules**.

Partition pruning is the Google Cloud mechanism that lets BigQuery skip unnecessary partitions and avoid charging for them. But per the official documentation:

> "Do not use partition filters as dynamic expressions."
>
> "The following query does not prune partitions because the `WHERE t1.ts = (SELECT timestamp from table where key = 2)` filter is not a constant expression."

In other words, BigQuery decides whether it can prune partitions **at Dry Run time** — and at Dry Run time, the partition filter needs to be a **constant expression**. Our original design pushed partition management into a subquery so it could be "dynamic", and that's exactly the shape BigQuery refuses to prune.

---

# 5. New approach

Instead of trying to manage the partition list entirely inside BigQuery, we moved that responsibility out to the orchestration layer (Airflow) and fed BigQuery a **static** list of partition suffixes through a dbt variable.

**(1) `dag.py`** — the Airflow DAG's `main()` queries the metadata table and serializes the result into the environment variable `table_suffixes`.

For example: `table_suffixes = "20240901,20240902,20240903"`

```python
...
query = f"""
    WITH
    CTE_tables AS (
        SELECT
            table_id,
            RIGHT(table_id, 8) AS table_suffix,
            CASE
                WHEN CONTAINS_SUBSTR(table_id, 'intraday') THEN 'intraday'
                ELSE 'daily'
            END AS table_type,
            creation_time      AS creation_timestamp_millis,
            last_modified_time AS last_modified_timestamp_millis
        FROM
            `{bigquery_table_id}`
        WHERE
            STARTS_WITH(table_id, 'events_') = TRUE
            OR STARTS_WITH(table_id, 'events_intraday_') = TRUE
    )
    SELECT
        table_suffix
    FROM
        CTE_tables
    WHERE
        {last_run_timestamp_millis} < last_modified_timestamp_millis
"""

df = bigquery_client.query(query).to_dataframe()
table_suffixes = df.table_suffix.tolist()

if table_suffixes:
    table_suffixes = ','.join(table_suffixes)
...
```

**(2) `fct_events.sql`** — `_table_suffix` is now compared directly against the `table_suffixes` variable, which arrives as a literal string at compile time:

```sql
-- depends_on: {% raw %}{{ ref('stg_ga4_tables') }}{% endraw %}
SELECT
    ...
FROM
    `project_id.dataset_id.events_*`
WHERE
    ...
    {% raw %}{% if var("table_suffixes", None) is not none %}{% endraw %}
    AND _table_suffix IN ('{% raw %}{{ var("table_suffixes") }}{% endraw %}')
    {% raw %}{% endif %}{% endraw %}
```

Now the partition filter compiles into a **constant expression**, BigQuery can prune partitions at Dry Run time as expected, and **the full scans stop** — giving us the cost optimization we were after.

---

# 6. Closing thoughts

Before this exercise, I had been using BigQuery's partitioning features passively — turning them on, trusting that things would be cheap, and never really learning **how** partition pruning actually decides what to skip. Building out the warehouse forced me to confront two things I'd taken for granted:

- BigQuery makes the partition-pruning decision **at Dry Run time** (i.e. before the query actually runs).
- For pruning to fire, the partition filter has to satisfy specific shape requirements — chief among them, it must be a constant expression.

There's a particular kind of learning that only comes from running into a wall and digging your way out of it. That hands-on debugging cycle made me far more comfortable inside BigQuery and, as a side effect, made our whole data platform meaningfully more efficient.

Thanks for reading!

![]({{ site.baseurl }}/assets/2024-09-04-how-we-optimized-bigquery-partition-filtering/7.webp)

> Data Analytics Survival community KakaoTalk open-chat room

---

# 7. Postscript

A big thank-you to the members of the **"데이터 분석으로 생존하기" (Surviving via Data Analytics)** community KakaoTalk room, who tossed ideas back and forth with me while I was working through this problem.

![]({{ site.baseurl }}/assets/2024-09-04-how-we-optimized-bigquery-partition-filtering/8.webp)

> Data Analytics Survival community KakaoTalk open-chat room

---
