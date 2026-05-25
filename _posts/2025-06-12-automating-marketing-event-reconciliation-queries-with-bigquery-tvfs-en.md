---
title: "Automating Marketing Event Reconciliation Queries with BigQuery TVFs"
lang: en
tags:
  - analytics-engineering
  - sql-bigquery
---

> "I wrote this for data analysts who slog through writing one-off extraction queries."

- I'll walk through a real case where BigQuery TVFs (Table-Valued Functions) let me automate ad-hoc extraction queries and free up time for core work — in a way that's hopefully easy to follow.
- The goal of this post is to dramatically cut down repetitive work for data analysts, while raising the accuracy and reusability of the queries we deliver.

---

# Table of Contents
1. **Background**
2. **The Solution: BigQuery TVFs**
3. **Encapsulating the Reconciliation Query**
4. **Pros and Cons of BigQuery TVFs**
5. **Closing Thoughts**

---

# 1. Background

> "Writing a fresh winner-reconciliation query for every marketing event was a heavy lift."

### 1.1. Condition-based events

The company I work at runs its DW on BigQuery, and on top of that we operate a near-continuous stream of marketing events of all kinds. These events are **"condition-based"** — customers earn a reward only by completing a defined set of conversion goals. For example, to claim an event reward a user might need to:

- Complete Mission A,
- Complete Mission B,
- Complete Mission C, and
- Keep marketing consent active.

![]({{ site.baseurl }}/assets/2025-06-12-automating-marketing-event-reconciliation-queries-with-bigquery-tvfs/1.png)

> Example "condition-based" events from Robinhood, Duolingo, and the Nike Run App (images unrelated to this post)

### 1.2. The problem

The bigger problem was that **no two events were standardized the same way**. Building out a backend reconciliation system to absorb every event's bespoke logic would have been too company-wide a lift, so every time an event wrapped, a data analyst had to hand-write a complex winner-extraction query.

That led to:

- meaningful fatigue and inefficiency on both the data and marketing teams from a resourcing standpoint,
- accuracy that was never quite guaranteed even with query review, and
- a gray zone where context between the data analyst and the marketer kept slipping through the cracks.

### 1.3. Ambiguity in winner-extraction criteria

A specific pain was that the detailed context needed to write each reconciliation query was hard to sync between the analyst and the marketer. Questions like:

- Do we check marketing-consent status only at "event end," or on the day the reward is actually distributed?
- If a user organically met the conditions but only signed up for the event afterward, should they still count as a winner?
- Marketing consent has sub-toggles (push, SMS, email, …) — does enabling only some of them count as "consented"?

This ambiguity drove constant back-and-forth between the data analyst and the marketer, and it became increasingly clear that we needed to land on a consistent reconciliation standard and codify it as a system. So under our department head's direction, the marketing team, the development team, and I kicked off a project to automate and systematize the workflow.

---

# 2. The Solution: BigQuery TVFs

> "I chose to encapsulate the reconciliation query as a BigQuery TVF."

According to the [Google Cloud docs](https://cloud.google.com/bigquery/docs/table-functions), a BigQuery TVF (Table-Valued Function) is defined as a user-defined function that returns a table. That's a little abstract, so the way I think about it: a TVF lets you **turn a query into a function** that you can reuse and parameterize.

### 2.1. Compared to a Python function

If you wanted to compute a DAU figure filtered by gender, country, and OS over a date range using Python, you'd write something like this:

```python
def calc_number_of_users(
  start_date,
  end_date,
  gender,
  country,
  os
):
  query = f"""
    SELECT
        date,
        COUNT(DISTINCT user_id) AS dau,
      FROM
        fact__events
      WHERE TRUE
        AND {start_date} <= date
        AND date <= {end_date}
        AND gender = {gender}
        AND country = {country}
        AND os = {os}
      GROUP BY
        1
      ORDER BY
        1
  """
  ...
  return df

cal_number_of_users(
  '2025-01-01',
  '2025-01-31',
  'male',
  'South Korea',
  'ios'
)

# The results look like the following:
+------------+-----+
|    date    | dau |
+------------+-----+
| 2025-01-01 | 100 |
| 2025-01-02 | 101 |
|    ...     | ... |
| 2025-01-31 | 103 |
+------------+-----+
```

### 2.2. The same idea as a BigQuery TVF

Here's how that same concept translates into BigQuery. The TVF wraps the query into a function and lets parameters drive it dynamically.

```sql
CREATE OR REPLACE TABLE FUNCTION tvf.calc_number_of_users(
  param_start_date DATE,
  param_end_date DATE,
  param_gender STRING,
  param_country STRING,
  param_os STRING
) AS (
SELECT
    date,
    COUNT(DISTINCT user_id) AS dau,
  FROM
    fact__events
  WHERE TRUE
    AND param_start_date <= date
    AND date <= param_end_date
    AND gender = param_gender
    AND country = param_country
    AND os = param_os
  GROUP BY
    1
  ORDER BY
    1
);

SELECT
  *
FROM
  tvf.calc_number_of_users(
    '2025-01-01',
    '2025-01-31',
    'male',
    'South Korea',
    'ios'
  );

-- The results look like the following:
+------------+-----+
|    date    | dau |
+------------+-----+
| 2025-01-01 | 100 |
| 2025-01-02 | 101 |
|    ...     | ... |
| 2025-01-31 | 103 |
+------------+-----+
```

---

# 3. Encapsulating the Reconciliation Query

> "Here is the logic I used to encapsulate event winner-reconciliation queries inside BigQuery TVFs."

### 3.1. Defining the common logic

I started by defining the logic that holds across every event type. (I worked through this with marketing teammates.)

#### (1) Decision rubric

- "Roughly what categories of events need a systematized reconciliation?" → **One independent TVF per category.**
- "Which winning conditions stay the same across every event?" → **Hard-code as constants.**
- "Which winning conditions change from event to event?" → **Expose as parameters.**

#### (2) Output strategy

Rather than just emit a list of winners, the output is intentionally broad so it can double as material for customer-support responses, reconciliation evidence, and so on.

- Output the full list of customers who participated in the event.
- For each customer, also surface their win / lose status, their rank, and a flag per individual condition.
- Surface the dimension attributes we need too.

![]({{ site.baseurl }}/assets/2025-06-12-automating-marketing-event-reconciliation-queries-with-bigquery-tvfs/2.webp)

> Output strategy for the query

### 3.2. Writing the TVF, step by step

![]({{ site.baseurl }}/assets/2025-06-12-automating-marketing-event-reconciliation-queries-with-bigquery-tvfs/3.webp)

> Same TVF query, expressed as a set-theory visual

#### (A) Declare the TVF

First, declare the TVF and expose the per-event knobs the reconciliation owner needs to set dynamically.

```sql
CREATE OR REPLACE TABLE FUNCTION tvf.get_event_settlement_type_1(
  param_started_at TIMESTAMP,               -- Event start datetime
  param_ended_at TIMESTAMP,                 -- Event end datetime
  param_event_code INTEGER,                 -- Event participation code
  param_action_a_at_condition STRING,       -- Detailed condition for Mission A
  param_action_b_at_condition STRING,       -- Detailed condition for Mission B
  param_action_c_at_condition STRING,       -- Detailed condition for Mission C
  param_require_marketing_agreement BOOLEAN -- Whether marketing consent is required
) AS (
  -- Query body goes here.
);
```

#### (B) Load every event participant

```sql
WITH
CTE_dim__participated_users AS (
  SELECT
    user_id,
    created_at AS event_participated_at,
  FROM
    fact__event_participates
  WHERE TRUE
    AND param_started_at <= created_at
    AND created_at <= param_ended_at
    AND event_code = param_event_code
),
```

#### (C) Join the key dimension attributes for each participant

```sql
CTE_dim__all_participated_users AS (
  SELECT
    P.user_id,
    P.event_participated_at,
    DIM.marketing_agreed_at,
    DIM.xxx,
    ...,
  FROM
    CTE_dim__participated_users P
  LEFT JOIN
    dim__users DIM
    USING (user_id)
),
```

#### (D) Pull the participants who completed each condition

```sql
CTE_dim__action_a_completed_users AS (
  SELECT
    DIM.user_id,
    MIN(created_at) AS action_a_first_at,
  FROM
    CTE_dim__all_participated_users DIM
  LEFT JOIN
    fact__action_a FACT
    USING (user_id)
  WHERE TRUE
    AND param_started_at <= created_at
    AND created_at <= param_ended_at
    AND xxx = param_action_a_at_condition
  GROUP BY
    1
),

CTE_dim__action_b_completed_users AS (
  SELECT
    DIM.user_id,
    MIN(created_at) AS action_b_first_at,
  FROM
    CTE_dim__all_participated_users DIM
  LEFT JOIN
    fact__action_b FACT
    USING (user_id)
  WHERE TRUE
    AND param_started_at <= created_at
    AND created_at <= param_ended_at
    AND xxx = param_action_b_at_condition
  GROUP BY
    1
),

CTE_dim__action_c_completed_users AS (
  SELECT
    DIM.user_id,
    MIN(created_at) AS action_c_first_at,
  FROM
    CTE_dim__all_participated_users DIM
  LEFT JOIN
    fact__action_c FACT
    USING (user_id)
  WHERE TRUE
    AND param_started_at <= created_at
    AND created_at <= param_ended_at
    AND xxx = param_action_c_at_condition
  GROUP BY
    1
),
```

#### (E) Join (C) and (D) into the final result

```sql
CTE_final AS (
  SELECT
    U.user_id,
    CASE
      WHEN TRUE
        AND IF(
          param_require_marketing_agreement = TRUE,
          TRUE
          AND U.marketing_agreed_at IS NOT NULL
          AND U.marketing_agreed_at <= param_ended_at,
          TRUE
        )
        AND A.action_a_first_at IS NOT NULL
        AND B.action_b_first_at IS NOT NULL
        AND C.action_c_first_at IS NOT NULL
      THEN 'PASS'
      ELSE 'FAIL'
    END AS result,
    U.event_participated_at,
    U.marketing_agreed_at,
    A.action_a_first_at,
    B.action_b_first_at,
    C.action_c_first_at,
    ...,
  FROM
    CTE_dim__all_participated_users U
  LEFT JOIN
    CTE_dim__action_a_completed_users A
    USING (user_id)
  LEFT JOIN
    CTE_dim__action_b_completed_users B
    USING (user_id)
  LEFT JOIN
    CTE_dim__action_c_completed_users C
    USING (user_id)
)

SELECT
  CASE
    WHEN result = 'PASS' THEN
      ROW_NUMBER() OVER (
        ORDER BY
          IF(result = 'PASS', 0, 1),
          event_participated_at
      )
    ELSE NULL
  END AS rank,
  *,
FROM
  CTE_final
ORDER BY
  IF(result = 'PASS', 0, 1),
  event_participated_at
```

---

# 4. Pros and Cons of BigQuery TVFs

> "Working with BigQuery TVFs, here are the upsides and downsides I ran into."

### 4.1. Easy to maintain

- Because the complex query logic lives inside BigQuery and can be invoked directly, we can iterate quickly when the DW evolves.
- Versioning and deployment are also straightforward with Git + dbt.
- If we had instead written the same function inside a backend script, it would have ended up in the gray zone between backend and data engineering — much harder to maintain.

### 4.2. Parameter ergonomics are worse than Python

- **No keyword arguments.** Every parameter must be passed positionally. Unlike Python, you can't reorder arguments by referring to their names.
- **No default values.** TVFs don't support default parameter values, which hurts the readability and ergonomics of the invocation.

```python
# Python function example (keyword arguments)
def get_sales_data(start_date, end_date, country='South Korea', product_category='all'):
  ...

# 1. Pass values by name, in any order
get_sales_data(end_date='2025-12-31', start_date='2024-11-01', product_category='electronics')

# 2. Pass required args positionally and the rest by keyword
get_sales_data('2025-01-01', '2025-12-31', product_category='clothing')

# 3. All positional (order matters)
get_sales_data('2025-01-01', '2025-12-31', 'South Korea', 'food')
```

```sql
-- BigQuery TVF example (positional arguments only)
CREATE OR REPLACE TABLE FUNCTION tvf.get_sales_data(
  param_start_date DATE,
  param_end_date DATE,
  param_country STRING,
  param_product_category STRING
) AS (
  ...
);

-- Valid call (positional order respected)
SELECT
  *
FROM
  tvf.get_sales_data(
    '2025-01-01',         -- param_start_date
    '2025-12-31',         -- param_end_date
    'South Korea',        -- param_country
    'electronics'         -- param_product_category
  );

-- Invalid call (reordering, named args, and defaults are all unsupported)
SELECT
  *
FROM
  tvf.get_sales_data(
    param_country='South Korea',
    param_start_date='2025-01-01',
    '2025-12-31',
    'electronics'
  );
```

### 4.3. How I mitigated the downsides

To work around the ergonomics gap, I documented each TVF carefully so that when engineers consumed them via API, integration would be quick and unambiguous:

- **Invocation template** — a worked example of how to call the TVF.
- **Input schema** — a precise spec of each parameter.
- **Output schema** — a precise spec of the returned table's columns.

![]({{ site.baseurl }}/assets/2025-06-12-automating-marketing-event-reconciliation-queries-with-bigquery-tvfs/4.webp)

> Example TVF schema documentation

---

# 5. Closing Thoughts

Event reconciliation lived in the gray zone between marketers and data analysts — one of those "absolutely necessary, but exhausting" tasks. Automating it with BigQuery TVFs was less a technical win than an organizational one: it dramatically lifted operational efficiency. Yes, the parameter ergonomics aren't as nice as Python, but with the right documentation and team-to-team communication, I think that's a very surmountable gap.

If you're a data analyst struggling to focus on more important work because of one-off extraction queries, I hope this post is useful. What other ways are there to automate repetitive work? Let's keep thinking together. Thanks for reading!

---
