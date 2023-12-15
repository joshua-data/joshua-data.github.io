---
layout: post
title: "Let’s Create the Sankey Chart"
tags:
  - SQL
  - BigQuery
  - Redash
  - Data Visualization
---

> In this article, I’m going to tell you how you can create the Sankey Chart starting from GA4, BigQuery, and up to Redash.

### CONTENTS
1. Introduction
2. **Flatten** the source table.
3. Make sure each **user** and **session** has the same properties(or parameters).
4. Delete the consecutive same **page URL duplicates** in the same `session_id`.
5. Label each page's **visiting order number** for each session.
6. **Categorize** all the pages.
7. Pivot each session's journey up to **10 steps**.
8. Make the query result compatible with **Redash**.
9. Final Result
10. Conclusion

---

![]({{ site.baseurl }}/assets/2023-05-21-sankey-chart/Data Pipeline from the website all the way up to Redash.webp)
> Data Pipeline from the website all the way up to Redash

# 1. Introduction

## 1.1. What is Sankey Chart?

![]({{ site.baseurl }}/assets/2023-05-21-sankey-chart/Sankey-Diagram.webp)
> [Source](https://www.originlab.com/doc/Origin-Help/Sankey-Diagram)

**Sankey Chart**, oftentimes also called Sankey Diagram, is a type of flow visualization in which the width of the arrows is proportional to the flow rate of the depicted extensive property. [[Wikipedia](https://en.wikipedia.org/wiki/Sankey_diagram)]

## 1.2. Why is Sankey Chart Important in Data Analytics?

In the Data Analytics world, though, we can figure out how our visitors make their journey throughout our website pages or app screens. With the Sankey Chart, we can apply **our strategies** as shown below.
* “Many purchasing visitors mainly make a journey starting from `page A`, `page B`, `page C`, and finally make their purchase. Therefore, we might be able to create a CTA button in order to drive the other visitors to this journey, so that we could make our revenue much higher.”
* “`Page A` and `Page B` are the points where our visitors bounce off the most. Bet those two pages have some problems in terms of psychology or technology. Let’s now dive into specific user interviews or research to deal with this bounce-off rate.”

## 1.3. Limitations of Google Analytics 4

Although GA4 supports some custom visualizations and you can explore the path analysis to figure out how your visitors take their journey throughout the websites, it’s literally awful and much of a hassle if you’re eager to get some insights regarding that. (See below how awful it is.)

![]({{ site.baseurl }}/assets/2023-05-21-sankey-chart/GA4’s Path Analysis.webp)

Now that hopefully you got deeply understood what is the Sankey Chart and why it’s important in product analytics, it’s time to show you **how to create the Sankey Chart from A to Z**. Let's directly dive into it!

# 2. Flatten the source table.

Although it’s really handy to connect the GA4 events to BigQuery, there’s a complicated issue hard to handle; Some of the datatypes imported to BigQuery are `STRUCT` type. It’s regarded as an array type, or you can imagine this as a `STRUCT` type column that allows each row to have a multiple-dimensional value in it.

![]({{ site.baseurl }}/assets/2023-05-21-sankey-chart/address_history.webp)
![]({{ site.baseurl }}/assets/2023-05-21-sankey-chart/1. Flatten the Table.webp)
> [Source](https://medium.com/google-cloud/how-to-work-with-array-and-structs-in-bigquery-9c0a2ea584a6)

You can simply use `UNNEST` to flatten each `STRUCT` type column in advance of your main query.

## 2.1. The Entire Codes

```sql
WITH
CTE_flattened AS (
	SELECT
		event_date,
		event_timestamp,
		user_pseudo_id,
		ga_session_id.value.int_value AS session_id,
		ga_session_number.value.int_value AS session_number,
		event_name,
		page_location.value.string_value AS page_location,
		ecommerce.purchase_revenue_in_usd AS revenue_usd,
		geo.country,
		device.category AS device,
		utm_campaign.value.string_value AS utm_campaign,  
		utm_medium.value.string_value AS utm_medium,  
		utm_source.value.string_value AS utm_source,  
		page_referrer.value.string_value AS page_referrer  
	FROM
		`your_table.events_*`  
	LEFT JOIN
		UNNEST (event_params) AS ga_session_id
		ON ga_session_id.key = 'ga_session_id'  
	LEFT JOIN
		UNNEST (event_params) AS ga_session_number
		ON ga_session_number.key = 'ga_session_number'  
	LEFT JOIN
		UNNEST (event_params) AS page_location
		ON page_location.key = 'page_location'  
	LEFT JOIN
		UNNEST (event_params) AS utm_campaign
		ON utm_campaign.key = 'campaign'  
	LEFT JOIN
		UNNEST (event_params) AS utm_medium
		ON utm_medium.key = 'medium'  
	LEFT JOIN
		UNNEST (event_params) AS utm_source
		ON utm_source.key = 'source'  
	LEFT JOIN
		UNNEST (event_params) AS page_referrer
		ON page_referrer.key = 'page_referrer'  
	WHERE  
		_table_suffix BETWEEN
		FORMAT_DATE(
			'%Y%m%d',
			DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
		)
		AND
		FORMAT_DATE(
			'%Y%m%d',
			CURRENT_DATE()
		)
		AND ga_session_number.value.int_value = 1  
		AND user_pseudo_id IS NOT NULL  
		AND ga_session_id IS NOT NULL  
),
```

## 2.2. Detailed Explanation of Key Codes

```sql
LEFT JOIN
	UNNEST (event_params) AS ga_session_id
	ON ga_session_id.key = ‘ga_session_id’
```
* Each `event` may have `ga_session_id` in its parameters, and we have to grab it in order to follow through each user session’s journey based on the `ga_session_id`.

```sql
LEFT JOIN
	UNNEST (event_params) AS ga_session_number
	ON ga_session_number.key = ‘ga_session_number’
```
* Each `event` may have `ga_session_number` in its parameters, and we have to look through it in order to know if each `session` is the **first visiting user’s** or **returning user’s** session.

```sql
LEFT JOIN
	UNNEST (event_params) AS page_location
	ON page_location.key = ‘page_location’
```
* Most of each `event` has `page_location` in its parameters, and of course, we have to know `page_location` in order to follow through with their journey based on the **page URL**.

```sql
LEFT JOIN
	UNNEST (event_params) AS utm_campaign
	ON utm_campaign.key = ‘campaign’
```
* Many times, each `session` has a totally different shape of the journey depending on what kind of **campaign channel** the session has started from. Therefore, let’s also query `utm_campaign` just in case.

```sql
LEFT JOIN
	UNNEST (event_params) AS utm_medium
	ON utm_medium.key = ‘medium’
```
* Many times, each `session` has a totally different shape of the journey depending on what kind of **medium channel** the session has started from. Therefore, let’s also query `utm_medium` just in case.

```sql
LEFT JOIN
	UNNEST (event_params) AS utm_source
	ON utm_source.key = ‘source’
```
* Many times, each `session` has a totally different shape of the journey depending on what kind of **source channel** the session has started from. Therefore, let’s also query `utm_source` just in case.

```sql
LEFT JOIN
	UNNEST (event_params) AS page_referrer
	ON page_referrer.key = ‘page_referrer’
```
* Many times, each `session` has a totally different shape of the journey depending on exactly what **previous page URL** the session has started from. Therefore, let’s also query `page_referrer` just in case.

```sql
AND ga_session_number.value.int_value = 1  
AND user_pseudo_id IS NOT NULL  
AND ga_session_id IS NOT NULL
```
* Here, I wanted to know specifically about the **first visiting users’ journey**, and that’s why I try to query with `ga_session_number` only as `1`.
* We basically have to track the `user_pseudo_id` and `ga_session_id` in order to **make sure each user journey has been there from the same user and same session**. That’s why I dropped all the missing `user_pseudo_id` and `ga_session_id` instances.

# 3. Make sure each user and session has the same properties(or parameters).

Sometimes, even though it’s rooted in the same `session_id`, some events have their parameters fully, but others don’t. That’s why we make duplicates for the parameters throughout the same `user_pseudo_id` and `session_id`.

![]({{ site.baseurl }}/assets/2023-05-21-sankey-chart/ This is a real BigQuery table appended from GA4, and look only one event has the medium value.webp)
> This is a real **BigQuery** table appended from GA4, and you can look only one event has the medium value.

## 3.1. The Entire Codes

You can use `FIRST_VALUE` and `LAST_VALUE` functions to make the duplicates.

```sql
CTE_properties_spread AS (  
    SELECT  
        event_date,
        event_timestamp,  
        user_pseudo_id,
        session_id,
        session_number,  
        event_name, 
        REGEXP_REPLACE(
	        REGEXP_REPLACE(
		        LOWER(page_location), 
		        r'(\?.*)$', ''
	        ),
	        r'/$', ''
        ) AS page_location,
        revenue_usd,  
        FIRST_VALUE(country) OVER(
	        PARTITION BY user_pseudo_id, session_id
	        ORDER BY event_timestamp
        ) AS country,  
        FIRST_VALUE(device) OVER(
	        PARTITION BY user_pseudo_id, session_id
	        ORDER BY event_timestamp
        ) AS device,  
        LAST_VALUE(utm_campaign) OVER(
	        PARTITION BY user_pseudo_id, session_id
	        ORDER BY event_timestamp
        ) AS utm_campaign,  
        LAST_VALUE(utm_medium) OVER(
	        PARTITION BY user_pseudo_id, session_id
	        ORDER BY event_timestamp
        ) AS utm_medium,  
        LAST_VALUE(utm_source) OVER(
	        PARTITION BY user_pseudo_id, session_id
	        ORDER BY event_timestamp
        ) AS utm_source,  
        LAST_VALUE(
	        REGEXP_REPLACE(
		        REGEXP_REPLACE(
			        LOWER(page_referrer), 
			        r'(\?.*)$', ''
		        ), 
		        r'/$', ''
	        )
        ) OVER(
	        PARTITION BY user_pseudo_id, session_id 
	        ORDER BY event_timestamp
        ) AS page_referrer  
    FROM
	    CTE_flattened 
),
```

## 3.2. Detailed Explanation of Key Codes

```sql
REGEXP_REPLACE(
	REGEXP_REPLACE(
		LOWER(page_location), 
		r'(\?.*)$', ''
	),
	r'/$', ''
) AS page_location,
```
* Many times, the **page URL** has different shapes even though it drives the visitors to the exact same page.
* The four URLs below have different values, but they direct you to the same Google main page anyways.
	* [https://google.com](https://google.com/)
	* [https://google.com/](https://google.com/)
	* [https://google.com?utm_source=medium](https://google.com?utm_source=medium)
	* [https://google.com/?utm_source=medium](https://google.com/?utm_source=medium)
* That’s why I use the `REGEXP_REPLACE` function to **drop the useless letters** in data analytics.

```sql
FIRST_VALUE(country) OVER(
	PARTITION BY user_pseudo_id, session_id
	ORDER BY event_timestamp
) AS country
```
* Because of some technical problems, one user and session might have multiple countries. (I'm guessing some users might have moved overseas, changed IP Address through VPNs, or GA4's tech issue itself.) Regarding this issue, I would make a decision to **grab the very first country value** to know where the `user` and `session` have started.
* Let’s assume a visitor is aboard a plane, and when he/she starts the session the plane is located in the **US**, but when visiting the following page, the plane has just entered the **Canada** area. In this extreme case, we’d rather think of this visitor as starting from the **US**.

# 4. Delete the consecutive same page URL duplicates in the same `session_id`.

In most cases, if a visitor lands on page A, multiple events can happen.
* i.e., `session_start`, `page_view`, `user_engagement`, `scroll`, and whatnot

We need to delete all the same Page URLs triggered consecutively in one session, but **only with the unique page URL**.

## 4.1. The Entire Codes

```sql
CTE_unique_pages AS (
	SELECT  
        event_date, event_timestamp,  
        user_pseudo_id, session_id, session_number,  
        event_name,  
        page_location,          
        LAG(page_location) OVER(
	        PARTITION BY user_pseudo_id, session_id 
	        ORDER BY event_timestamp
        ) AS previous_page_location,  
        LEAD(page_location) OVER(
	        PARTITION BY user_pseudo_id, session_id 
	        ORDER BY event_timestamp
        ) AS next_page_location,  
        revenue_usd,  
        country, device,  
        utm_campaign, utm_medium, utm_source, page_referrer      
    FROM (  
        SELECT  
            *,  
            CASE  
	            WHEN -- Previous URL IS NULL  
                    previous_page_location IS NULL THEN 'remain'  
                WHEN -- Previous URL <> Current URL  
                    previous_page_location <> page_location THEN 'remain'  
                WHEN -- Previous URL = Current URL  
                    previous_page_location = page_location 
                    AND page_location <> next_page_location THEN 'del'  
            END AS remain_or_del  
        FROM (  
            SELECT  
                event_date, event_timestamp,  
                user_pseudo_id, session_id, session_number,  
                event_name,
                page_location,          
                LAG(page_location) OVER(
	                PARTITION BY user_pseudo_id, session_id
	                ORDER BY event_timestamp
                ) AS previous_page_location,  
                LEAD(page_location) OVER(
	                PARTITION BY user_pseudo_id, session_id 
	                ORDER BY event_timestamp
                ) AS next_page_location,  
                revenue_usd,  
                country, device,  
                utm_campaign, utm_medium, utm_source, page_referrer  
            FROM CTE_properties_spread  
        )  
    )  
    WHERE
	    remain_or_del = 'remain'  
    ORDER BY 
	    user_pseudo_id, session_id, event_timestamp  
),
```

Here in the query above, I used `LAG` and `LEAD` window functions **to know whether to delete duplicates** based on the previous page URL and the next page URL.

# 5. Label each page's visiting order number for each session.

We can Label `visit_order` for each page URL based on the `event_timestamp` **in ascending order**.
* Here, I used the `ROW_NUMBER` window function to do it.

## 5.1. The Entire Codes

```sql
CTE_visit_orders AS (  
    SELECT  
        event_date, event_timestamp,  
        user_pseudo_id, session_id,  
        page_location,
        ROW_NUMBER() OVER(
	        PARTITION BY user_pseudo_id, session_id 
	        ORDER BY event_timestamp
        ) AS visit_order,  
        country, device,  
        utm_campaign, utm_medium, utm_source, page_referrer  
    FROM
	    CTE_unique_pages  
    ORDER BY 
	    user_pseudo_id, session_id, visit_order  
),
```

# 6. Categorize all the pages.

The page URL itself looks dirty since it’s not that human-readable, so here I wanted to **categorize all the pages** existing in the whole domain to **make them literally human-readable**.

## 6.1. The Entire Codes

```sql
CTE_page_groups AS (  
    SELECT  
        event_date, event_timestamp,  
        user_pseudo_id, session_id,  
        page_location,   
        CASE  
            WHEN page_location = 'https://google.com' THEN 'Google Home'  
            WHEN page_location = 'https://google.com/joshua' THEN 'Joshua Intro'  
            WHEN page_location = 'https://google.com/andrew' THEN 'Andrew Intro'  
            WHEN page_location = 'https://google.com/amber' THEN 'Amber Intro'  
            WHEN CONTAINS_SUBSTR(page_location, 'https://google.com/policy') = True THEN 'Policy Pages'  
            WHEN CONTAINS_SUBSTR(page_location, 'https://google.com/events') = True THEN 'Event Pages'  
            ELSE 'ETC'  
        END AS page_group,  
        visit_order,  
        country, device,  
        utm_campaign, utm_medium, utm_source, page_referrer  
    FROM
	    CTE_visit_orders
    ORDER BY 
	    user_pseudo_id, session_id, visit_order  
),
```

# 7. Pivot each session's journey up to 10 steps.

## 7.1. The Entire Codes

```sql
CTE_journeys AS (  
    SELECT  
        user_pseudo_id, session_id,
        country, device, 
        utm_campaign, utm_medium, utm_source, page_referrer,  
        MAX((SELECT page_group FROM CTE_page_groups SUB  
            WHERE MAIN.user_pseudo_id = SUB.user_pseudo_id AND MAIN.session_id = SUB.session_id AND visit_order = 1)) AS step01,  
        MAX((SELECT page_group FROM CTE_page_groups SUB  
            WHERE MAIN.user_pseudo_id = SUB.user_pseudo_id AND MAIN.session_id = SUB.session_id AND visit_order = 2)) AS step02,  
        MAX((SELECT page_group FROM CTE_page_groups SUB  
            WHERE MAIN.user_pseudo_id = SUB.user_pseudo_id AND MAIN.session_id = SUB.session_id AND visit_order = 3)) AS step03,  
        MAX((SELECT page_group FROM CTE_page_groups SUB  
            WHERE MAIN.user_pseudo_id = SUB.user_pseudo_id AND MAIN.session_id = SUB.session_id AND visit_order = 4)) AS step04,  
        MAX((SELECT page_group FROM CTE_page_groups SUB  
            WHERE MAIN.user_pseudo_id = SUB.user_pseudo_id AND MAIN.session_id = SUB.session_id AND visit_order = 5)) AS step05,          
        MAX((SELECT page_group FROM CTE_page_groups SUB  
            WHERE MAIN.user_pseudo_id = SUB.user_pseudo_id AND MAIN.session_id = SUB.session_id AND visit_order = 6)) AS step06,  
        MAX((SELECT page_group FROM CTE_page_groups SUB  
            WHERE MAIN.user_pseudo_id = SUB.user_pseudo_id AND MAIN.session_id = SUB.session_id AND visit_order = 7)) AS step07,  
        MAX((SELECT page_group FROM CTE_page_groups SUB  
            WHERE MAIN.user_pseudo_id = SUB.user_pseudo_id AND MAIN.session_id = SUB.session_id AND visit_order = 8)) AS step08,  
        MAX((SELECT page_group FROM CTE_page_groups SUB  
            WHERE MAIN.user_pseudo_id = SUB.user_pseudo_id AND MAIN.session_id = SUB.session_id AND visit_order = 9)) AS step09,  
        MAX((SELECT page_group FROM CTE_page_groups SUB  
            WHERE MAIN.user_pseudo_id = SUB.user_pseudo_id AND MAIN.session_id = SUB.session_id AND visit_order = 10)) AS step10  
    FROM CTE_page_groups MAIN  
    GROUP BY
        user_pseudo_id, session_id, 
        country, device, 
        utm_campaign, utm_medium, utm_source, page_referrer  
    ORDER BY  
        step01, step02, step03, step04, step05, 
        step06, step07, step08, step09, step10  
),
```

# 8. Make the query result compatible with Redash.

Since **Redash Sankey Chart** has its expected framework and naming rules of the query result, we need to make the final query result in order to fit the rule.

![]({{ site.baseurl }}/assets/2023-05-21-sankey-chart/Redash Sankey Visualization’s Constraints.webp)
> Redash Sankey Chart’s Constraints

## 8.1. The Entire Codes

```sql
SELECT  
    step01 AS stage1,
    step02 AS stage2, 
    step03 AS stage3, 
    step04 AS stage4, 
    step05 AS stage5,  
    COUNT(*) AS value  
FROM 
	CTE_sankey  
GROUP BY 
	step01, step02, step03, step04, step05  
HAVING 
	step01 = 'Google Home' 
	AND value >= 100  
ORDER BY 
	value DESC
;
```

## 8.2. Detailed Explanation of Key Codes
```sql
HAVING
	step01 = ‘Google Home’ 
	AND value >= 100
```

* I just wanted to see how the users make their journey who is **starting from Google Home**.
* To make the visualization look simple and not distracting, I ordered the query to show me **the types of user journeys of at least 100 users**.

# 9. Final Result

![]({{ site.baseurl }}/assets/2023-05-21-sankey-chart/Redash returns this kind of Sankey Chart.webp)
> Redash returns this kind of Sankey Chart.

# 10. Conclusion

* **Redash Sankey Chart** is much more valuable specifically when you try to figure out how the users make their journey depending on their countries, devices, UTM parameters, referrer pages, and stuff like that.
* It’s superbly complicated to query, but once you make the whole framework queries to return the Sankey table, I believe you can generate more value to do as many actions as possible which wouldn’t have been possible to do before.
* Nevertheless, **Redash Sankey Chart** only supports up to `5 steps`, which by that means if your website or app has too many pages and screens, it wouldn’t be enough to look through only 5 steps.

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)