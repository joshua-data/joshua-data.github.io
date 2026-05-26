---
title: "Combining Daily, Weekly, and Monthly Loads into a Single DAG with a dbt Incremental Macro"
lang: en
tags:
  - analytics-engineering
  - data-engineering
  - sql-bigquery
---

> _"Many companies operate their orchestration environments by splitting Airflow DAGs into Daily, Weekly, and Monthly variants. But this often creates big headaches on both the maintenance and the communication side. In this post I'll share an approach where every model stays idempotent regardless of execution frequency, so the whole pipeline can run stably on a single daily DAG."_

## [Table of Contents]
- A case study: DAU and MAU snapshot models
- My approach: building a dbt incremental-load automation macro
- The payoff: operating with just one Airflow DAG

## A case study: DAU and MAU snapshot models

Let's start with two snapshot models that almost every company has: **Daily Active Users (DAU)** and **Monthly Active Users (MAU)**.

```sql
select
    date,
    count(distinct user_id) as users
from
    {% raw %}{{ ref('all_events_table') }}{% endraw %}
group by
    all
order by
    1
```

```sql
select
    date_trunc(date, month) as date,
    count(distinct user_id) as users
from
    {% raw %}{{ ref('all_events_table') }}{% endraw %}
group by
    all
order by
    1
```

These two models look simple enough, but the moment you try to apply an **incremental strategy** to them, things get confusing. Because the two models live on different time grains, it isn't obvious what the "right" load target is for any given run.

This leads to a chain of practical problems:

- If a Monthly DAG fails, retroactively patching the data becomes painful.
- It's unclear which DAG period a given model is supposed to belong to.
- It becomes hard for data analysts to manage metrics that need to be combined across multiple periodicities.

## My approach: building a dbt incremental-load automation macro

To untangle this, I wrote a small dbt macro that automates the incremental-load filter based on the interval the model cares about.

```jinja
{% raw %}{% macro incremental_partition_filter(col_name, interval) %}

    and {{ col_name }} between
        date_trunc(date_sub(date('{{ var("batch_start_date") }}'), interval 1 day), {{ interval }})
        and date_sub(date('{{ var("batch_end_date") }}'), interval 1 day)

{% endmacro %}{% endraw %}
```

For example, for a batch executed on **November 1, 2025 (Saturday)**, the macro compiles to the following filter, depending on the `interval` value:

```sql
-- Daily:   and date between date('2025-10-31') and date('2025-10-31')
-- Weekly:  and date between date('2025-10-26') and date('2025-10-31')
-- Monthly: and date between date('2025-10-01') and date('2025-10-31')
```

The key idea is that, regardless of interval, the load window always starts from the **first day of the current period** and ends on the **last completed day**. That guarantees the period boundaries are always intact.

**DAU model rewritten with the macro:**

```jinja
{% raw %}{% set interval = 'day' %}

select
    date,
    count(distinct user_id) as users
from
    {{ ref('all_events_table') }}
where true
    {{ incremental_partition_filter('date', interval) }}
group by
    all
order by
    1{% endraw %}
```

**MAU model rewritten with the macro:**

```jinja
{% raw %}{% set interval = 'month' %}

select
    date_trunc(date, month) as date,
    count(distinct user_id) as users
from
    {{ ref('all_events_table') }}
where true
    {{ incremental_partition_filter('date', interval) }}
group by
    all
order by
    1{% endraw %}
```

![]({{ site.baseurl }}/assets/2025-08-09-combining-daily-weekly-and-monthly-loads-into-a-single-dag-with-a-dbt-incremental-macro/1.webp)

One thing you have to get right for this to work end-to-end is the **model configuration**:

```jinja
{% raw %}{{
    config(
        materialized = 'incremental',
        incremental_strategy = 'insert_overwrite',
        partition_by = {
            "field": "date",
            "data_type": "date",
            "granularity": "day"
        }
    )
}}{% endraw %}
```

By setting `date` as the partition key and using `insert_overwrite`, every run cleanly replaces the partitions covered by the macro's filter window — no duplicates, no leftover rows from a previous run.

## The payoff: operating with just one Airflow DAG

Once every model — Daily, Weekly, or Monthly — uses this macro, you no longer need separate DAGs per periodicity. A single **daily DAG** is enough.

The wins compound quickly:

- All dependency management is consolidated into one DAG, which is dramatically easier to read and maintain.
- Airflow worker pods consume fewer resources because you're not scheduling and running parallel DAGs for each interval.
- Weekly and Monthly metrics become **visible before the week or month is even over**, since they're refreshed every day on the partial window. That's a real boost for analysts who want early reads on in-flight periods.
