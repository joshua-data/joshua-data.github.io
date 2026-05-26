---
title: "[AE] What Is an AU Table: Everything About the Activated Users Table"
lang: en
tags:
  - analytics-engineering
  - data-modeling
---

> _"One of the core roles of analytics engineering is to maximize the **usability** of tables so that the people who use the data can solve complex requirements with concise queries. Among those, the **AU** (Activated Users) table is a particularly important data model — it summarizes user behavior data to maximize analytical efficiency. In this post I'll walk through the concept of the AU table, its use cases, and even an applied variant I came up with myself."_

## [Table of Contents]
- Basic concept of the AU table
- Why the AU table is useful
- Limitations of the AU table
- My applied variant: the AU by Events table
- Tips on designing and using AU tables

## Basic concept of the AU table

An AU table holds only the records of users who were active during a specific period — Daily, Weekly, or Monthly. For example, it is composed of records like the following.

![]({{ site.baseurl }}/assets/2025-08-06-what-is-au-tables/1.webp)

![]({{ site.baseurl }}/assets/2025-08-06-what-is-au-tables/2.webp)

![]({{ site.baseurl }}/assets/2025-08-06-what-is-au-tables/3.webp)

From a data warehousing perspective, I see the AU table as a **Periodic Snapshot Fact Table** for the following reasons.

* **Fact Table**: it carries the characteristics of a fact table in that it records the user's behavior ("verb").
* **Periodic Snapshot**: rather than storing every individual behavior log, it stores the data as a summarized snapshot at a fixed period grain.

Put simply, the AU table is a compressed version of the **All Events** table — compressed along the user and date axes.

* **All Events table**: stores fine-grained records like `user_id`, `event_name`, `datetime`. (Grain = `user_id` + `event_name` + `datetime`)
* **AU table**: stores only whether a given user was active at least once during a given period — e.g. `user_id`, `date`. (Grain = `user_id` + `date`)

## Why the AU table is useful

Because the AU table stores data in a compressed form, you can **extract the key metrics far more cheaply and quickly** than by scanning the All Events table every time.

### (1) DAU, WAU, MAU metrics become trivial to compute.

```sql
select
  date,
  count(user_id) as users -- no need for distinct!
from
  daily_au_table
where true
  and date between '2025-01-01' and '2025-12-31'
group by
  all
order by
  1
```

### (2) Cohort retention becomes very easy to compute.

```sql
with

au as (
  select
    date,
    user_id,
    activation_number
  from
    daily_au_table
  where
    and date between '2025-01-01' and '2025-12-31'
),

au__cohort as (
  select
    date,
    user_id
  from
    au
  where true
    and activation_number = 1 -- you can carve out the cohort with this column alone!
),

vector__cohort as (
  select
    date,
    count(user_id) as users -- no need for distinct!
  from
    au__cohort
  group by
    all
)

select
  v.date,
  date_diff(a.date, v.date, day) as bucket,
  v.users as cohort_users,
  count(a.user_id) as retained_users, -- no need for distinct!
  safe_divide(count(a.user_id), v.users) as retention -- no need for distinct!
from
  vector__cohort as v
  inner join au__cohort as c
    on v.date = c.date
  inner join au as a
    on c.user_id = a.user_id
    and date_diff(a.date, v.date, day) between 0 and 90
group by
  all
order by
  1, 2
```

### (3) Window-based MAU (Last 30-day AU) can be extracted cheaply and quickly.

```sql
with

au as (
  select
    date,
    user_id
  from
    daily_au_table
  where
    and date between '2025-01-01' and '2025-12-31'
),

vector__dates as (
  select
    distinct
    date
  from
    au
)

select
  fix.date,
  count(distinct rolling.user_id) as users -- 3. and aggregate.
from
  vector_dates as fix -- 1. for each date,
  left join au as rolling -- 2. count the Last-30-day users,
    on rolling.date between fix.date - interval 29 day and fix.date
group by
  all
order by
  1
```

### (4) Daily New Users vs. Existing Users can be separated quickly.

```sql
with

au as (
  select
    date,
    user_id,
    activation_number
  from
    daily_au_table
  where
    and date between '2025-01-01' and '2025-12-31'
)

select
  date,
  count(if(activation_number = 1, user_id, null)) as new_users, -- new users
  count(if(activation_number = 1, null, user_id)) as existing_users -- existing users
from
  au
group by
  all
order by
  1
```

## Limitations of the AU table

That said, since the AU table loses the individual behavior information of users during the compression step, **it cannot serve event-specific analytical requirements**. Metrics like the number of purchasers or purchase retention, for instance, are **hard to support with the AU table alone**.

## My applied variant: the AU by Events table

To work around the limitations of the AU table, I tend to build an **AU by Events** table. This table records both the users that were active during a given period **and** the specific events that contributed to that activation. In other words, it can **also support event-specific metrics**.

* **AU table grain**: `user_id` + `date`
* **AU by Events table grain**: `user_id` + `event_name` + `date`

![]({{ site.baseurl }}/assets/2025-08-06-what-is-au-tables/4.webp)

### (1) Daily Paid Users becomes trivial to compute.

```sql
select
  date,
  count(user_id) as users -- no need for distinct!
from
  daily_au_table
where true
  and date between '2025-01-01' and '2025-12-31'
  and event_name = 'purchase'
group by
  all
order by
  1
```

### (2) Purchase cohort retention becomes very easy to compute.

```sql
with

au as (
  select
    date,
    user_id,
    activation_number
  from
    daily_au_table
  where
    and date between '2025-01-01' and '2025-12-31'
    and event_name = 'purchase'
),

au__cohort as (
  select
    date,
    user_id
  from
    au
  where true
    and activation_number = 1 -- you can carve out the cohort with this column alone!
),

vector__cohort as (
  select
    date,
    count(user_id) as users -- no need for distinct!
  from
    au__cohort
  group by
    all
)

select
  v.date,
  date_diff(a.date, v.date, day) as bucket,
  v.users as cohort_users,
  count(a.user_id) as retained_users, -- no need for distinct!
  safe_divide(count(a.user_id), v.users) as retention -- no need for distinct!
from
  vector__cohort as v
  inner join au__cohort as c
    on v.date = c.date
  inner join au as a
    on c.user_id = a.user_id
    and date_diff(a.date, v.date, day) between 0 and 90
group by
  all
order by
  1, 2
```

### (3) User-based first-time funnel conversion becomes easy to compute.

```sql
with

au as (
  select
    date,
    user_id,
    event_name
  from
    daily_au_table
  where
    and date between '2025-01-01' and '2025-12-31'
    and event_name in ('view_item', 'add_to_cart', 'purchase')
    and activation_number = 1 -- only pull each user's lifetime-first occurrence of each event.
)

select
  date,
  count(if(event_name='view_item', user_id, null)) as step1_users,
  count(if(event_name='add_to_cart', user_id, null)) as step2_users,
  count(if(event_name='purchase', user_id, null)) as step3_users
from
  au
group by
  all
order by
  1
```

## Tips on designing and using AU tables

### 1. Thinking about Time Grain

Providing AU tables at multiple period grains — Daily, Weekly, Monthly — can dramatically improve analytical convenience, cost efficiency, and usability. From a marketing-strategy support standpoint you could even consider an Hourly AU table, but **AU tables tend to be quite expensive to build**, so I feel it's wiser to validate the organizational need carefully and refine the Time Grain only gradually.

When the AU table provides columns such as `activation_number`, `prev_date`, `next_date`, you'll end up leaning on Window Functions — and that introduces substantial Sorting cost.

### 2. Adding useful columns

I tend to add a few extra columns to the AU table, and they help a lot with depth of analysis.

#### (1) Activation sequence number

If you record the activation sequence per `user_id` in an `activation_number` column, you can quickly tell whether a user is new vs. existing, or whether they were continuously active, using just simple condition filtering — no aggregation required.

#### (2) User dimension attributes

It's also very useful to store the user's attributes at the time of activation (`country`, `device_type`, `utm_campaign`, etc.) together in a One Big Table style. You can then drill down by dimension using the AU table alone. In particular, when a user's dimension values change frequently, being able to read the exact attribute snapshot at activation time directly from the AU table — without paying the cost of joining a separate SCD Type 2 dimension table — meaningfully speeds analysis.

The caveat is that during AU table processing you'll need to apply Window Functions like `first_value` or `last_value` on the dimension columns at each Time Grain, and the Sorting step can become a real burden. So adopt this carefully, weighing the cost against the value it creates.

```sql
-- a quick sketch of the dbt model

with

-- 1. load the increment
new_data as (
  select
    date,
    user_id,
    first_value(country ignore nulls) over w as country -- the first dimension value observed on each activation date
  from
    {% raw %}{{ ref('all_events_table') }}{% endraw %}
  where true
    -- (incremental strategy omitted)
  qualify
    row_number() over (
      partition by date, user_id
      order by datetime
    ) = 1
  window w as (
    partition by date, user_id
    order by datetime
    rows between unbounded preceding and unbounded following
  )
),

-- 2. attach activation sequence numbers, but only over the incremental records
new_data_activation_number as (
  select
    *,
    row_number() over (
      partition by user_id
      order by date
    ) as activation_number
  from
    new_data

)

-- 3. check the current activation-number state of THIS table
{% raw %}{% if is_incremental() %}{% endraw %}
old_data as (
  select
    user_id,
    max(activation_number) as max_activation_number
  from
    {% raw %}{{ this }}{% endraw %}
  group by
    all
),
{% raw %}{% endif %}{% endraw %}

-- 4. update the activation sequence numbers
au as (
  select
    new_data.date,
    new_data.user_id,
    {% raw %}{% if is_incremental() %}{% endraw %}
    coalesce(old_data.max_activation_number, 0) + new_data.activation_number as activation_number,
    {% raw %}{% else %}{% endraw %}
    new_data.activation_number,
    {% raw %}{% endif %}{% endraw %}
    country
  from
    new_data
    {% raw %}{% if is_incremental() %}{% endraw %}
    left join old_data
      using (user_id)
    {% raw %}{% endif %}{% endraw %}
)

select * from au
```
