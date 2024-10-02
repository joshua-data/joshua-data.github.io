---
layout: post
title: "Harnessing the Power of BigQuery and Python: Overcoming Google Optimize A/B Testing Limitations"
tags:
  - Language (English)
  - Article (Issue Resolution)
  - Level (2. Intermediate)
  - Field (Data Analysis)
  - Skills (Python)
  - Skills (SQL)
---

> By connecting to BigQuery (where the experiment data is loaded) from Python and creating automated code, the analysis time can be significantly reduced, and it becomes easier to quickly determine the direction for further analysis when needed.

### CONTENTS
1. Introduction
    - 1.1. Why I Think of Google Optimize as Risky
    - 1.2. Google Analytics 4 May Offer Improvements in This Regard, But It Can be Quite Cumbersome.
    - 1.3. How Your A/B Test Data is Loaded Into BigQuery
2. To Connect Python with BigQuery
	- 2.1. Load Libraries
	- 2.2. Connect to Bigquery
	- 2.3. Enter the Basic Experiment Info
3. Extracting Data
    - 3.1. Purchase Conversion Rate
    - 3.2. Purchase Conversion Rate (by Country)
    - 3.3. Average Revenue per User
    - 3.4. Average Revenue per User (by Country)
    - 3.5. Other Aspects?
4. Start to Analyze Statistically
    - 4.1. Purchase Conversion Rate
    - 4.2. Average Revenue per User
    - 4.3. Conversion Rate & Average Revenue per User (by Country)
5. To Recap

---

# TL;DR

The dashboard of Google Optimize presents an excessively one-dimensional view when analyzing A/B tests, making it very risky to base service decisions solely on this.
-   Even if A/B testing may lead to the conclusion of maintaining option A across all user aspects, there can be cases within specific subgroups where the conclusion may favor option B. Unfortunately, Google Optimize does not provide such detailed analysis tools.
-   Google Optimize allows for setting a maximum of three goals, which include metrics such as purchase conversion rate and specific button click-through rate. However, to comprehensively examine actions on the following pages or retention rates, it is necessary to consider them all together. Unfortunately, Google Optimize does not provide such functionality.
-   There is indeed a valid concern regarding Google Optimize accurately measuring goal achievement if a user executes multiple sessions and makes a purchase in the last session while bypassing the experiment assignment page. It is questionable whether Google Optimize can accurately attribute this conversion as goal achievement.

While Google Analytics 4’s Explore feature provides a UI for in-depth analysis of experiment results, it can be quite cumbersome and time-consuming to manually check and explore the results every time.

Therefore, by connecting to BigQuery (where the experiment data is loaded) from Python and creating automated code, the analysis time can be significantly reduced, and it becomes easier to quickly determine the direction for further analysis when needed.

**⚠️Amber Alert!**  ️

> “Google Optimize and Optimize 360 will no longer be available after September 30, 2023. Your experiments and personalizations can continue to run until that date. Any experiments and personalizations still active on that date will end.
> 
> We launched Google Optimize over 5 years ago to enable businesses of all sizes to easily test and improve your user experiences. We remain committed to enabling businesses of all sizes to improve your user experiences and are investing in third-party A/B testing integrations for Google Analytics 4.”

by  [Google Resource Hub](https://support.google.com/optimize/answer/12979939?hl=en)

# 1. Introduction

## 1.1. Why I Think of Google Optimize as Risky

A/B testing is one of the most important growth methodologies in growth hacking. However, unfortunately, many startups do not have an independent A/B testing environment. As a result, many companies utilize A/B testing tools such as Amplitude’s Experiment feature, Optimizely, and Google’s Optimize. In the case of Google Optimize, which I am most familiar with, as shown in the image below, it only displays analysis results in a simple one-dimensional view.

![]({{ site.baseurl }}/assets/2023-06-04-overcoming-google-optimize/google-optimize.webp)
> Is that enough to analyze for your A/B test, indeed?

Deriving A/B test results solely based on such one-dimensional outcomes can pose significant risks.

Especially according to Chapter 6 of  [Product Analytics by Joanne Rodrigues](https://www.oreilly.com/library/view/product-analytics-applied/9780135258644/), the following pitfalls can occur in A/B testing:

1.  Even if there is no significant difference between the experimental group and the control group, there may be significant differences among specific subgroups, such as gender group, age group, country group, etc.
2.  In terms of CTR (Click-through rate), Group A may be less than B. However, in terms of subsequent page actions or retention, Group A may be greater than B, as well.

Additionally, based on my personal investigation, there seemed to be a limitation where users who were assigned to the A/B test, ended their session normally, and made a purchase through a different path rather than the experimental exposure page, did not appear properly on the Google Optimize dashboard.

In conclusion, it feels difficult to trust the Google Optimize dashboard, and relying on it to brief analysis results seems prone to errors.

## 1.2. Google Analytics 4 May Offer Improvements in This Regard, But It Can be Quite Cumbersome.

Experiment data from Google Optimize is transferred to Google Analytics 4, and when pre-defined audience settings are in place, it allows for the exploration of users from various perspectives within the Explore feature.

![]({{ site.baseurl }}/assets/2023-06-04-overcoming-google-optimize/ga4-explore.webp)
> Imagine that you click and drag here and there every time you should analyze a series of A/B tests.

However, repeatedly using such exploration features and finding insights within specific subgroups can be very time-consuming. While this level of analysis may be sufficient when conducting A/B tests only once, it becomes time-consuming when the tests need to be repeated multiple times.

## 1.3. How Your A/B Test Data is Loaded Into BigQuery

In the environment of our company where we conduct A/B tests at least once a week, I have decided to create an automated analysis tool using BigQuery and Python to minimize the time spent on A/B test analysis.

The flow of A/B test data executed in Google Optimize is roughly as follows:

![]({{ site.baseurl }}/assets/2023-06-04-overcoming-google-optimize/flowchart.webp)
> The flow of A/B test data executed in Google Optimize

The  `experiment_impression`  event generated in Google Analytics 4 is loaded into BigQuery as follows.

Event Parameters of `experiment_impression`
-   `experiment_id`: It signifies which experiment the user was exposed to. (You can find the unique ID of each experiment on the Google Optimize management page.)
-   `variant_id`: It signifies which group the user was assigned to within that experiment. It is represented by values in the format of  `experiment_id.{index}`, where 0, 1, 2, etc., indicate assignment to Group A, Group B, Group C, and so on in sequential order.

![]({{ site.baseurl }}/assets/2023-06-04-overcoming-google-optimize/bigquery.webp)
> The `experiment_impression` event and its parameters in BigQuery

# 2. To Connect Python with BigQuery

## 2.1. Load Libraries

```python
### Basics
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')

### Connector to BigQuery
from google.cloud import bigquery
from google.oauth2 import service_account

### A/B Test Analytics Libraries
import scipy.stats as stats
from scipy.stats import chi2_contingency
from statsmodels.stats import proportion

### Data Viz
import matplotlib.pyplot as plt
import seaborn as sns
%matplotlib inline
```

## 2.2. Connect to Bigquery

```python
FOLDERPATH = '/xxxxxxxxxxxxxxxxxx/config'  
KEY_NAME = 'xxxxxxxxxxxxxxxxx.json'  
KEY_PATH = FOLDERPATH + '/' + KEY_NAME  

CREDENTIALS = service_account.Credentials.from_service_account_file(KEY_PATH)  
  
client = bigquery.Client(  
    credentials = CREDENTIALS,  
    project = CREDENTIALS.project_id  
)
```

To connect with BigQuery, you need to create a service account within your BigQuery project and obtain the necessary credentials.

For detailed instructions, please refer to  [this guide](https://cloud.google.com/bigquery/docs/authentication/service-account-file?hl=en#python). It provides step-by-step instructions on how to create a service account and obtain the required credentials for accessing BigQuery.

## 2.3. Enter the Basic Experiment Info

```python
EXPERIMENT_ID = 'abc123ABC123'  
START_DATE, END_DATE = '2023-01-01', '2023-01-31'  
CONFIDENCE_LEVEL = 0.95  
ALPHA = 1 - CONFIDENCE_LEVEL
```

Please provide the  `EXPERIMENT_ID`  of the Google Optimize experiment you wish to analyze.

Please enter the experiment duration by specifying the  `START_DATE`  and  `END_DATE`  in the format of YYYY-MM-DD.
-   Note: It typically takes around 1.5 days for all data to be transferred from Google Optimize to GA4 and then to BigQuery. Therefore, it is recommended to wait for approximately 1–2 days after the experiment ends before starting the analysis. This will allow sufficient time for the data to be fully available for analysis.

# 3. Extracting Data

## 3.1. Purchase Conversion Rate

**Full Codes**

```python
SQL = f"""  
  
WITH  
CTE_raw AS (  
    SELECT
        *  
    FROM 
        `xxxxxxxxxxxxxxxxxxxx.events_*`  
    WHERE  
        _table_suffix BETWEEN 
            FORMAT_DATE('%Y%m%d', '{START_DATE}') 
            AND FORMAT_DATE('%Y%m%d', '{END_DATE}')  
        AND user_pseudo_ID IS NOT NULL  
),  

CTE_users_assigned AS (  
    SELECT  
        user_pseudo_id,  
        CASE  
            WHEN ENDS_WITH(assigned_params.value.string_value, '.0') THEN 'A'  
            WHEN ENDS_WITH(assigned_params.value.string_value, '.1') THEN 'B'  
        END AS test_group,  
        MIN(event_timestamp) AS assigned_timestamp  
    FROM
        CTE_raw  
    CROSS JOIN 
        UNNEST (event_params) AS assigned_params  
    WHERE  
        event_name = 'experiment_impression'  
        AND assigned_params.key = 'variant_id'  
        AND STARTS_WITH(assigned_params.value.string_value, '{EXPERIMENT_ID}') = True  
    GROUP BY 
        test_group, user_pseudo_id  
    ORDER BY 
        test_group, user_pseudo_id  
),  

CTE_users_purchased AS (  
    SELECT  
        user_pseudo_id,  
        event_timestamp AS purchase_timestamp   
    FROM 
        CTE_raw  
    WHERE  
        event_name = 'purchase'  
    ORDER BY  
        purchase_timestamp, user_pseudo_id  
),  

CTE_users_purchased_assigned_only AS (  
    SELECT  
        DISTINCT A.user_pseudo_id  
    FROM 
        CTE_users_purchased A  
    LEFT JOIN 
        CTE_users_assigned B  
        ON A.user_pseudo_id = B.user_pseudo_id  
        AND A.purchase_timestamp >= B.assigned_timestamp  
    WHERE  
        B.user_pseudo_id IS NOT NULL
        AND B.assigned_timestamp IS NOT NULL  
    ORDER BY 
        user_pseudo_id  
),  

CTE_users_purchase_cvr_group AS (  
    SELECT  
        A.user_pseudo_id,  
        A.test_group,  
        CASE  
            WHEN B.user_pseudo_id IS NOT NULL THEN 1  
            ELSE 0  
        END AS purchase  
    FROM 
        CTE_users_assigned A  
    LEFT JOIN 
        CTE_users_purchased_assigned_only B  
        ON A.user_pseudo_id = B.user_pseudo_id  
    ORDER BY 
        A.test_group, purchase DESC, A.user_pseudo_id      
)  

SELECT 
    * 
FROM 
    CTE_users_purchase_cvr_group
;
  
"""  

results = client.query(SQL)  
purchase_cvr_df = results.to_dataframe()
```

Feeling overwhelmed by all the code snippets? Don’t worry. I’ll guide you through each code snippet and explain what it means.

**1. Extract all events that occurred during the experiment period.**
-   Since  `START_DATE`  and  `END_DATE`  have already been defined earlier, let's input the variables themselves.

```sql
WITH  
CTE_raw AS (  
    SELECT
        *  
    FROM 
        `xxxxxxxxxxxxxxxxxxxx.events_*`  
    WHERE  
        _table_suffix BETWEEN 
            FORMAT_DATE('%Y%m%d', '{START_DATE}') 
            AND FORMAT_DATE('%Y%m%d', '{END_DATE}')  
        AND user_pseudo_ID IS NOT NULL  
),
```

**2. Extract information on which group each user was assigned to in the experiment and when they were initially assigned.**
-   Reason for including the initially assigned timestamp (`assigned_timestamp`) in the extraction: It is important to understand what actions users take after being assigned to the experiment, focusing on the actions that occur after the assignment. By excluding the pre-assignment actions, we establish a foundation for observing the causal relationship in A/B testing. Therefore, it is crucial to only observe the actions taken after the experiment assignment.

| **Example Results** | | |
| - | - | -
| Joshua | A | 2023-01-02
| Meghan | B | 2023-01-05
| Andrew | A | 2023-01-04
| ... | ... | ...

```sql
CTE_users_assigned AS (  
    SELECT  
        user_pseudo_id,  
        CASE  
            WHEN ENDS_WITH(assigned_params.value.string_value, '.0') THEN 'A'  
            WHEN ENDS_WITH(assigned_params.value.string_value, '.1') THEN 'B'  
        END AS test_group,  
        MIN(event_timestamp) AS assigned_timestamp  
    FROM
        CTE_raw  
    CROSS JOIN 
        UNNEST (event_params) AS assigned_params  
    WHERE  
        event_name = 'experiment_impression'  
        AND assigned_params.key = 'variant_id'  
        AND STARTS_WITH(assigned_params.value.string_value, '{EXPERIMENT_ID}') = True  
    GROUP BY 
        test_group, user_pseudo_id  
    ORDER BY 
        test_group, user_pseudo_id  
), 
```

**3. Extract all users who completed a purchase during the experiment period.**
-   This is still prior to extracting only the users exposed to the experiment. Don’t worry, we’ll get there.

```sql
CTE_users_purchased AS (  
    SELECT  
        user_pseudo_id,  
        event_timestamp AS purchase_timestamp   
    FROM 
        CTE_raw  
    WHERE  
        event_name = 'purchase'  
    ORDER BY  
        purchase_timestamp, user_pseudo_id  
),  
```

**4. Re-extract only the users exposed to the experiment from `CTE_users_purchased`.**

-   **Condition 1)** The  `user_pseudo_id`  must match the assigned  `user_pseudo_id`  in the experiment.
-   **Condition 2)** The  `assigned_timestamp`  in the experiment must be earlier than the  `purchase_timestamp`.

```sql
CTE_users_purchased_assigned_only AS (  
    SELECT  
        DISTINCT A.user_pseudo_id  
    FROM 
        CTE_users_purchased A  
    LEFT JOIN 
        CTE_users_assigned B  
        ON A.user_pseudo_id = B.user_pseudo_id  
        AND A.purchase_timestamp >= B.assigned_timestamp  
    WHERE  
        B.user_pseudo_id IS NOT NULL
        AND B.assigned_timestamp IS NOT NULL  
    ORDER BY 
        user_pseudo_id  
),  
```

**5. Extract the assigned group and the purchase conversion of the users assigned to the experiment simultaneously.**

| **Example Results** | | |
| - | - | -
| Joshua | A | 1
| Meghan | B | 0
| Andrew | A | 1
| ... | ... | ...

```sql
CTE_users_purchase_cvr_group AS (  
    SELECT  
        A.user_pseudo_id,  
        A.test_group,  
        CASE  
            WHEN B.user_pseudo_id IS NOT NULL THEN 1  
            ELSE 0  
        END AS purchase  
    FROM 
        CTE_users_assigned A  
    LEFT JOIN 
        CTE_users_purchased_assigned_only B  
        ON A.user_pseudo_id = B.user_pseudo_id  
    ORDER BY 
        A.test_group, purchase DESC, A.user_pseudo_id      
)

SELECT 
    * 
FROM 
    CTE_users_purchase_cvr_group
;
```

**6. Store the final extracted table as a Pandas DataFrame named `purchase_cvr_df`.**

```python
results = client.query(SQL)  
purchase_cvr_df = results.to_dataframe()
```

## 3.2. Purchase Conversion Rate (by Country)

**Full Codes**

```sql
WITH  
CTE_raw AS (  
    SELECT 
    *  
    FROM 
        `xxxxxxxxxxxxxxxxxxxx.events_*`  
    WHERE  
        _table_suffix BETWEEN 
            FORMAT_DATE('%Y%m%d', '{START_DATE}') 
            AND FORMAT_DATE('%Y%m%d', '{END_DATE}')  
        AND user_pseudo_ID IS NOT NULL  
),  

CTE_users_assigned AS (  
    SELECT  
        user_pseudo_id,  
        geo.country,  
        CASE  
            WHEN ENDS_WITH(assigned_params.value.string_value, '.0') THEN 'A'  
            WHEN ENDS_WITH(assigned_params.value.string_value, '.1') THEN 'B'  
        END AS test_group,  
        MIN(event_timestamp) AS assigned_timestamp  
    FROM 
        CTE_raw  
    CROSS JOIN 
        UNNEST (event_params) AS assigned_params  
    WHERE  
        event_name = 'experiment_impression'  
        AND assigned_params.key = 'variant_id'  
        AND STARTS_WITH(assigned_params.value.string_value, '{EXPERIMENT_ID}') = True  
    GROUP BY 
        test_group, geo.country, user_pseudo_id  
    ORDER BY 
        test_group, geo.country, user_pseudo_id  
),  

CTE_users_purchased AS (  
    SELECT  
        user_pseudo_id,  
        geo.country,  
        event_timestamp AS purchase_timestamp  
    FROM 
        CTE_raw  
    WHERE  
        event_name = 'purchase'  
    ORDER BY 
        purchase_timestamp, geo.country, user_pseudo_id  
),  

CTE_users_purchased_assigned_only AS (  
    SELECT  
        DISTINCT A.user_pseudo_id, A.country  
    FROM 
        CTE_users_purchased A  
    LEFT JOIN 
        CTE_users_assigned B  
        ON A.user_pseudo_id = B.user_pseudo_id  
        AND A.country = B.country  
        AND A.purchase_timestamp >= B.assigned_timestamp  
    WHERE  
        B.user_pseudo_id IS NOT NULL 
        AND B.assigned_timestamp IS NOT NULL  
    ORDER BY 
        A.country, user_pseudo_id  
),  

CTE_users_purchase_cvr_group AS (  
    SELECT  
        A.user_pseudo_id,  
        A.country,  
        A.test_group,  
        CASE  
            WHEN B.user_pseudo_id IS NOT NULL THEN 1  
            ELSE 0  
        END AS purchase  
    FROM 
        CTE_users_assigned A  
    LEFT JOIN 
        CTE_users_purchased_assigned_only B  
        ON A.user_pseudo_id = B.user_pseudo_id  
        AND A.country = B.country   
    ORDER BY 
        A.test_group, purchase DESC, A.user_pseudo_id  
)  

SELECT 
    * 
FROM 
    CTE_users_purchase_cvr_group
;
```

Everything is the same as I have guided you previously, except for the `geo.country` for grouping the users by their countries.

## 3.3. Average Revenue per User

**Full Codes**

```sql
SQL = """

WITH  
CTE_raw AS (  
    SELECT 
        *  
    FROM 
        `xxxxxxxxxxxxxxxxxxxx.events_*`  
    WHERE  
        _table_suffix BETWEEN 
            FORMAT_DATE('%Y%m%d', '{START_DATE}') 
            AND FORMAT_DATE('%Y%m%d', '{END_DATE}')  
        AND user_pseudo_ID IS NOT NULL  
),  

CTE_users_assigned AS (  
    SELECT  
        user_pseudo_id,  
        CASE  
            WHEN ENDS_WITH(assigned_params.value.string_value, '.0') THEN 'A'  
            WHEN ENDS_WITH(assigned_params.value.string_value, '.1') THEN 'B'  
        END AS test_group,  
        MIN(event_timestamp) AS assigned_timestamp  
    FROM 
        CTE_raw  
    CROSS JOIN 
        UNNEST (event_params) AS assigned_params  
    WHERE  
        event_name = 'experiment_impression'  
        AND assigned_params.key = 'variant_id'  
        AND STARTS_WITH(assigned_params.value.string_value, '{EXPERIMENT_ID}') = True  
    GROUP BY 
        test_group, user_pseudo_id  
    ORDER BY 
        test_group, user_pseudo_id  
),  

CTE_txids_revenue AS (  
    SELECT  
        ecommerce.transaction_id AS txid,  
        user_pseudo_id,  
        event_timestamp AS purchase_timestamp,  
        ecommerce.purchase_revenue_in_usd AS revenue  
    FROM 
        CTE_raw  
    WHERE  
        event_name = 'purchase'  
    ORDER BY 
        revenue DESC, txid, user_pseudo_id  
),  

CTE_txids_revenue_assigned_only AS (  
    SELECT  
        A.txid,  
        A.user_pseudo_id,  
        A.purchase_timestamp,  
        A.revenue  
    FROM 
        CTE_txids_revenue A  
    LEFT JOIN 
        CTE_users_assigned B  
        ON A.user_pseudo_id = B.user_pseudo_id  
        AND A.purchase_timestamp >= B.assigned_timestamp  
    WHERE  
        B.user_pseudo_id IS NOT NULL 
        AND B.assigned_timestamp IS NOT NULL  
),  

CTE_users_revenue AS (  
    SELECT  
        user_pseudo_id,  
        SUM(revenue) AS revenue_usd  
    FROM 
        CTE_txids_revenue_assigned_only  
    GROUP BY 
        user_pseudo_id  
    ORDER BY 
        revenue_usd DESC  
),  

CTE_users_arpu_group AS (  
    SELECT  
        A.user_pseudo_id,  
        A.test_group,  
        CASE  
            WHEN B.revenue_usd IS NOT NULL THEN B.revenue_usd  
            ELSE 0  
        END AS revenue_usd  
    FROM 
        CTE_users_assigned A  
    LEFT JOIN 
        CTE_users_revenue B  
        ON A.user_pseudo_id = B.user_pseudo_id  
    ORDER BY 
        A.test_group, B.revenue_usd DESC, A.user_pseudo_id  
)  

SELECT 
    * 
FROM 
    CTE_users_arpu_group
;

"""

results = client.query(SQL)  
arpu_df = results.to_dataframe()
```

Feeling overwhelmed by all the code snippets? Don’t worry. I’ll guide you through each code snippet and explain what it means.

**1. Extract all events that occurred during the experiment period.**
-   This is the same as we already discussed earlier in the **“Purchase Conversion Rate”**.

**2. Extract information on which group each user was assigned to in the experiment and when they were initially assigned.**
-   This is the same as we already discussed earlier in the **“Purchase Conversion Rate”**.

**3. Extract the `transaction_id`, `user_pseudo_id`, `purchase_timestamp`, and `revenue` for each transaction during the experiment period.**
-   This is still prior to extracting only the users exposed to the experiment. Don’t worry, we’ll get there.

```sql
CTE_txids_revenue AS (  
    SELECT  
        ecommerce.transaction_id AS txid,  
        user_pseudo_id,  
        event_timestamp AS purchase_timestamp,  
        ecommerce.purchase_revenue_in_usd AS revenue  
    FROM 
        CTE_raw  
    WHERE  
        event_name = 'purchase'  
    ORDER BY 
        revenue DESC, txid, user_pseudo_id  
),  
```

**4. Re-extract only the users’ transactions exposed to the experiment from `CTE_txids_revenue`.**
-   **Condition 1)** The  `user_pseudo_id`  must match the assigned  `user_pseudo_id`  in the experiment.
-   **Condition 2)** The  `assigned_timestamp`  in the experiment must be earlier than the  `purchase_timestamp`.

```sql
CTE_txids_revenue_assigned_only AS (  
    SELECT  
        A.txid,  
        A.user_pseudo_id,  
        A.purchase_timestamp,  
        A.revenue  
    FROM 
        CTE_txids_revenue A  
    LEFT JOIN 
        CTE_users_assigned B  
        ON A.user_pseudo_id = B.user_pseudo_id  
        AND A.purchase_timestamp >= B.assigned_timestamp  
    WHERE  
        B.user_pseudo_id IS NOT NULL 
        AND B.assigned_timestamp IS NOT NULL  
),  
```

**5. Represent the data at the user level instead of the transaction ID level.**

```sql
CTE_users_revenue AS (  
    SELECT  
        user_pseudo_id,  
        SUM(revenue) AS revenue_usd  
    FROM 
        CTE_txids_revenue_assigned_only  
    GROUP BY 
        user_pseudo_id  
    ORDER BY 
        revenue_usd DESC  
),  
```

**6. Extract the assigned group and purchase amount of the users assigned to the experiment in a single query.**

| **Example Results** | | |
| - | - | -
| Joshua | A | $100
| Meghan | B | $200
| Andrew | A | $300
| ... | ... | ...

```sql
CTE_users_arpu_group AS (  
    SELECT  
        A.user_pseudo_id,  
        A.test_group,  
        CASE  
            WHEN B.revenue_usd IS NOT NULL THEN B.revenue_usd  
            ELSE 0  
        END AS revenue_usd  
    FROM 
        CTE_users_assigned A  
    LEFT JOIN 
        CTE_users_revenue B  
        ON A.user_pseudo_id = B.user_pseudo_id  
    ORDER BY 
        A.test_group, B.revenue_usd DESC, A.user_pseudo_id  
)  

SELECT 
    * 
FROM 
    CTE_users_arpu_group
;
```

**7. Store the final extracted table as a Pandas DataFrame named `arpu_df`.**

```python
results = client.query(SQL)  
arpu_df = results.to_dataframe()
```

## 3.4. Average Revenue per User (by Country)

**Full Codes**

```sql
WITH  
CTE_raw AS (  
    SELECT 
        *  
    FROM 
        `xxxxxxxxxxxxxxxxxxxx.events_*`  
    WHERE  
        _table_suffix BETWEEN 
            FORMAT_DATE('%Y%m%d', '{START_DATE}') 
            AND FORMAT_DATE('%Y%m%d', '{END_DATE}')  
        AND user_pseudo_ID IS NOT NULL  
),  

CTE_users_assigned AS (  
    SELECT  
        user_pseudo_id,  
        geo.country,  
        CASE  
            WHEN ENDS_WITH(assigned_params.value.string_value, '.0') THEN 'A'  
            WHEN ENDS_WITH(assigned_params.value.string_value, '.1') THEN 'B'  
        END AS test_group,  
        MIN(event_timestamp) AS assigned_timestamp  
    FROM 
        CTE_raw  
    CROSS JOIN 
        UNNEST (event_params) AS assigned_params  
    WHERE  
        event_name = 'experiment_impression'  
        AND assigned_params.key = 'variant_id'  
        AND STARTS_WITH(assigned_params.value.string_value, '{EXPERIMENT_ID}') = True  
    GROUP BY 
        test_group, geo.country, user_pseudo_id  
    ORDER BY 
        test_group, geo.country, user_pseudo_id  
),

CTE_txids_revenue AS (  
    SELECT  
        ecommerce.transaction_id AS txid,  
        user_pseudo_id,  
        geo.country,  
        event_timestamp AS purchase_timestamp,  
        ecommerce.purchase_revenue_in_usd AS revenue  
    FROM 
        CTE_raw  
    WHERE  
        event_name = 'purchase'  
    ORDER BY 
        revenue DESC, txid, user_pseudo_id  
),  

CTE_txids_revenue_assigned_only AS (  
    SELECT  
        A.txid,  
        A.user_pseudo_id,  
        A.country,  
        A.purchase_timestamp,  
        A.revenue  
    FROM 
        CTE_txids_revenue A  
    LEFT JOIN 
        CTE_users_assigned B  
        ON A.user_pseudo_id = B.user_pseudo_id  
        AND A.country = B.country  
        AND A.purchase_timestamp >= B.assigned_timestamp  
    WHERE  
        B.user_pseudo_id IS NOT NULL 
        AND B.assigned_timestamp IS NOT NULL  
),  

CTE_users_revenue AS (  
    SELECT  
        user_pseudo_id,  
        country,  
        SUM(revenue) AS revenue_usd  
    FROM 
        CTE_txids_revenue_assigned_only  
    GROUP BY 
        country, user_pseudo_id  
    ORDER BY 
        revenue_usd DESC  
),

CTE_users_arpu_group AS (  
    SELECT  
        A.user_pseudo_id,  
        A.country,  
        A.test_group,  
        CASE  
            WHEN B.revenue_usd IS NOT NULL THEN B.revenue_usd  
            ELSE 0  
        END AS revenue_usd  
    FROM 
        CTE_users_assigned A  
    LEFT JOIN 
        CTE_users_revenue B  
        ON A.user_pseudo_id = B.user_pseudo_id  
        AND A.country = B.country  
    ORDER BY 
        A.test_group, B.revenue_usd DESC, A.user_pseudo_id  
)  

SELECT 
    * 
FROM 
    CTE_users_arpu_group
;
```

Everything is the same as I have guided you previously, except for the  `geo.country`  for grouping the users by their countries.

## 3.5. Other Aspects?

For the sake of brevity, I will omit the details regarding device-specific goal achievement and CTR for different buttons, as they are not significantly different from the provided SQL queries.

# 4. Start to Analyze Statistically

## 4.1. Purchase Conversion Rate

**1. Did the data meet the assumptions prior to the analysis of A/B Test?**

```python
na = purchase_cvr_df.groupby('test_group')['user_pseudo_id'].count()[0]  
nb = purchase_cvr_df.groupby('test_group')['user_pseudo_id'].count()[1]  
print(na, nb)

na = purchase_cvr_df.groupby('test_group')['user_pseudo_id'].count()[0]  
nb = purchase_cvr_df.groupby('test_group')['user_pseudo_id'].count()[1]  
  
xa = purchase_cvr_df.groupby('test_group')['purchase'].sum()[0]  
xb = purchase_cvr_df.groupby('test_group')['purchase'].sum()[1]  
  
pa = xa / na  
pb = xb / nb  
  
if (na * pa < 5) or (na * (1 - pa) < 5) or (nb * pb < 5) or (nb * (1 - pb) < 5):  
    print('Did not meet the assumptions!')  
else:  
    print('Met the assumptions!')
```

**2. Start to Analyze.**

```python
z_result = proportion.proportions_ztest(  
    count = [xa, xb],  
    nobs = [na, nb],  
    alternative = 'smaller' # two-sided, smaller, larger  
)  
z, p_value = z_result  
  
print('The results of the A/B test are as follows. (Confidence Level:', f'{str(CONFIDENCE_LEVEL * 100)}%)')  
  
if p_value < ALPHA:  
  print('> The null hypothesis can be rejected. (A < B)')   
else:  
  print('> The null hypothesis can not be rejected. (A >= B)')  
  
print('=====================================')  
  
(a_lower, b_lower), (a_upper, b_upper) = proportion.proportion_confint(  
    [xa, xb],  
    nobs = [na, nb],  
    alpha = ALPHA  
)  
  
print(f'p-value = {p_value:.4f}')  
print('> Conversion Rate of Group A:', f'{pa * 100:.2f}%', f'({str(CONFIDENCE_LEVEL * 100)}% Confidence Interval: {a_lower * 100:.2f}% ~ {a_upper * 100:.2f}%)')  
print('> Conversion Rate of Group B:', f'{pb * 100:.2f}%', f'({str(CONFIDENCE_LEVEL * 100)}% Confidence Interval: {b_lower * 100:.2f}% ~ {b_upper * 100:.2f}%)')
```

**3. Visualize**

```python
plt.figure(figsize=(5,2.5))  
  
plt.plot(  
    (a_lower*100, a_upper*100), (0, 0), 'ro-', color='blue'  
)  
plt.plot(  
    (b_lower*100, b_upper*100), (1, 1), 'ro-', color='red'  
)  
plt.yticks(range(2), ['A', 'B'])  
plt.title(f'Conversion Rate ({str(CONFIDENCE_LEVEL * 100)}% Confidence Level)')  
plt.xlabel('Conversion Rate (%)')  
plt.ylabel('Group')  
  
plt.show();
```

## 4.2. Average Revenue per User

**1. Did the data meet the assumptions prior to the analysis of A/B Test?**

```python
na = arpu_df.groupby('test_group')['user_pseudo_id'].count()[0]  
nb = arpu_df.groupby('test_group')['user_pseudo_id'].count()[1]  
  
if na + nb < 30:  
    print('Did not meet the assumptions!')  
else:  
    print('Met the assumptions!')
```

**2. Preliminary Analysis: Homogeneity of Variance Test `(Bartlett’s Test)`**

```python
stat, p_value = stats.bartlett(  
    arpu_df[arpu_df['test_group'] == 'A']['revenue_usd'].reset_index(drop=True),  
    arpu_df[arpu_df['test_group'] == 'B']['revenue_usd'].reset_index(drop=True)  
)  
  
print('The result of the homoscedasticity test is as follows. (Confidence Level:', f'{str(CONFIDENCE_LEVEL * 100)}%)')  
  
if p_value < ALPHA:  
    print('> The variances of the two groups are different.')  
    EQUAL_VAR = False  
else:  
    print('> The variances of the two groups are same.')  
    EQUAL_VAR = True
```

**3. Start to Analyze.**

```python
t_result = stats.ttest_ind(  
    arpu_df[arpu_df['test_group'] == 'A']['revenue_usd'].reset_index(drop=True),  
    arpu_df[arpu_df['test_group'] == 'B']['revenue_usd'].reset_index(drop=True),  
    equal_var = EQUAL_VAR,  
    alternative = 'less'  
)  
t, p_value = t_result  
  
print('The results of the A/B test are as follows. (Confidence Level:', f'{str(CONFIDENCE_LEVEL * 100)}%)')  
  
if p_value < ALPHA:  
  print('> The null hypothesis can be rejected. (A < B)')   
else:  
  print('> The null hypothesis can not be rejected. (A >= B)')  
  
print('=====================================')  
  
mean_a = arpu_df.groupby('test_group')['revenue_usd'].mean()[0]  
mean_b = arpu_df.groupby('test_group')['revenue_usd'].mean()[1]  
std_a = arpu_df.groupby('test_group')['revenue_usd'].std()[0]  
std_b = arpu_df.groupby('test_group')['revenue_usd'].std()[1]  
  
a_lower, a_upper = stats.t.interval(  
    confidence = ALPHA,  
    df = arpu_df[arpu_df['test_group'] == 'A']['revenue_usd'].reset_index(drop=True).shape[0] - 1,  
    loc = mean_a,  
    scale = std_a  
)  
b_lower, b_upper = stats.t.interval(  
    confidence = ALPHA,  
    df = arpu_df[arpu_df['test_group'] == 'B']['revenue_usd'].reset_index(drop=True).shape[0] - 1,  
    loc = mean_b,  
    scale = std_b  
)  
  
print(f'p-value = {p_value:.4f}')  
print('> A안의 ARPU:', f'US${mean_a:.2f}', f'({str(CONFIDENCE_LEVEL * 100)}% Confidence Interval: US${a_lower:.2f} ~ US${a_upper:.2f})')  
print('> B안의 ARPU:', f'US${mean_b:.2f}', f'({str(CONFIDENCE_LEVEL * 100)}% Confidence Interval: US${b_lower:.2f} ~ US${b_upper:.2f})')
```

**4. Visualize**

```python
plt.figure(figsize=(5,2.5))  
  
plt.plot(  
    (a_lower, a_upper), (0, 0), 'ro-', color='blue'  
)  
plt.plot(  
    (b_lower, b_upper), (1, 1), 'ro-', color='red'  
)  
plt.yticks(range(2), ['A', 'B'])  
plt.title(f'ARPU ({str(CONFIDENCE_LEVEL * 100)}% Confidence Leve)')  
plt.xlabel('ARPU (USD)')  
plt.ylabel('Group')  
  
plt.show();
```

**5. Visualize the Histogram of Purchase Amount by User `(KDE Plot)`**
-   Checking for Data Bias due to Extremely High Purchase Amounts by Certain Minority of Users

```python
plt.figure(figsize=(10, 4))  
  
sns.kdeplot(  
    data = arpu_df[arpu_df['test_group'] == 'A']['revenue_usd'].reset_index(drop=True),  
    color = 'blue',  
    fill = True,  
    label = 'Group A'  
)  
sns.kdeplot(  
    data = arpu_df[arpu_df['test_group'] == 'B']['revenue_usd'].reset_index(drop=True),  
    color = 'red',  
    fill = True,  
    label = 'Group B'  
) 

plt.title(f'Distribution of User Purchase Amounts')  
plt.xlabel('User Purchase Amounts (USD)')  
plt.ylabel('Proportion')  
plt.legend()  
plt.xlim(0, 10000)  
  
plt.show();
```

## 4.3. Conversion Rate & Average Revenue per User (by Country)

-   In the following query, I have categorized countries into the US vs Others. However, depending on the distribution of countries currently using your service, it may be possible to further divide them into smaller groups.

```python
plt.figure(figsize=(10, 8))  
  
# Conversion Rate  
plt.subplot(2, 1, 1)  
  
temp_df = purchase_cvr_by_country_df  
temp_df.loc[  
    (temp_df['country'] != 'United States'),  
    'country'  
] = 'Others'  
  
sns.barplot(  
    data = temp_df,  
    x = 'country',  
    y = 'purchase',  
    hue = 'test_group',  
    hue_order = ['A', 'B'],  
    palette = 'coolwarm',  
    order = ['United States', 'Others']      
)  
  
plt.title('Conversion Rate (by Countries)')  
plt.legend(title='Group')  
plt.xlabel('Country')  
plt.ylabel('Conversion Rate')  
  
# ARPU  
plt.subplot(2, 1, 2)  
  
temp_df = arpu_by_country_df  
temp_df.loc[  
    (temp_df['country'] != 'United States'),  
    'country'  
] = 'Others'  
  
sns.barplot(  
    data = temp_df,  
    x = 'country',  
    y = 'revenue_usd',  
    hue = 'test_group',  
    hue_order = ['A', 'B'],  
    palette = 'coolwarm',  
    order = ['United States', 'Others']      
)  
  
plt.title('ARPU (by Countries)')  
plt.legend(title='Group')  
plt.xlabel('Country')  
plt.ylabel('ARPU (USD)')  
  
# Display!  
plt.tight_layout()  
plt.show();
```

# 5. To Recap 
> (Honestly, it’s TL;DR again.😅)

The dashboard of Google Optimize presents an excessively one-dimensional view when analyzing A/B tests, making it very risky to base service decisions solely on this.

-   Even if A/B testing may lead to the conclusion of maintaining option A across all user aspects, there can be cases within specific subgroups where the conclusion may favor option B. Unfortunately, Google Optimize does not provide such detailed analysis tools.
-   Google Optimize allows for setting a maximum of three goals, which include metrics such as purchase conversion rate and specific button click-through rate. However, to comprehensively examine actions on the following pages or retention rates, it is necessary to consider them all together. Unfortunately, Google Optimize does not provide such functionality.
-   There is indeed a valid concern regarding Google Optimize accurately measuring goal achievement if a user executes multiple sessions and makes a purchase in the last session while bypassing the experiment assignment page. It is questionable whether Google Optimize can accurately attribute this conversion as goal achievement.

While Google Analytics 4’s Explore feature provides a UI for in-depth analysis of experiment results, it can be quite cumbersome and time-consuming to manually check and explore the results every time.

Therefore, by connecting to BigQuery (where the experiment data is loaded) from Python and creating automated code, the analysis time can be significantly reduced, and it becomes easier to quickly determine the direction for further analysis when needed.

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)