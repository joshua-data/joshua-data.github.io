---
layout: post
title: "It’s Harder than You Think to Extract DAU Separating New and Existing Users in BigQuery"
tags:
  - Language (English)
  - Article (Issue Resolution)
  - Level (Beginner)
  - Field (Data Analysis)
  - Skills (SQL)
---

> In this article, I’m going to talk about how to extract DAU separating new users and existing users directly from BigQuery. I prepared an insightful example to share some intuition with you, so that you can better understand.

### CONTENTS
1.  Full BigQuery Codes
2.  Step by Step
3.  An Intuitive Example
4.  Review Full BigQuery Codes

---

![]({{ site.baseurl }}/assets/2023-06-14-extract-dau-separating-new-and-existing-users/data-pipeline.webp)
> Data pipeline from the website all the way up to Redash

# 1. Full BigQuery Codes

```sql
WITH  
CTE_flattened AS (  
  -- Confidential  
),  
CTE_users_min_gsn AS (  
    SELECT  
        PARSE_DATE('%Y%m%d', event_date) AS date,  
        user_pseudo_id,  
        MIN(ga_session_number) AS min_gsn  
    FROM
	    CTE_flattened  
    WHERE 
	    event_name = 'session_start'  
    GROUP BY 
	    event_date, user_pseudo_id  
)  
SELECT  
    date,  
    COUNT(DISTINCT user_pseudo_id) AS dau_all,  
    COUNT(DISTINCT CASE WHEN min_gsn <> 1 THEN user_pseudo_id END) AS dau_existing,  
    COUNT(DISTINCT CASE WHEN min_gsn = 1 THEN user_pseudo_id END) AS dau_new  
FROM
	CTE_users_min_gsn  
GROUP BY 
	date  
ORDER BY 
	date  
;
```

# 2. Step by Step

## 2.1. Daily Initial Session Sequence Values

First off, extract the **daily initial session sequence values** of all the users triggering `session_start`event.
* the session sequence values are named `ga_session_number`in [BigQuery Export Schema of Google Analytics 4](https://support.google.com/analytics/answer/7029846?hl=en#zippy=%2Cevent).
* When a user(`user_pseudo_id`) starts their session for the first time, the  `ga_session_number`  in the event parameters equals to `1`, and then it increases sequentially each time the user returns and starts the new session again.

```sql
CTE_users_min_gsn AS (  
    SELECT  
        PARSE_DATE('%Y%m%d', event_date) AS date,  
        user_pseudo_id,  
        MIN(ga_session_number) AS min_gsn  
    FROM
	    CTE_flattened
    WHERE 
	    event_name = 'session_start'  
    GROUP BY 
	    event_date, user_pseudo_id  
)
```

## 2.2. Separating New & Existing Users

For the second step, categorize users as new or existing based on whether the **daily initial session sequence value** is `1` or `not` on a daily basis.
* A user named Joshua, who first visited your website for example, can trigger multiple `session_start`events in a single day.
* Even though he returns to the website after his first visit, he should be still regarded as one of the new users when calculating on a daily basis.
* That 's why I mentioned above that you need to extract the **"daily" initial session sequence values** of all the users.

```sql
SELECT  
    date,  
    COUNT(DISTINCT user_pseudo_id) AS dau_all,  
    COUNT(DISTINCT CASE WHEN min_gsn <> 1 THEN user_pseudo_id END) AS dau_existing,  
    COUNT(DISTINCT CASE WHEN min_gsn = 1 THEN user_pseudo_id END) AS dau_new  
FROM
	CTE_users_min_gsn  
GROUP BY 
	date  
ORDER BY 
	date
;
```

# 3. An Intuitive Example

| | **Jan 1, before noon** | **Jan 1, afternoon** |
| - | - | - |
| **Joshua** | 1st Visit | 2nd Visit |
| **Shane** | - | 1st Visit |
| **Chloe** | 2nd Visit | - |
| **Angela** | 1st Visit | 2nd Visit |

On January 1st, the DAU will be:
* `3 New Users` (Joshua, Shane, and Angela)
* `1 Existing User` (Chloe)

Keep in mind that Joshua and Angela are regarded as the new users **in spite of the fact that they made their second visit**.

### STEP 1. Identify the session sequence values of all the users.

| | **Jan 1, before noon** | **Jan 1, afternoon** |
| - | - | - |
| **Joshua** | `ga_session_number` = 1 | `ga_session_number` = 2 |
| **Shane** | - | `ga_session_number` = 1 |
| **Chloe** | `ga_session_number` = 45 | - |
| **Angela** | `ga_session_number` = 1 | `ga_session_number` = 2 |

### STEP2. Aggregate each user with the minimum session sequence value.

| | **Jan 1** |
| - | - |
| **Joshua** | `ga_session_number` = 1 |
| **Shane** | `ga_session_number` = 1 |
| **Chloe** | `ga_session_number` = 45 |
| **Angela** | `ga_session_number` = 1 |

### STEP 3. Classify each user as a new or existing user based on whether or not the minimum session sequence value equals to 1.

| | **Jan 1** |
| - | - |
| **Joshua** | `New User` |
| **Shane** | `New User` |
| **Chloe** | `Existing User` |
| **Angela** | `New User` |

# 4. Review Full BigQuery Codes

```sql
WITH  
CTE_flattened AS (  
  -- Confidential  
),  
CTE_users_min_gsn AS (  
    SELECT  
        PARSE_DATE('%Y%m%d', event_date) AS date,  
        user_pseudo_id,  
        MIN(ga_session_number) AS min_gsn  
    FROM
	    CTE_flattened  
    WHERE 
	    event_name = 'session_start'  
    GROUP BY 
	    event_date, user_pseudo_id  
)  
SELECT  
    date,  
    COUNT(DISTINCT user_pseudo_id) AS dau_all,  
    COUNT(DISTINCT CASE WHEN min_gsn <> 1 THEN user_pseudo_id END) AS dau_existing,  
    COUNT(DISTINCT CASE WHEN min_gsn = 1 THEN user_pseudo_id END) AS dau_new  
FROM
	CTE_users_min_gsn  
GROUP BY 
	date  
ORDER BY 
	date  
;
```

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)