---
layout: post
title: "The Last Click Attribution Model Using BigQuery"
tags:
  - English
  - Data Analysis
  - SQL
  - BigQuery
---

> In this article, you will explore how to easily aggregate the Last Click Attribution Model using BigQuery.

### CONTENTS
1.  Introduction
2.  Enable the export of Google Analytics 4 data to BigQuery.
3.  Flatten Table
4.  Standardize the session UTM values for all events within each session.
5.  Replace NULL session UTM values with the value “`(direct)`”.
6.  Extract only the necessary columns for calculating attribution.
7.  Assign journey numbers to each user’s purchase event.
8.  Assign Priorities to indicate the order of events for applying the Last Click Attribution Model.
9.  The `session_campaign` with the highest priority will be attributed to 100% of the revenue.
10.  Now, let’s perform the Last Click Attribution aggregation for each channel.
11.  Let’s create a dashboard using Redash.

---

# 1.  Introduction

When you go to the Attribution Settings of Google Analytics 4, you can easily choose the Attribution Model that you love.

![]({{ site.baseurl }}/assets/2023-07-09-last-click-attribution/attribution-settings.webp)
> Google Analytics 4 > Settings > Attribution Settings

**Data Driven**
* It does not explicitly specify what kind of model is being used, and I think it’s a little risky when it comes to making a marketing decision.

**Last Click**
* The channel that immediately precedes the purchase is considered to have a 100% contribution.

**First Click**
* The channel that initially brings in the user is considered to have a 100% contribution.

**Linear**
* All channels, from the user’s initial acquisition channel to the channel immediately preceding the purchase, are considered to have an equal contribution of 1/N, where N represents the total number of channels.

![]({{ site.baseurl }}/assets/2023-07-09-last-click-attribution/user-acquisition.webp)
> Google Analytics 4 > Acquisition > User Acquisition

However, due to the post hoc nature of Attribution Settings in Google Analytics 4, there is a limitation where if the marketing strategy changes, you would need to aggregate the data again from the beginning.

Therefore, considering alternatives outside of Google Analytics 4, I have started contemplating using BigQuery to apply Attribution Models more flexibly and regularly monitor them.

In this article, you will explore how to easily aggregate the Last Click Attribution Model using BigQuery.

# 2. Enable the export of Google Analytics 4 data to BigQuery.

![]({{ site.baseurl }}/assets/2023-07-09-last-click-attribution/bigquery-links.webp)
> Google Analytics 4 > Settings > BigQuery Links

For detailed info and how to, refer to  [here](https://support.google.com/analytics/answer/9358801?hl=en).

# 3. Flatten Table

Unlike Bigtable, a column-wide store NoSQL database, BigQuery is a data warehouse. However, BigQuery still offers a lot of nested columns to handle future additions or deletions of schema, events, parameters, and more. For analytical purposes, it’s necessary to flatten tables composed of these columns to simplify queries.

![]({{ site.baseurl }}/assets/2023-07-09-last-click-attribution/flatten-table.webp)
> BigQuery table has nested columns that look like this.

```sql
WITH  
CTE_flattened AS (  
    SELECT    
        -- ==========================================================  
        -- [Datetime]  
        -- ==========================================================  
        event_date, -- Event Date  
        event_timestamp, -- Event Timestamp  
        user_first_touch_timestamp, -- User's First Visit Timestamp  

        -- ==========================================================  
        -- [User & Session ID]  
        -- ==========================================================    
        user_pseudo_id, -- User ID  
        ga_session_id.value.int_value AS ga_session_id, -- Session ID  
        ga_session_number.value.int_value AS ga_session_number, -- User's Session Index (starting from 1)  

        -- ==========================================================  
        -- [Event Name]  
        -- ==========================================================    
        event_name,  

        -- ==========================================================  
        -- [Geography & Device]  
        -- ==========================================================    
        geo.country, -- Country  
        device.category AS device_category, -- Device Category  
        device.operating_system AS device_os, -- Device OS  
  
        -- ==========================================================  
        -- [Acquisition]  
        -- ==========================================================  
        -- Landing Info  
        entrances.value.int_value AS entrances, -- If it's the first landing page of this session (page_view Event only)  
        REPLACE(REGEXP_REPLACE(LOWER(page_referrer.value.string_value), r'/$', ''), 'https://', '') AS page_referrer,  
        -- Session UTM  
        campaign.value.string_value AS session_campaign, -- UTM Campaign (Session-based)  
        medium.value.string_value AS session_medium, -- UTM Medium (Session-based)  
        source.value.string_value AS session_source, -- UTM Source (Session-based)  
        term.value.string_value AS session_term, -- UTM Term (Session-based)  
        -- First UTM  
        traffic_source.name AS first_campaign, -- UTM Campaign (First-based)  
        traffic_source.medium AS first_medium, -- UTM Medium (First-based)  
        traffic_source.source AS first_source, -- UTM Source (First-based)  
        -- Manual UTM  
        collected_traffic_source.manual_campaign_id AS manual_campaign_id, -- UTM Campaign ID (Manual-based)  
        collected_traffic_source.manual_campaign_name AS manual_campaign, -- UTM Campaign (Manual-based)  
        collected_traffic_source.manual_medium AS manual_medium, -- UTM Medium (Manual-based)  
        collected_traffic_source.manual_source AS manual_source, -- UTM Source (Manual-based)  
        collected_traffic_source.manual_term AS manual_term, -- UTM Term (Manual-based)  
        collected_traffic_source.manual_content AS manual_content, -- UTM Content (Manual-based)  
        -- Ads Identifiers  
        collected_traffic_source.gclid AS manual_gclid, -- Google Click Identifier  
        collected_traffic_source.dclid AS manual_dclid, -- Google Marketing Platform Identifier  
        collected_traffic_source.srsltid AS manual_srsltid, -- Google Merchant Center Identifier  
  
        -- ==========================================================  
        -- [Page]  
        -- ==========================================================  
        REGEXP_REPLACE(LOWER(device.web_info.hostname), r'/$', '') AS hostname, -- Domain or Subdomain  
        REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(LOWER(page_location.value.string_value), r'(\?.*)$', ''), r'/$', ''), 'https://', '') AS page_location, -- Current Page URL  
  
        -- ==========================================================  
        -- [Engagement]  
        -- ==========================================================  
        session_engaged.value.int_value AS session_engaged, -- If the session is engaged (session_start Event only)  
        engagement_time_msec.value.int_value AS engagement_time_msec, -- session engagement time (msec)  
  
        -- ==========================================================  
        -- [Click Event]  
        -- ==========================================================  
        outbound.value.string_value AS outbound, -- If the click Event is outbound from the current domain  
        REGEXP_REPLACE(LOWER(link_domain.value.string_value), r'/$', '') AS link_domain, -- Domain from the click Event  
        REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(LOWER(link_url.value.string_value), r'(\?.*)$', ''), r'/$', ''), 'https://', '') AS link_url, -- Page URL from the click Event  
  
        -- ==========================================================  
        -- [Scroll Event]  
        -- ==========================================================  
        percent_scrolled.value.int_value AS percent_scrolled, -- Scroll Percentage (default = 90 only)  
  
        -- ==========================================================  
        -- [Ecommerce Event]  
        -- ==========================================================    
        -- View Item ~  
        ecomm_pagetype.value.string_value AS ecomm_pagetype, -- Type of the Page (product, cart) (view_item, add_to_cart, begin_checkout Event)   
        ecomm_prodid.value.string_value AS ecomm_prodid, -- Product ID (view_item, begin_checkout, add_to_cart Event)  
        ecommerce.total_item_quantity AS ecommerce_total_item_quantity, -- Amount of Total Items purchased (view_item, add_to_cart, begin_checkout, purchase Event)   
        ecommerce.unique_items AS ecommerce_unique_items, -- Amount of Unique Items purchased (view_item, add_to_cart, begin_checkout, purchase Event)  
        -- Add to Cart ~  
        ecomm_totalvalue.value.int_value AS ecomm_totalvalue, -- Total Value of Items (add_to_cart, begin_checkout Event)  
        currency.value.string_value AS currency, -- Currency (add_to_cart, begin_checkout, add_payment_info, purchase Event)    
        -- Add Payment Info ~    
        total.value.int_value AS total, -- Total Value (add_payment_info Event only)  
        -- Purchase ~  
        ecommerce.transaction_id AS ecommerce_transaction_id, -- Transaction ID (purchase Event only)  
        event_value_in_usd, -- Total value of purchase (purchase Event only)  
        ecommerce.shipping_value_in_usd AS ecommerce_shipping_value_in_usd, -- shipping fee (purchase Event only)  
        -- Lifetime Value  
        user_ltv.revenue AS user_ltv_revenue, -- User's Lifetime Value  
        user_ltv.currency AS user_ltv_currency, -- User's Lifetime Value Currency  
  
    FROM `iotrust-data.analytics_123456789.events_*` MAIN  
  
    LEFT JOIN UNNEST (event_params) AS ga_session_id ON ga_session_id.key = 'ga_session_id'  
    LEFT JOIN UNNEST (event_params) AS ga_session_number ON ga_session_number.key = 'ga_session_number'  
    LEFT JOIN UNNEST (event_params) AS session_engaged ON session_engaged.key = 'session_engaged'  
    LEFT JOIN UNNEST (event_params) AS engagement_time_msec ON engagement_time_msec.key = 'engagement_time_msec'  
    LEFT JOIN UNNEST (event_params) AS percent_scrolled ON percent_scrolled.key = 'percent_scrolled'  
  
    LEFT JOIN UNNEST (event_params) AS page_location ON page_location.key = 'page_location'  
  
    LEFT JOIN UNNEST (event_params) AS entrances ON entrances.key = 'entrances'  
    LEFT JOIN UNNEST (event_params) AS page_referrer ON page_referrer.key = 'page_referrer'  
    LEFT JOIN UNNEST (event_params) AS campaign ON campaign.key = 'campaign'  
    LEFT JOIN UNNEST (event_params) AS medium ON medium.key = 'medium'  
    LEFT JOIN UNNEST (event_params) AS source ON source.key = 'source'  
    LEFT JOIN UNNEST (event_params) AS term ON term.key = 'term'  
      
    LEFT JOIN UNNEST (event_params) AS outbound ON outbound.key = 'outbound'  
    LEFT JOIN UNNEST (event_params) AS link_domain ON link_domain.key = 'link_domain'  
    LEFT JOIN UNNEST (event_params) AS link_url ON link_url.key = 'link_url'  
      
    LEFT JOIN UNNEST (event_params) AS transaction_id ON transaction_id.key = 'transaction_id'  
    LEFT JOIN UNNEST (event_params) AS ecomm_prodid ON ecomm_prodid.key = 'ecomm_prodid'  
    LEFT JOIN UNNEST (event_params) AS ecomm_pagetype ON ecomm_pagetype.key = 'ecomm_pagetype'  
    LEFT JOIN UNNEST (event_params) AS currency ON currency.key = 'currency'  
    LEFT JOIN UNNEST (event_params) AS ecomm_totalvalue ON ecomm_totalvalue.key = 'ecomm_totalvalue'  
    LEFT JOIN UNNEST (event_params) AS total ON total.key = 'total'  
    LEFT JOIN UNNEST (event_params) AS value ON value.key = 'value'  
    LEFT JOIN UNNEST (event_params) AS shipping ON shipping.key = 'shipping'  
    LEFT JOIN UNNEST (event_params) AS tax ON tax.key = 'tax'  
  
    WHERE  
        _table_suffix BETWEEN 
            FORMAT_DATE('%Y%m%d', 'yyyy-mm-dd')
            AND FORMAT_DATE('%Y%m%d', 'yyyy-mm-dd')  
        AND user_pseudo_id IS NOT NULL  
        AND ga_session_id.value.int_value IS NOT NULL  
        AND ga_session_number.value.int_value IS NOT NULL  
),
```

# 4. Standardize the session UTM values for all events within each session.

For some reason that is not entirely clear, due to the inaccuracies in GA4, there are cases where the UTM values that contributed to the acquisition of specific sessions are occasionally lost.

| **User ID** | **Session ID** | **Event Name** | **Session Campaign** | **Session Medium** | **Session Source**
|-|-|-|-|-|-
|Joshua|12345|`session_start`|(n/a)|(n/a)|(n/a)
|Joshua|12345|`page_view`|summer-event|owned-media|facebook
|Joshua|12345|`user_engagement`|summer-event|owned-media|facebook
|Joshua|12345|`scroll`|(n/a)|(n/a)|(n/a)
|Joshua|12345|`begin_checkout`|summer-event|owned-media|facebook
|Joshua|12345|`add_payment_info`|summer-event|owned-media|facebook

I have encountered several weird cases like this.

Therefore, in such cases, if there are session UTM values within the same session, the UTM values from the first event that occurred should be propagated to all the other events within the same session, ensuring they have the same values.

```sql
CTE_session_campaign_sequence AS (
    SELECT
        user_pseudo_id, ga_session_id,
        session_campaign,
        session_medium,
        session_source,
        session_term,
        CASE
            WHEN session_campaign IS NOT NULL THEN
                ROW_NUMBER() OVER (
                    PARTITION BY
                        user_pseudo_id, ga_session_id,
                        CASE WHEN session_campaign IS NOT NULL THEN 1 ELSE 0 END
                    ORDER BY
                        event_timestamp
                )
            WHEN session_campaign IS NULL THEN
                1
        END AS row_num
    FROM
        CTE_flattened
),

CTE_utm_spread AS ( -- spread session utm parameters throughout each user & session  
    SELECT  
        MAIN.* EXCEPT (session_campaign, session_medium, session_source, session_term),  
        SUB.real_session_campaign AS session_campaign,  
        SUB.real_session_medium AS session_medium,  
        SUB.real_session_source AS session_source,  
        SUB.real_session_term AS session_term  
    FROM 
        CTE_flattened MAIN  
    LEFT JOIN (  
        SELECT  
            user_pseudo_id, ga_session_id,  
            MAX(session_campaign) AS real_session_campaign,  
            MAX(session_medium) AS real_session_medium,  
            MAX(session_source) AS real_session_source,  
            MAX(session_term) AS real_session_term  
        FROM
            CTE_session_campaign_sequence
        WHERE
            row_num = 1
        GROUP BY
            user_pseudo_id, ga_session_id
    ) SUB
    ON 
        MAIN.user_pseudo_id = SUB.user_pseudo_id 
        AND MAIN.ga_session_id = SUB.ga_session_id  
    ORDER BY  
        MAIN.user_pseudo_id, MAIN.ga_session_id, MAIN.event_timestamp
),
```

# 5.  Replace NULL session UTM values with the value “`(direct)`”.

Personally, I tend to consider the “`(direct)`” values more as “unknown” rather than the direct traffic. Nevertheless, to ensure that calculations are not affected by NULL values during the aggregation process, here I proceeded with replacing all NULL values with “`(direct)`”.

```sql
CTE_fill_na AS ( -- Replace NULL session_utms with (direct)
    SELECT  
        * EXCEPT (session_campaign, session_medium, session_source, session_term),  
        IFNULL(session_campaign, '(direct)') AS session_campaign,  
        IFNULL(session_medium, '(none)') AS session_medium,  
        IFNULL(session_source, '(direct)') AS session_source,  
        IFNULL(session_term, '(direct)') AS session_term  
    FROM CTE_utm_spread  
),
```

# 6. Extract only the necessary columns for calculating attribution.

You only need the following columns:
* `user_pseudo_id`
* `event_date`
* `event_timestamp`
* `session_campaign`
* `session_medium`
* `session_source`
* `conversion` (whether they have made their purchase or not)
* `revenue` (total value of purchase)

```sql
CTE_user_sessions_channel_conversion AS (    
    SELECT
        user_pseudo_id,  
        event_date, event_timestamp,  
        session_campaign, session_medium, session_source,  
        CASE  
            WHEN event_name = 'session_start' THEN 0  
            WHEN event_name = 'purchase' THEN 1  
        END AS conversion,  
        event_value_in_usd AS revenue  
    FROM
        CTE_fill_na  
    WHERE  
        event_name IN (
            'session_start', 
            'purchase'
        )  
    ORDER BY  
        user_pseudo_id, event_timestamp  
),
```

# 7. Assign journey numbers to each user’s purchase event.

Since a user may make multiple purchases, it’s necessary to recalculate attribution after the first purchase event.

![]({{ site.baseurl }}/assets/2023-07-09-last-click-attribution/joshua-flowchart-1.webp)

You’ll need to separate each journey when it comes to calculating Joshua’s attribution model.

```sql
CTE_purchase_journey AS (    
    SELECT  
        user_pseudo_id,  
        event_date, event_timestamp,  
        session_campaign, session_medium, session_source,  
        conversion,  
        revenue,  
        COALESCE(cumsum_conversion, 0) + 1 AS purchase_journey  
    FROM  
    (  
        SELECT  
            *,  
            SUM(conversion) OVER (  
                PARTITION BY user_pseudo_id  
                ORDER BY event_timestamp  
                ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING  
            ) AS cumsum_conversion  
        FROM
            CTE_user_sessions_channel_conversion  
    )  
    ORDER BY  
        user_pseudo_id, event_timestamp  
),
```

# 8. Assign Priorities to indicate the order of events for applying the Last Click Attribution Model.

When applying Last Click Attribution mechanically, there is a high possibility of incorrect attribution in cases like the following:
* Joshua was initially acquired through the Summer Event campaign, then explored other information, and later started a new session through a Google search before making a purchase.
* In this case, it should be considered that Joshua made the purchase not primarily due to the effectiveness of our Google SEO strategy, as he was already aware of our website. Instead, it can be attributed to the appeal of the Summer Event, which influenced his decision to make the purchase.

![]({{ site.baseurl }}/assets/2023-07-09-last-click-attribution/joshua-flowchart-2.webp)

Therefore, I have assigned priorities based on the session_campaign as follows:
* 1 < `direct` < 2
* 2 < `organic` < 3
* 3 < `referral` < 4
* 4 < `identified campaign`

```sql
CTE_attribution_priority AS ( -- Adjusted Last Click Model
    SELECT  
        *,  
        CASE  
            WHEN session_campaign = '(direct)'
                THEN 1 + ROW_NUMBER() OVER (
                    PARTITION BY user_pseudo_id, purchase_journey
                    ORDER BY event_timestamp
                ) / 1000  
            WHEN session_campaign = '(organic)'
                THEN 2 + ROW_NUMBER() OVER (
                    PARTITION BY user_pseudo_id, purchase_journey 
                    ORDER BY event_timestamp
                ) / 1000  
            WHEN session_campaign = '(referral)'
                THEN 3 + ROW_NUMBER() OVER (
                    PARTITION BY user_pseudo_id, purchase_journey
                    ORDER BY event_timestamp
                ) / 1000  
            ELSE 
                4 + ROW_NUMBER() OVER (
                    PARTITION BY user_pseudo_id, purchase_journey 
                    ORDER BY event_timestamp
                ) / 1000  
        END AS attribution_priority  
    FROM
        CTE_purchase_journey
    ORDER BY  
        user_pseudo_id, event_timestamp    
),
```

# 9.  The `session_campaign` with the highest priority will be attributed to 100% of the revenue.

I have assigned priority classes based on the campaigns such as direct, organic, referral, and identifiable campaigns. However, within the same class, the attribution will be applied based on the most recent event, following the Last Click Attribution Model. Now, you can call this approach “**Joshua’s Adjusted Last Click Attribution Model**”. 😄

```sql
CTE_revenue_attribution AS (  
    SELECT  
        user_pseudo_id,  
        event_date, event_timestamp,  
        session_campaign, session_medium, session_source,  
        conversion,  
        revenue,  
        purchase_journey,  
        CASE  
            WHEN attribution_priority = MAX(attribution_priority) OVER (
                PARTITION BY user_pseudo_id, purchase_journey
            )  
                THEN MAX(revenue) OVER (
                    PARTITION BY user_pseudo_id, purchase_journey
                )  
            ELSE 
                NULL  
        END AS revenue_attribution  
    FROM
        CTE_attribution_priority  
    ORDER BY  
        user_pseudo_id, event_timestamp  
)
```

# 10. Now, let’s perform the Last Click Attribution aggregation for each channel.

```sql
SELECT  
    CASE  
        WHEN session_campaign = '(organic)' THEN 'Search Engine'  
        WHEN session_campaign = '(direct)' THEN 'Direct or Unknown'  
        WHEN session_campaign = '(referral)' THEN 'Social Media, Blogs, etc. (without UTM)'  
        ELSE session_campaign  
    END AS session_campaign_edited,  
    CASE  
        WHEN session_campaign = '(organic)' THEN session_source  
        WHEN session_campaign = '(referral)' THEN session_source  
        ELSE NULL  
    END AS session_source,  
    SUM(revenue_attribution) AS revenue,  
    COUNT(DISTINCT user_pseudo_id) AS acquisition_user_cnt,  
    SUM(revenue_attribution) / COUNT(DISTINCT user_pseudo_id) AS avg_revenue_per_user,  
    COUNT(revenue_attribution) AS purchase_cnt,  
    SUM(revenue_attribution) / COUNT(revenue_attribution) AS avg_revenue_per_purchase  
FROM 
    CTE_revenue_attribution  
GROUP BY 
    session_campaign_edited, session_source  
ORDER BY 
    revenue DESC
;
```

# 10. Let’s create a dashboard using Redash.

![]({{ site.baseurl }}/assets/2023-07-09-last-click-attribution/redash.webp)

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)