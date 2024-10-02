---
layout: post
title: "Dramatic Increase in E-commerce Conversion Rates"
tags:
  - Language (English)
  - Article (Project)
  - Level (1. Beginner)
  - Field (Data Analysis)
  - Skills (SQL)
---

> "By analyzing the data of new visitors that increased due to external factors, I achieved a significant rise in purchase conversion rates. The data revealed a substantial increase in the number of new visitors and their purchasing intent, but also identified a high dropout rate at the payment stage. Based on the hypothesis that the inconvenience in the payment process was the main cause, I introduced PayPal Express Checkout to enhance user experience. As a result, the payment conversion rate increased by 32%p, reaching a much higher level than before, and this improvement has been sustained. This demonstrates effective problem-solving and performance enhancement based on data analysis."

---

| **Performance Summary** |
| - |
| - Conversion Rate (`add_payment_info` → `purchase`): 32%p ↑ | 

---

# Table of Contents
1. STAR Summary
2. Situation
3. Tasks
4. Actions
5. Results

---

# 1. STAR Summary

### Situation
* In 2023, our company experienced **an unexpected increase in sales** due to a major competitor, who holds the largest market share globally, becoming embroiled in business controversy.
* As a result, there was a surge in new visitors to our online store, which was identified as a phenomenon driven by changes in the external market, rather than the outcome of our internal marketing efforts.
* As a data analyst, I proactively monitored the data to deeply analyze these unusual market movements, focusing particularly on **the acquisition channels and purchasing behavior patterns of new visitors.**

### Tasks
* In the context of a surge in new visitors, I discovered **a high dropout rate in the payment process.**
* A detailed analysis of the dropout points at each stage of the purchase funnel revealed that many customers were **abandoning their processes after entering their payment information.**
* Recognizing that **UX in the payment process** significantly affects purchase conversion, I identified a need to improve the user experience by clearly defining the problem.
* Additionally, I concluded that the decline in conversion rates might be related to the natural increase in organic user acquisition due to external factors and changes in user segments.

### Actions
* Based on the identified problem, I shared it with internal stakeholders and discussed several action plans to improve the payment process.
* As a result of the discussions, we decided to **first introduce the easy payment service, PayPal Express Checkout**, to reduce the dropout rate in the payment process.
* This was deemed the most realistic and effective solution to streamline the payment steps and provide a convenient payment experience to users, thereby increasing conversion rates.
* After implementing this feature, I focused on minimizing user discomfort during the payment process and enhancing security trustworthiness, thereby improving UX.

### Results
* After introducing the PayPal Express Checkout feature, the dropout issue during the payment process significantly improved, and **the conversion rate from `add_payment_info` to `purchase` increased by 32 percentage points compared to before.**
* This action not only restored the conversion rate to its original level by simplifying the payment process and improving the user experience but **also maintained a high level to this day**.
* This result demonstrates that diversifying payment options and introducing easy payment methods are effective strategies, showing that problem-solving based on data analysis has had a positive impact on sales performance.

---

# 2. Situation
> * In 2023, our company experienced **an unexpected increase in sales** due to a major competitor, who holds the largest market share globally, becoming embroiled in business controversy.
> * As a result, there was a surge in new visitors to our online store, which was identified as a phenomenon driven by changes in the external market, rather than the outcome of our internal marketing efforts.
> * As a data analyst, I proactively monitored the data to deeply analyze these unusual market movements, focusing particularly on **the acquisition channels and purchasing behavior patterns of new visitors.**

### Detailed Situation
* In 2023, a competitor with the top market share globally became heavily embroiled in business controversy, resulting in a windfall for our company, with a significant increase in sales on our own website. This was due to external market influences rather than the results of our internal marketing efforts.
* As a data analyst, I also wanted to deeply monitor and follow up on this "**abnormal phenomenon caused by unusual market flows.**"

### Data Follow-up

1. The number of new visitors surged.
   <details>
   <summary>View Query</summary>
   <div markdown="1">
   ```sql
      WITH
      CTE_raw AS (
         SELECT
            event_date,
            user_pseudo_id,
            (SELECT value.int_value FROM UNNEST (event_params) WHERE key = 'ga_session_number') AS ga_session_number
         FROM `project_id.dataset_id.events_*`
         WHERE
            _table_suffix BETWEEN FORMAT_DATE('%Y%m%d', 'START DATE') AND FORMAT_DATE('%Y%m%d', 'END DATE')
      ),

      CTE_users_min_gsn AS (
         SELECT
            event_date,
            user_pseudo_id,
            MIN(ga_session_number) AS min_gsn
         FROM
            CTE_raw
         GROUP BY
            1, 2
      )

      SELECT
         event_date,
         COUNT(DISTINCT user_pseudo_id) AS users_cnt
      FROM
         CTE_users_min_gsn
      WHERE
         min_gsn = 1
      GROUP BY
         1
      ORDER BY
         1
   ```
   </div>
   </details> 
![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/1.png)

2. These visitors primarily entered through organic traffic and from the United States.
   * Number of New Users (by Country)
      <details>
      <summary>View Query</summary>
      <div markdown="1">
      ```sql
      WITH
      CTE_raw AS (
         SELECT
            event_date,
            user_pseudo_id,
            (SELECT value.int_value FROM UNNEST (event_params) WHERE key = 'ga_session_number') AS ga_session_number,
            geo.country
         FROM `project_id.dataset_id.events_*`
         WHERE
            _table_suffix BETWEEN FORMAT_DATE('%Y%m%d', 'START DATE') AND FORMAT_DATE('%Y%m%d', 'END DATE')
      ),

      CTE_users_min_gsn AS (
         SELECT
            event_date,
            user_pseudo_id,
            country,
            MIN(ga_session_number) AS min_gsn
         FROM
            CTE_raw
         GROUP BY
            1, 2, 3
      ),

      CTE_top20_countries AS (
         SELECT
            country,
            COUNT(DISTINCT user_pseudo_id) AS users_cnt
         FROM
            CTE_users_min_gsn
         WHERE
            min_gsn = 1
         GROUP BY
            1
         ORDER BY
            2 DESC
         LIMIT
            20
      ),

      CTE_result AS (
         SELECT
            event_date,
            CASE
                  WHEN country IN (SELECT country FROM CTE_top20_countries) THEN country
                  ELSE '(Others)'
            END AS country,
            COUNT(DISTINCT user_pseudo_id) AS users_cnt
         FROM
            CTE_users_min_gsn
         WHERE
            min_gsn = 1
         GROUP BY
            1, 2
      )

      SELECT
         *
      FROM
         CTE_result
      ORDER BY
         1, 3 DESC
      ```
      </div>
      </details>  
      ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/3.png)

   * Number of New Users (by First UTM Parameters)
      <details>
      <summary>View Query</summary>
      <div markdown="1">
      ```sql
      WITH
      CTE_raw AS (
         SELECT
            event_date,
            user_pseudo_id,
            (SELECT value.int_value FROM UNNEST (event_params) WHERE key = 'ga_session_number') AS ga_session_number,
            traffic_source.name AS first_campaign,
            traffic_source.medium AS first_medium,
            traffic_source.source AS first_source
         FROM `project_id.dataset_id.events_*`
         WHERE
            _table_suffix BETWEEN FORMAT_DATE('%Y%m%d', 'START DATE') AND FORMAT_DATE('%Y%m%d', 'END DATE')
      ),

      CTE_users_min_gsn AS (
         SELECT
            event_date,
            user_pseudo_id,
            first_campaign,
            first_medium,
            first_source,
            MIN(ga_session_number) AS min_gsn
         FROM
            CTE_raw
         GROUP BY
            1, 2, 3, 4, 5
      ),

      CTE_top20_utms AS (
         SELECT
            COALESCE(first_campaign, '(Unknown)') || ' > ' || COALESCE(first_medium, '(Unknown)') || ' > ' || COALESCE(first_source, '(Unknown)') AS utm,
            COUNT(DISTINCT user_pseudo_id) AS users_cnt
         FROM
            CTE_users_min_gsn
         WHERE
            min_gsn = 1
         GROUP BY
            1
         ORDER BY
            2 DESC
         LIMIT
            20
      ),

      CTE_result AS (
         SELECT
            event_date,
            CASE
                  WHEN COALESCE(first_campaign, '(Unknown)') || ' > ' || COALESCE(first_medium, '(Unknown)') || ' > ' || COALESCE(first_source, '(Unknown)') IN (SELECT utm FROM CTE_top20_utms) THEN COALESCE(first_campaign, '(Unknown)') || ' > ' || COALESCE(first_medium, '(Unknown)') || ' > ' || COALESCE(first_source, '(Unknown)')
                  ELSE '(Others)'
            END AS utm,
            COUNT(DISTINCT user_pseudo_id) AS users_cnt
         FROM
            CTE_users_min_gsn
         WHERE
            min_gsn = 1
         GROUP BY
            1, 2
      )

      SELECT
         *
      FROM
         CTE_result
      ORDER BY
         1, 3 DESC
      ```
      </div>
      </details>        
      ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/4.png)

3. The purchasing intent of new visitors was significantly higher than in the past.
   <details>
   <summary>View Query</summary>
   <div markdown="1">
   ```sql
      WITH
      CTE_raw AS (
         SELECT
            event_date,
            user_pseudo_id,
            (SELECT value.int_value FROM UNNEST (event_params) WHERE key = 'ga_session_number') AS ga_session_number,
            event_name
         FROM `project_id.dataset_id.events_*`
         WHERE
            _table_suffix BETWEEN FORMAT_DATE('%Y%m%d', 'START DATE') AND FORMAT_DATE('%Y%m%d', 'END DATE')
      ),

   CTE_users AS (
      SELECT
         event_date,
         user_pseudo_id,
         event_name,
         MIN(ga_session_number) AS min_gsn
      FROM
         CTE_raw
      GROUP BY
         1, 2, 3
   ),

   CTE_new_users AS (
      SELECT
         event_date,
         user_pseudo_id
      FROM
         CTE_users
      WHERE
         min_gsn = 1
   )

   SELECT
      U.event_date,
      COUNT(DISTINCT NU.user_pseudo_id) AS new_users_cnt,
      COUNT(DISTINCT CASE WHEN U.event_name = 'view_item' THEN NU.user_pseudo_id END) AS new_users_cnt_view_item,
      COUNT(DISTINCT CASE WHEN U.event_name = 'begin_checkout' THEN NU.user_pseudo_id END) AS new_users_cnt_begin_checkout    
   FROM
      CTE_users U
   LEFT JOIN 
      CTE_new_users NU
      ON U.event_date = NU.event_date
      AND U.user_pseudo_id = NU.user_pseudo_id
   GROUP BY
      1
   ORDER BY
      1
   ```
   </div>
   </details> 
   ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/2.png)

### Problem Discovery

1. However, there was a sharp increase in dropout rates in the payment process after completing the purchase-related information such as shipping address, email, and contact information.
   <details>
   <summary>View Query</summary>
   <div markdown="1">
   ```sql
      WITH
      CTE_raw AS (
         SELECT
            event_date,
            user_pseudo_id,
            event_name
         FROM `project_id.dataset_id.events_*`
         WHERE
            _table_suffix BETWEEN FORMAT_DATE('%Y%m%d', 'START DATE') AND FORMAT_DATE('%Y%m%d', 'END DATE')
      ),

      CTE_funnel AS (
         SELECT
            event_date,
            COUNT(DISTINCT user_pseudo_id) AS all_users_cnt,
            COUNT(DISTINCT CASE WHEN event_name = 'view_item' THEN user_pseudo_id END) AS view_item_users_cnt,
            COUNT(DISTINCT CASE WHEN event_name = 'begin_checkout' THEN user_pseudo_id END) AS begin_checkout_users_cnt,
            COUNT(DISTINCT CASE WHEN event_name = 'add_payment_info' THEN user_pseudo_id END) AS add_payment_info_users_cnt,
            COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_pseudo_id END) AS purchase_users_cnt
         FROM
            CTE_raw
         GROUP BY
            1
      ),

      CTE_result AS (
         SELECT
            event_date,
            SAFE_DIVIDE(100 * all_users_cnt, all_users_cnt) AS all_users_cvr,
            SAFE_DIVIDE(100 * view_item_users_cnt, all_users_cnt) AS view_item_cvr,
            SAFE_DIVIDE(100 * begin_checkout_users_cnt, all_users_cnt) AS begin_checkout_cvr,
            SAFE_DIVIDE(100 * add_payment_info_users_cnt, all_users_cnt) AS add_payment_info_cvr,
            SAFE_DIVIDE(100 * purchase_users_cnt, all_users_cnt) AS purchase_cvr
         FROM
            CTE_funnel
         ORDER BY
            1
      )

      SELECT
         *
      FROM
         CTE_result
      ORDER BY
         1
   ```
   </div>
   </details> 
   ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/5.png)

   * The major events in the purchase conversion stages were as follows:
      * `view_item`: Viewing the item page.
      * `begin_checkout`: Starting the purchase process.
      * `add_payment_info`: Completing the entry of purchase-related information such as shipping address, email, and contact information, the nproceeding to the payment process.
      * `purchase`: Completing the final payment and vewing the Thank you page.
   * Among these four stages, it was confirmed that there was a drop in conversion rates at the point of moving from `add_payment_info` to `purchase`.

---

# 3. Tasks
> * In the context of a surge in new visitors, I discovered **a high dropout rate in the payment process.**
> * A detailed analysis of the dropout points at each stage of the purchase funnel revealed that many customers were **abandoning their processes after entering their payment information.**
> * Recognizing that **UX in the payment process** significantly affects purchase conversion, I identified a need to improve the user experience by clearly defining the problem.
> * Additionally, I concluded that the decline in conversion rates might be related to the natural increase in organic user acquisition due to external factors and changes in user segments.


### Clarifying the Problem

1. There was a need to improve the UX of the payment process.
* An analysis of the points with high dropout rates in the purchase funnel revealed that many customers were abandoning their carts in the payment process, even after completing the entry of purchase-related information such as shipping address, email, and contact information.
* **Given that they had completed such a cumbersome process of entering purchase information, they must have been in a state of "high purchase intent," yet a significant number still abandoned their carts.**
* This suggested a high possibility that **the dissatisfaction with the payment process was strong enough to undermine the purchase intent itself.**

2. Specifically, the dropout rate was very high at the following stage:
* The UI below appears right after the `add_payment_info` event occurs during the payment process by the payment gateway provider.
* Users were not completing the payment and abandoning their carts during this process.
   ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/6.png)

3. The user segments of incoming visitors had changed.
   * If the conversion rate suddenly diverges from the past without any changes to the website UI, it was determined that this was due to changes in user segments.

      * This was because it was primarily "**natural inflow**" caused by market influences, rather than the "**artificial inflow**" that previously visited in response to marketing activities.
      ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/4.png)   
   
      * It was due to the nature/behavior pattern with high purchase intent compared to the past (significantly increased **item page view rate** compared to before).
      ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/2.png)

---

# 4. Actions
> * Based on the identified problem, I shared it with internal stakeholders and discussed several action plans to improve the payment process.
> * As a result of the discussions, we decided to **first introduce the easy payment service, PayPal Express Checkout**, to reduce the dropout rate in the payment process.
> * This was deemed the most realistic and effective solution to streamline the payment steps and provide a convenient payment experience to users, thereby increasing conversion rates.
> * After implementing this feature, I focused on minimizing user discomfort during the payment process and enhancing security trustworthiness, thereby improving UX.

### Internal Sharing
* I clarified the problem and shared the details with internal stakeholders, and many expressed agreement with the issue.
* Eventually, I held a meeting with executives and marketing team members to **discuss possible action plans** to address the issue.
   ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/7-eng.png)

### Limitations of Data Analysis
* Unfortunately, the user behavior that occurred between the `add_payment_info` event and the `purchase` event could not be confirmed through the data.
   * This was because, under the plan for the e-commerce platform we were using, only basic GA4 event collection was possible as we couldn't insert GTM custom event triggers into the source code.
* Therefore, it was not possible to explain the specific cause of this problem solely with data.
* **Therefore, moving forward, the intuitive judgment of internal stakeholders with insight into domestic and overseas markets became important.**

### Hypothesis Establishment

1. After deep discussions, the following opinions were shared:
   * **Hypothesis 1**: "We need to diversify payment methods. Potential customers might have abandoned their carts because they couldn't find their preferred payment method."
   * **Hypothesis 2**: "How about adding an easy payment service? It could quickly complete the payment before the purchase intent declines."
   * **Hypothesis 3**: "Consider supporting cryptocurrency payment methods. Given the characteristics of our customers, it could be highly preferred."
   * **Hypothesis 4**: "Improving the UI of the payment gateway's payment process might also be a good idea."
  
2. Among these, we decided to first test "**adding an easy payment service**".
   * This was considered the most feasible action in terms of implementation costs, market insights, etc.

3. Final Hypothesis Establishment
> "**Introducing the PayPal Express Checkout feature will increase the conversion rate in the payment process!**"

### Action Implementation

1. **PayPal Express Checkout** is a feature that allows customers to quickly complete a payment using information already stored through PayPal login, without needing to individually enter their shipping address, email, contact information, or even credit card details.

2. In fact, our company had already offered PayPal as a payment method through the linked payment gateway, but it was suspected that this caused the following inconveniences:
   * "It was only displayed as one of several options, so it might not have been easily noticeable."
   * "After entering shipping, email, and contact information, prompting for PayPal login again might have been perceived as an unnecessary waste of time."
   ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/6.png)

3. Therefore, the PayPal Express Checkout feature was considered a UX improvement method for the following reasons:
   * **It supports easy payments by shortening the customer’s purchase conversion steps.**
   * **It enhances trust in security by eliminating the need to enter personal information individually.**
   ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/8.png)

---

# 5. Results
> * After introducing the PayPal Express Checkout feature, the dropout issue during the payment process significantly improved, and **the conversion rate from `add_payment_info` to `purchase` increased by 32 percentage points compared to before.**
> * This action not only restored the conversion rate to its original level by simplifying the payment process and improving the user experience but **also maintained a high level to this day**.
> * This result demonstrates that diversifying payment options and introducing easy payment methods are effective strategies, showing that problem-solving based on data analysis has had a positive impact on sales performance.

### Results

* After executing the action, **the conversion rate at the point of moving from `add_payment_info` to `purchase` not only recovered to its original state but also reached a much higher level than before.**
* As of the end of August 2023, it continues to maintain a high conversion rate.
   <details>
   <summary>View Query</summary>
   <div markdown="1">
   ```sql
      WITH
      CTE_raw AS (
         SELECT
            event_date,
            user_pseudo_id,
            event_name
         FROM `project_id.dataset_id.events_*`
         WHERE
            _table_suffix BETWEEN FORMAT_DATE('%Y%m%d', 'START DATE') AND FORMAT_DATE('%Y%m%d', 'END DATE')
      ),

      CTE_funnel AS (
         SELECT
            event_date,
            COUNT(DISTINCT user_pseudo_id) AS all_users_cnt,
            COUNT(DISTINCT CASE WHEN event_name = 'view_item' THEN user_pseudo_id END) AS view_item_users_cnt,
            COUNT(DISTINCT CASE WHEN event_name = 'begin_checkout' THEN user_pseudo_id END) AS begin_checkout_users_cnt,
            COUNT(DISTINCT CASE WHEN event_name = 'add_payment_info' THEN user_pseudo_id END) AS add_payment_info_users_cnt,
            COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_pseudo_id END) AS purchase_users_cnt
         FROM
            CTE_raw
         GROUP BY
            1
      ),

      CTE_result AS (
         SELECT
            event_date,
            SAFE_DIVIDE(100 * all_users_cnt, all_users_cnt) AS all_users_cvr,
            SAFE_DIVIDE(100 * view_item_users_cnt, all_users_cnt) AS view_item_cvr,
            SAFE_DIVIDE(100 * begin_checkout_users_cnt, all_users_cnt) AS begin_checkout_cvr,
            SAFE_DIVIDE(100 * add_payment_info_users_cnt, all_users_cnt) AS add_payment_info_cvr,
            SAFE_DIVIDE(100 * purchase_users_cnt, all_users_cnt) AS purchase_cvr
         FROM
            CTE_funnel
         ORDER BY
            1
      )

      SELECT
         *
      FROM
         CTE_result
      ORDER BY
         1
   ```
   </div>
   </details> 
   ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/9.png)

### Impact

* After implementing the action, **the conversion rate at the point of moving from `add_payment_info` to `purchase` increased by 32 percentage points compared to before.**
   <details>
   <summary>View Query</summary>
   <div markdown="1">
   ```sql
      WITH
      CTE_raw AS (
         SELECT
            event_date,
            user_pseudo_id,
            event_name
         FROM `project_id.dataset_id.events_*`
         WHERE
            _table_suffix BETWEEN FORMAT_DATE('%Y%m%d', 'START DATE') AND FORMAT_DATE('%Y%m%d', 'END DATE')
      ),

      CTE_funnel AS (
         SELECT
            CASE
                  WHEN event_date <= 'YYYY-MM-DD' THEN 'AS-IS'
                  ELSE 'TO-BE'
            END AS period,
            COUNT(DISTINCT user_pseudo_id) AS all_users_cnt,
            COUNT(DISTINCT CASE WHEN event_name = 'view_item' THEN user_pseudo_id END) AS view_item_users_cnt,
            COUNT(DISTINCT CASE WHEN event_name = 'begin_checkout' THEN user_pseudo_id END) AS begin_checkout_users_cnt,
            COUNT(DISTINCT CASE WHEN event_name = 'add_payment_info' THEN user_pseudo_id END) AS add_payment_info_users_cnt,
            COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_pseudo_id END) AS purchase_users_cnt
         FROM
            CTE_raw
         GROUP BY
            1
      ),

      CTE_result AS (
         SELECT
            period,
            SAFE_DIVIDE(100 * purchase_users_cnt, add_payment_info_users_cnt) AS purchase_cvr
         FROM
            CTE_funnel
      )

      SELECT
         *
      FROM
         CTE_result
      ORDER BY
         1
   ```
   </div>
   </details> 
   ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/10.png)  

---

## *Published by* Joshua Kim

![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)