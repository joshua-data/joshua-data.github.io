---
layout: post
title: "구매 전환율 급상승 후기"
tags:
  - Language (Korean)
  - Article (Project)
  - Level (Beginner)
  - Field (Data Analysis)
  - Skills (SQL)
---

> "외부 요인으로 인해 증가한 신규 방문자 데이터를 분석하여 구매 전환율의 급상승을 달성했습니다. 데이터를 통해 신규 방문자 수와 이들의 구매 의향이 크게 증가했음을 발견했지만, 결제 단계에서 이탈률이 높다는 문제를 파악했습니다. 이에 결제 과정의 불편함이 주요 원인임을 가설로 설정하고, PayPal Express Checkout을 도입하여 사용자 경험을 개선했습니다. 그 결과, 결제 전환율이 32%p 상승하여 이전보다 훨씬 높은 수준을 기록했으며, 이는 지속적으로 유지되고 있습니다. 이를 통해 분석 기반의 문제 해결과 성과 향상을 이뤄냈습니다."

---

| **Performance Summary** |
| - |
| - 전환율 (`add_payment_info` → `purchase`): 32%p ↑ | 

---

# 목차
1. STAR Summary
2. Situation
3. Tasks
4. Actions
5. Results

---

# 1. STAR Summary

### Situation
* 2023년, 글로벌 시장 점유율 1위의 경쟁사가 사업적 논란에 휘말리면서 당사는 **예상치 못한 매출 증가**를 경험하게 되었습니다.
* 이로 인해 자사몰의 신규 방문자가 급증했으며, 이는 당사 내부 마케팅 활동의 결과가 아닌 외부 시장 변화에 따른 현상으로 파악되었습니다.
* 데이터 분석가로서 저는 이러한 비정상적인 시장 움직임을 깊이 있게 분석하기 위해 자발적으로 데이터 모니터링을 했고, 특히 **신규 방문자들의 유입 경로와 구매 행동 패턴**을 집중적으로 추적했습니다.

### Tasks
* 신규 방문자 수가 급증한 상황에서 **결제 프로세스의 이탈률이 높다는 문제**를 발견했습니다.
* 구체적으로 구매 퍼널의 각 단계에서 이탈 지점을 분석한 결과, 많은 고객들이 **구매 정보를 입력한 후 결제 단계에서 이탈**하는 것으로 나타났습니다.
* 특히, **결제 과정에서의 UX**가 구매 전환에 큰 영향을 미친다는 점을 인지하고, 문제를 명확히 하여 사용자 경험을 개선할 필요가 있었습니다.
* 또한, 이번 전환율 저하는 외부 요인에 의한 자연적 유입 사용자 증가와 세그먼트 변화와 관련이 있을 것으로 판단했습니다.

### Actions
* 발견된 문제를 바탕으로 결제 프로세스 개선을 위해 사내 구성원들과 문제를 공유하고, 여러 가지 액션 플랜을 논의했습니다.
* 논의 결과, 결제 프로세스에서의 이탈률을 낮추기 위해 우선적으로 **간편 결제 서비스인 PayPal Express Checkout 기능을 도입**하기로 결정했습니다.
* 이는 결제 단계를 단축하고 사용자에게 편리한 결제 경험을 제공하여 전환율을 높일 수 있는 가장 현실적이고 효율적인 방안으로 판단되었습니다.
* 이후 해당 기능을 적용하여 사용자의 결제 과정에서 불편함을 최소화하고 보안 신뢰도를 높이는 등 UX 개선을 추진했습니다.

### Results
* PayPal Express Checkout 기능 도입 후, 결제 과정에서 이탈하던 문제가 크게 개선되어 **`add_payment_info`에서 `purchase`로 넘어가는 전환율이 이전보다 32%p 상승**했습니다.
* 이 조치는 결제 프로세스를 간소화하고 사용자 경험을 향상시켜 전환율을 원상태로 회복시켰을 뿐만 아니라, **현재까지도 높은 수준을 유지**하고 있습니다.
* 이 결과는 결제 옵션의 다양화와 간편 결제 도입이 효과적인 전략임을 입증하며, 분석을 바탕으로 한 문제 해결이 매출 성과에 긍정적인 영향을 미쳤습니다.

---

# 2. Situation
> * 2023년, 글로벌 시장 점유율 1위의 경쟁사가 사업적 논란에 휘말리면서 당사는 **예상치 못한 매출 증가**를 경험하게 되었습니다.
> * 이로 인해 자사몰의 신규 방문자가 급증했으며, 이는 당사 내부 마케팅 활동의 결과가 아닌 외부 시장 변화에 따른 현상으로 파악되었습니다.
> * 데이터 분석가로서 저는 이러한 비정상적인 시장 움직임을 깊이 있게 분석하기 위해 자발적으로 데이터 모니터링을 했고, 특히 **신규 방문자들의 유입 경로와 구매 행동 패턴**을 집중적으로 추적했습니다.




### 구체적인 상황
* 2023년, 글로벌 시장 점유율 TOP1인 모 경쟁사가 사업적 논란에 크게 휩싸이면서 당사가 반사이익 수혜를 입어 자사몰 매출이 급증하고 있었습니다. 이는 내부적인 마케팅 활동의 결과가 아닌, 시장 자체의 외부 영향 덕분이었습니다.
* 데이터 분석가였던 저 역시 "**흔치 않은 시장의 흐름으로 인한 이상 현상**"을 깊이 모니터링해보고 싶어 자발적으로 함께 데이터를 팔로업했습니다.

### 데이터 팔로업

1. 신규 방문자 수가 급증했습니다.
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

2. 이들은 주로 미국과 Organic 트래픽을 통해 유입되었습니다.
   * 신규 방문자 수 (국가별 분류)
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

   * 신규 방문자 수 (First UTM Parameters별 분류)
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

2. 신규 방문자들의 구매 의향은 과거에 비해 매우 높은 편이었습니다.
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

### 문제 발견

1. 그러나, 배송지+이메일+연락처 등 구매 관련 정보 입력을 완료한 후 결제 프로세스 상에서의 이탈률이 급격히 높아졌습니다.
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

   * 구매 전환 단계의 주요 이벤트는 다음과 같았습니다.
      * `view_item`: 아이템 페이지를 조회한다.
      * `begin_checkout`: 구매를 시작한다.
      * `add_payment_info`: 배송지, 이메일, 연락처 등 구매 관련 정보 입력을 완료한 후 결제 프로세스로 넘어간다.
      * `purchase`: 최종 결제를 완료한 후 Thank You 페이지를 조회한다.
   * 위 네 단계 중, `add_payment_info`로부터 `purchase`로 넘어가는 지점에서 전환율이 오히려 감소하고 있음을 확인하게 된 것입니다.

---

# 3. Tasks
> * 신규 방문자 수가 급증한 상황에서 **결제 프로세스의 이탈률이 높다는 문제**를 발견했습니다.
> * 구체적으로 구매 퍼널의 각 단계에서 이탈 지점을 분석한 결과, 많은 고객들이 **구매 정보를 입력한 후 결제 단계에서 이탈**하는 것으로 나타났습니다.
> * 특히, **결제 과정에서의 UX**가 구매 전환에 큰 영향을 미친다는 점을 인지하고, 문제를 명확히 하여 사용자 경험을 개선할 필요가 있었습니다.
> * 또한, 이번 전환율 저하는 외부 요인에 의한 자연적 유입 사용자 증가와 세그먼트 변화와 관련이 있을 것으로 판단했습니다.

### 문제 구체화

1. 결제 프로세스의 UX 개선이 필요했습니다.
* 구매 퍼널에서 이탈률이 높은 지점을 분석한 결과, 많은 고객들이 배송지, 이메일, 연락처 등 구매 정보를 입력했음에도 불구하고 결제 프로세스 상에서 크게 이탈하는 것으로 나타났습니다.
* **상당히 성가신 구매 정보 입력 과정까지 완료했다면, "구매 의향"이 매우 높은 심리 상태였을 텐데, 상당수가 이탈하고 만 것입니다.**
* 이는 **구매 의향 자체를 흔들어 놓을 만한 결제 프로세스 불만족**을 느꼈을 가능성이 컸을 것입니다.

2. 구체적으로는 다음 과정에서 이탈률이 매우 높았습니다.
* 아래 UI는 `add_payment_info` 이벤트 발생 직후 나타나는 PG사의 결제 프로세스입니다.
* 이 프로세스 과정에서 결제를 완료하지 못하고 이탈하고 있었던 것입니다.
   ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/6.png)

3. 유입 사용자 세그먼트가 변했습니다.
   * 웹사이트 UI에는 변동이 전혀 없었는데도 불구하고 전환율이 갑자기 이전과 괴리된다면 세그먼트의 변동 때문인 것으로 판단했습니다.

      * 그동안 마케팅 유입 활동에 반응하여 방문한 "**인위적 유입**"이 아니라, 이벤에는 시장의 영향으로 인해 Organic하게 방문한 "**자연적 유입**"이 주를 이루었기 때문입니다.
      ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/4.png)   
   
      * 구매 의향 자체가 과거에 비해 높은 속성/행동 패턴을 지녔기 때문입니다. (이전보다 확연히 높아진 **아이템 페이지 조회율**)
      ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/2.png)

---

# 4. Actions
> * 발견된 문제를 바탕으로 결제 프로세스 개선을 위해 사내 구성원들과 문제를 공유하고, 여러 가지 액션 플랜을 논의했습니다.
> * 논의 결과, 결제 프로세스에서의 이탈률을 낮추기 위해 우선적으로 **간편 결제 서비스인 PayPal Express Checkout 기능을 도입**하기로 결정했습니다.
> * 이는 결제 단계를 단축하고 사용자에게 편리한 결제 경험을 제공하여 전환율을 높일 수 있는 가장 현실적이고 효율적인 방안으로 판단되었습니다.
> * 이후 해당 기능을 적용하여 사용자의 결제 과정에서 불편함을 최소화하고 보안 신뢰도를 높이는 등 UX 개선을 추진했습니다.


### 사내 공유
* 문제를 구체화하여 우선 사내 구성원 분들께 해당 내용을 공유 드렸고, 많은 분들께서 이 문제에 대해 공감을 표현해주셨습니다.
* 결국, 임원 분들 및 마케팅 팀원 분들과 함께 미팅을 하여 문제를 개선할 만한 **액션 플랜을 논의**하기 시작했습니다.
   ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/7.png)

### 데이터 분석의 한계
* 안타깝게도, `add_payment_info` 이벤트와 `purchase` 이벤트 사이에 발생한 사용자 행동까지는 데이터로 확인할 수 없었습니다.
   * 당사가 사용 중인 이커머스 플랫폼의 Plan 하에서는 소스코드에 GTM 커스텀 이벤트 트리거를 삽입할 수 없었기 때문에 기본적인 GA4 이벤트 수집만 가능했기 때문입니다.
* 따라서 단순히 데이터만으로는 이 문제의 구체적인 원인을 해명할 수 없었습니다.
* **그래서 지금부터는 국내/해외 시장에 대한 안목이 높은 사내 구성원 분들의 직관적 판단이 중요해지기 시작했습니다.**

### 가설 설정

1. 깊은 논의 끝에, 다음과 같은 의견들이 공유되었습니다.
   * **가설 1**: "결제 수단을 다양화해야 돼요. 잠재 구매 고객이 자신이 원하는 결제 수단을 찾지 못해 이탈했을 가능성이 클 거예요."
   * **가설 2**: "간편 결제 서비스를 추가하는 건 어때요? 구매 의향이 줄어들기 전에 빠르게 결제가 마무리될 수 있을 거예요."
   * **가설 3**: "가상자산 결제 방식을 지원하는 것도 고려해봐요. 우리 고객들의 특성상 선호도가 높을 것 같거든요."
   * **가설 4**: "PG사의 결제 프로세스 UI를 개선해보는 것도 좋을 것 같아요."
  
2. 이 중, "**간편 결제 서비스 추가하기**"를 우선적으로 테스트하기로 결정했습니다.
   * 실행 비용, 시장에 대한 안목 등 측면에서 현실적으로 가장 바람직한 액션이라고 느꼈기 때문입니다.

3. 최종 가설 수립
> "**PayPal Express Checkout 기능을 도입하면 결제 프로세스 상에서의 전환율이 높아질 것이다!**"

### 액션 실행

1. **PayPal Express Checkout**은 고객이 배송지, 이메일, 연락처는 물론, 신용카드 정보 조차도 일일이 입력하지 않은 상태에서, PayPal 로그인을 통해 기존에 저장된 정보를 토대로 빠르게 결제할 수 있는 기능입니다.

2. 사실 당사는 연동된 PG사를 통해 이미 PayPal을 결제 수단을 제공하고 있었지만, 다음과 같은 불편함을 초래하고 있었던 것으로 추측했습니다.
   * "여러 가지 옵션 중 하나로만 표시되어 있으므로 눈에 잘 띄지 않았을 것이다."
   * "이미 배송지, 이메일, 연락처 정보를 입력했는데 다시 한 번 PayPal 로그인을 유도하는 것이 불필요한 시간 낭비로 느껴졌을 것이다."
   ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/6.png)

3. 따라서 PayPal Express Checkout 기능을 다음의 측면에서 UX 향상 방법이라고 생각하게 되었습니다.
   * **고객의 구매 전환 단계를 단축하여 간편한 결제를 지원한다.**
   * **개인정보를 일일이 입력하지 않아도 되므로, 보안에 대한 신뢰도를 높인다.**
   ![]({{ site.baseurl }}/assets/2024-08-29-how-we-dramatically-improved-conversion-rates/8.png)

---

# 5. Results
> * PayPal Express Checkout 기능 도입 후, 결제 과정에서 이탈하던 문제가 크게 개선되어 **`add_payment_info`에서 `purchase`로 넘어가는 전환율이 이전보다 32%p 상승**했습니다.
> * 이 조치는 결제 프로세스를 간소화하고 사용자 경험을 향상시켜 전환율을 원상태로 회복시켰을 뿐만 아니라, **현재까지도 높은 수준을 유지**하고 있습니다.
> * 이 결과는 결제 옵션의 다양화와 간편 결제 도입이 효과적인 전략임을 입증하며, 분석을 바탕으로 한 문제 해결이 매출 성과에 긍정적인 영향을 미쳤습니다.


### 결과

* 해당 액션을 실행한 후, **`add_payment_info`로부터 `purchase`로 넘어가는 지점의 전환율은 원상태로 회복되었을 뿐만 아니라 이전보다 훨씬 높은 수준을 기록했습니다.**
* 2023년 8월말 현재까지도 여전히 높은 전환율 수준을 유지하고 있습니다.
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

### 효과

* 해당 액션을 실행한 후, **`add_payment_info`로부터 `purchase`로 넘어가는 지점의 전환율은 기존에 비해 32%p 상승했습니다.**
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