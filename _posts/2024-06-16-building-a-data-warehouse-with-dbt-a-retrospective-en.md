---
title: "Building a data warehouse with dbt: a retrospective"
lang: en
tags:
  - analytics-engineering
  - data-modeling
  - career-reflections
---

## Contents

- Introduction
- Overview
- A tour of dbt's features
- What I actually used dbt for
- Tips on getting the most out of dbt
- Closing thoughts

## Introduction

dbt (Data Build Tool) is an open-source framework that automates data transformation and modeling, and it's widely adopted by data analytics and data engineering teams. The framework leans on SQL plus Jinja templating to define and execute every transformation in the warehouse.

I leaned on dbt heavily while building out the data warehouse for IOTRUST's Wepin Workspace, and I plan to keep applying it as we ship new features and run internal analyses going forward.

## Overview

![]({{ site.baseurl }}/assets/2024-06-16-building-a-data-warehouse-with-dbt-a-retrospective/2.webp)

> Wepin Workspace — the "wallet user statistics" feature

The "user statistics" feature was built using ETL tooling, with most of the work concentrated on the transformation and orchestration layers. End-to-end, the pipeline stretches from the operational database all the way to the UI:

![]({{ site.baseurl }}/assets/2024-06-16-building-a-data-warehouse-with-dbt-a-retrospective/3.webp)

> End-to-end data pipeline architecture

**(1) Operational database replication.** Data is streamed in near real-time from the operational database into a physically separated database via a distributed data-processing service.

**(2) Sequential transformation layers.**
- **Core Layer**: data cleansing, column standardization, cardinality conversion, and null handling; modeled with Star or Snowflake schemas.
- **Mart Layer**: business-logic-driven metrics, separated by metric type; strict Star Schema for query performance.
- **Access Layer**: a final pass of refinement for backend consumption; guarantees a fully sequential dataset with no gaps.

**(3) Backend query execution.** A GraphQL layer queries the Access Layer tables. Compared to traditional REST endpoints, this gives the consumer much more flexibility in shaping each request.

**(4) Frontend presentation.** The UI fires GraphQL requests as the user interacts with the page, and the response data is rendered into charts.

## A tour of dbt's features

dbt is laser-focused on automating the transformation layer. The framework breaks down into five primary capabilities:

![]({{ site.baseurl }}/assets/2024-06-16-building-a-data-warehouse-with-dbt-a-retrospective/4.webp)

> The five core tasks dbt automates

**(1) Snapshot.** Automates periodic and accumulating snapshot fact tables, capturing point-in-time state (revenue, costs, inventory, balances) on a regular cadence.

**(2) Transform.** Runs all the transformation tasks in the project while resolving their dependencies automatically, producing a DAG-style execution graph. This makes the pipeline stable and lets you maintain individual marts without breaking anything downstream.

**(3) Test.** Provides automated data quality testing through built-in and custom tests — in my opinion, dbt's single biggest selling point.

**(4) Deploy.** Compiles SQL and Jinja templates into the database's native SQL dialect and then executes the corresponding DDL and DML:
- DDL: Create, Alter, Drop, Truncate
- DML: Select, Insert, Update, Delete

**(5) Document.** Auto-generates documentation for every table, column, description, dependency, and test — which dramatically smooths handoffs and ongoing maintenance.

## What I actually used dbt for

### 1. Organized table management through directory structure

I classified tables by layer, by fact-vs-dimension type, and by mart assignment so that maintenance and ad-hoc edits would stay sane.

![]({{ site.baseurl }}/assets/2024-06-16-building-a-data-warehouse-with-dbt-a-retrospective/5.webp)

> Example directory structure

### 2. Automated data quality testing

I leaned on three flavors of tests.

**(1) Built-in generic tests:**
- `unique` — validates unique identifiers
- `not_null` — enforces non-null columns
- `accepted_values` — restricts to an allow-list of values
- `relationships` — enforces foreign-key constraints

**(2) Custom singular tests.** User-defined tests aimed at a specific table/column where any returned row is treated as a failure:

```sql
SELECT * FROM {% raw %}{{ ref('fct_balances') }}{% endraw %}
WHERE balance < 0 LIMIT 1
```

**(3) Custom generic tests.** Parameterized tests that you can apply across multiple tables and columns:

```sql
{% raw %}{% test is_even(model, column_name) %}{% endraw %}
  WITH validation AS (
    SELECT {% raw %}{{ column_name }}{% endraw %} as even_field
    FROM {% raw %}{{ model }}{% endraw %}
  ),
  validation_errors AS (
    SELECT even_field FROM validation
    WHERE (even_field % 2) = 1
  )
  SELECT * FROM validation_errors
{% raw %}{% endtest %}{% endraw %}
```

Example YAML configuration:

```yaml
version: 2
models:
  - name: dim_users
    description: Users Info
    columns:
      - name: user_id
        description: Primary key
        tests:
          - unique
          - not_null
      - name: country_id
        tests:
          - not_null
          - relationships:
              to: ref('dim_countries')
              field: country_id
```

### 3. Metadata-driven documentation

Enriching the YAML files unlocks a surprisingly complete set of auto-generated docs:
- `node_color` — visual color coding to group related tables
- `description` — table- and column-level definitions
- `meta` — owner attribution for accountability
- `tests` — the quality requirements attached to each column

![]({{ site.baseurl }}/assets/2024-06-16-building-a-data-warehouse-with-dbt-a-retrospective/8.webp)

> A sample of the documentation interface that dbt generates

### 4. Tag-based model organization

```yaml
config:
  tags: ["core", "fact", "incremental"]
  materialized: incremental
  incremental_strategy: append
```

Tags make it easy to filter the documentation site and to scope which models you transform or test during a given maintenance window.

### 5. Materialization strategy configuration

![]({{ site.baseurl }}/assets/2024-06-16-building-a-data-warehouse-with-dbt-a-retrospective/6.webp)

> Comparison of dbt's materialization strategies

**(1) View** — stores only the query logic; no physical table is created.

```yaml
config:
  materialized: view
```

**(2) Table** — recreates the entire table on every run. Typically what you want for dimension tables.

```yaml
config:
  materialized: table
```

**(3) Incremental** — appends new rows instead of doing a full rebuild. Typically what you want for fact tables.

```yaml
config:
  materialized: incremental
  incremental_strategy: append
```

Or with a merge strategy:

```yaml
config:
  materialized: incremental
  incremental_strategy: merge
  unique_key: [user_id]
  merge_update_columns: [country]
```

**(4) Ephemeral** — used only within the dbt project at compile time, with nothing persisted to the database. A solid fit for staging-layer transformations.

Personally, I reserve `merge` for SCD Type 1 tables and lean on `append` for everything else, since `append` is meaningfully better for query performance.

### 6. Schema organization for client visibility

```yaml
models:
  wepin_workspace_dbt:
    01_core:
      dim:
        +schema: 01_core.dim
      fct:
        +schema: 01_core.fct
    02_mart:
      01_users_cnt:
        00_users_events_daily:
          +schema: 02_mart.01_users_cnt.00_users_events_daily
```

Defining schemas explicitly keeps things clear in the database client even when the internal dbt organization is deeply nested.

## Tips on getting the most out of dbt

### 1. The recommended DAG execution sequence

The orchestration order I settled on:

![]({{ site.baseurl }}/assets/2024-06-16-building-a-data-warehouse-with-dbt-a-retrospective/7.webp)

> DAG workflow: git pull → dbt debug → dbt deps → dbt run → dbt docs generate → dbt test → Slack alert

Verifying each stage independently is what makes the pipeline trustworthy, and a final Slack notification (via the Python Slack API) makes sure the result actually gets read.

### 2. Manage `profiles.yaml` at the project level

Keeping a separate `profiles.yaml` per project improves security and avoids centralizing connection credentials in a single shared file:

```bash
$ export DBT_PROFILES_DIR=path/to/directory
```

### 3. Incremental strategies are deceptively tricky

Writing an incremental model requires careful Jinja templating to avoid generating duplicate rows:

```sql
WHERE
  ...
  {% raw %}{% if is_incremental() %}{% endraw %}
  AND (SELECT MAX(datetime) FROM {% raw %}{{ this }}{% endraw %}) < "createdTime"
  {% raw %}{% endif %}{% endraw %}
```

Things worth keeping in mind:
- Design the model so it never produces duplicates no matter how often it runs.
- Core-layer tables benefit from carrying both a `date` and a `datetime` column.

### 4. Decouple source naming with `sources.yaml`

Use `sources.yaml` to detach analytics-friendly names from the operational database's naming conventions:

```yaml
sources:
  - name: users
    description: "User-related tables"
    tables:
      - name: fct_events
        identifier: ...
        description: Event table
        tags: ["source", "users", "fact"]
```

Reference it downstream as: `{% raw %}{{ source('users', 'fct_events') }}{% endraw %}`

### 5. Sketch dependencies early — by hand

Early in the data-warehouse planning process, it pays to sketch the dependency graph manually using something like draw.io, well before you let dbt auto-generate its documentation.

![]({{ site.baseurl }}/assets/2024-06-16-building-a-data-warehouse-with-dbt-a-retrospective/9.webp)

> An early dependency sketch drawn in draw.io

### 6. Finish the Core Layer before touching the Mart Layer

Locking in Core Layer definitions and materialization strategies before starting Mart Layer development prevents downstream confusion. Otherwise you end up making "bottom-up" corrections that erode the consistency of the whole layered model.

### 7. Always test for duplicate rows

The single most important incremental-model test catches accidental duplicates:

```sql
WITH CTE AS (
    SELECT a, b, c,
        ROW_NUMBER() OVER (PARTITION BY a, b, c) AS row_num
    FROM table
)
SELECT * FROM CTE WHERE row_num > 1
```

## Closing thoughts

I learned dbt through a handful of Udemy courses and then applied it end-to-end on Wepin Workspace. Tool choice is always contextual, but as the sole data engineer / analytics engineer on the project, dbt was indispensable — particularly for documentation and for catching data quality issues quickly.

The build also left me curious about how the enterprise data warehouses behind products like Google Analytics, Amplitude, and Mixpanel are architected, and deepened my appreciation for the broader data engineering tooling ecosystem.

I'm planning to keep using dbt on company projects going forward — and to keep contributing to my teammates' growth as we go.
