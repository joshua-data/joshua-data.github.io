---
layout: post
title: "데이터 마트 모델링 후기 (First Activation Funnel 지표)"
tags:
  - Language (Korean)
  - Article (Project)
  - Level (3. Advanced)
  - Field (Analytics Engineering)
  - Skills (SQL)
  - Skills (dbt)
---

> "신규 사용자 활성 전환율 지표를 효과적으로 제공하기 위해 데이터 마트를 직접 설계하고 구축한 경험을 정리했습니다. 비즈니스 요구사항 변화에 유연하게 대응할 수 있도록 데이터 모델을 설계했고, 실무에서 바로 활용 가능한 쿼리와 구조를 고민했습니다. 이 과정을 통해 데이터 모델링 이론을 실제 문제 해결에 적용하는 역량과, 요구사항을 깊이 있게 파악하는 중요성을 다시 한 번 체감할 수 있었습니다."

![]({{ site.baseurl }}/assets/2025-01-25-first-activation-data-mart/3.webp)

---

# 목차
1. **스쿼드 조직이 발족됐어요!**
    - 1.1. 배경
    - 1.2. 스쿼드 조직의 핵심 지표
    - 1.3. 데이터쟁이가 할 일
2. **데이터쟁이, 머리를 굴리다.**
    - 2.1. 핵심 지표를 곱씹어봤어요.
    - 2.2. 데이터 마트를 만들자!
3. **데이터 마트, 미리 살펴보시죠!**
    - 3.1. `dim__users`
    - 3.2. `fact__first_activation_events`
    - 3.3. 레코드 사례로 살펴볼까요?
    - 3.4. 이런 특징을 지니고 있어요.
4. **이런 식으로 쿼리를 작성할 수 있어요.**
    - 4.1. 데이터 마트가 이런 사용성을 지니도록 도모했어요.
    - 4.2. 초급 쿼리
    - 4.3. 중급 쿼리
    - 4.4. 고급 쿼리
5. **이렇게 모델링했어요.**
    - 5.1. [STEP 1] `dim__users` 테이블 전체를 불러와요.
    - 5.2. [STEP 2] 신규 `first_visit` 데이터만 남겨요.
    - 5.3. [STEP 3] `fact__events` 테이블을 증분적으로 불러와요.
    - 5.4. [STEP 4] 신규 최초 Key Events 데이터만 남겨요.
    - 5.5. [STEP 5] 신규 `first_visit` 및 신규 최초 Key Events 데이터 합쳐서 삽입해요.
    - 5.6. 마지막으로 다시 살펴볼까요?
6. **모델링 후기를 정리해볼게요.**
    - 6.1. 요구사항을 잘 정리해야, 좋은 데이터 마트를 만들 수 있어요.
    - 6.2. 데이터 모델링은 이론 학습만으로 완성되지 않아요.
7. **감사의 인사를 드려요.**
    - 7.1. 토스증권의 "DW 설계 후기" 영상에서 영감을 얻었어요.
    - 7.2. 스쿼드 리더 분께 정말 감사 드려요.

---

# 1. 스쿼드 조직이 발족됐어요!

### 1.1. 배경

> 단순한 유입이 아니라, 신규 사용자를 제품에 Lock-in시키는 제품 개선과 마케팅 활동을 진행해보자!

### 1.2. 스쿼드 조직의 핵심 지표

> "**신규 방문 후 1일 이내 Key Event 1을 수행하고, 7일 이내에 Key Event 2를 수행하는 전환율**”을 높여보자!

![]({{ site.baseurl }}/assets/2025-01-25-first-activation-data-mart/1.webp)

![]({{ site.baseurl }}/assets/2025-01-25-first-activation-data-mart/2.webp)

### 1.3. 데이터쟁이가 할 일

> "핵심 지표를 잘 뜯어볼 수 있도록 데이터를 준비하고 대시보드로 제공해주세요."

# 2. 데이터쟁이, 머리를 굴리다.

### 2.1. 핵심 지표를 곱씹어봤어요.

- First Visit - Key Event 1 - Key Event 2 선후 관계가 명확함
- 최대 전환기간 내에서만 전환 인정
- 사용자 기준의 전환율 측정하기
- 추후 스쿼드의 핵심 지표 변동 가능성: Key Event과 최대 전환기간

### 2.2. 데이터 마트를 만들자!

- Core Layer의 `fact__events`에 의존한 쿼리를 실행하면 쿼리가 지나치게 어려워지고, 비용도 많이 들 것 같아.
- 핵심 지표 변동 가능성에 따라 쿼리의 정확성과 딜리버리를 통제하기 어려워질 것 같아.

# 3. 데이터 마트, 미리 살펴보시죠!

### 3.1. `dim__users`

- 이미 Core Layer 상에서 Conformed Dimension으로 관리하고 있었어요.
- SCD Type 1에 해당해요. (과거 값을 보존하지 않고, 가장 최신 값만 유지해요.)

| **Column** | **Description** |
| --- | --- |
| `user_id` | 사용자 ID |
| `first_date` | 최초 방문일자 |
| `first_datetime` | 최초 방문일시 |
| `country` | 최근 접속 국가 |
| `device_os` | 최근 접속 기기 OS |
| `app_version` | 최근 앱 다운로드 버전 |
| `first_campaign` | 최초 방문시 UTM Campaign |
| `first_medium` | 최초 방문시 UTM Medium |
| `first_source` | 최초 방문시 UTM Source |
| … | … |

### 3.2. `fact__first_activation_events`

- 이번 데이터 마트에 새롭게 만든 테이블이에요.
- 각 사용자의 최초 이벤트들만 적재해요.

| **Column** | **Description** |
| --- | --- |
| `date` | 이벤트 최초 발생 일자 |
| `datetime` | 이벤트 최초 발생 일시 |
| `user_id` | 사용자 ID |
| `event_name` | 이벤트 이름 |
| `first_visit_date` | 사용자의 최초 방문 일자 |
| `first_visit_datetime` | 사용자의 최초 방문 일시 |
| `hours_from_first_visit` | 최초 방문 후 이벤트 최초 발생까지 소요된 시간 수 |
| `days_from_first_visit` | 최초 방문 후 이벤트 최초 발생까지 소요된 일 수 |

### 3.3. 레코드 사례로 살펴볼까요?

- `fact__events` 테이블이 다음과 같을 경우, `fact__first_activation_events` 테이블은 다음과 같이 구성될 거예요.

**`fact__events`**

- 김진석의 이벤트 로그가 다음과 같이 존재할 경우,

| **date** | **datetime** | **user_id** | **event_name** |
| --- | --- | --- | --- |
| 2025-01-01 | 2025-01-01 01:00:00 | 진석 | `first_visit` |
| 2025-01-01 | 2025-01-01 01:01:00 | 진석 | `add_to_cart` |
| 2025-01-02 | 2025-01-02 01:00:00 | 진석 | `add_to_cart` |
| 2025-01-02 | 2025-01-02 01:01:00 | 진석 | `purchase` |

**`fact__first_activation_events`**

- 최초 이벤트들만 남긴 후 필요한 정보를 칼럼으로 추가해요.

| **date** | **datetime** | **user_id** | **event_name** | **first_visit_date** | **first_visit_datetime** | **hours_from_first_visit** | **days_from_first_visit** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2025-01-01 | 2025-01-01 01:00:00 | 진석 | `first_visit` | 2025-01-01 | 2025-01-01 01:00:00 | 1 | 1 |
| 2025-01-01 | 2025-01-01 01:01:00 | 진석 | `add_to_cart` | 2025-01-01 | 2025-01-01 01:00:00 | 1 | 1 |
| 2025-01-02 | 2025-01-02 01:01:00 | 진석 | `purchase` | 2025-01-01 | 2025-01-01 01:00:00 | 25 | 2 |

### 3.4. 이런 특징을 지니고 있어요.

- Transaction Fact Table이에요. (`user_id`가 살아 있는 테이블이라, 추후 `dim__users`을 통해 Dimension 필터링을 용이하게 사용할 수 있어요.)
- Grain이 `user_id` + `event_name` 조합이에요. (각 사용자의 최초 이벤트들만 저장되니까요.)
- 전환기간 정보가 Pre-calculated Non-additive Fact로 담겨 있어요. (추후 Join이나 Window Function을 굳이 사용하지 않아도 돼요.)

# 4. 이런 식으로 쿼리를 작성할 수 있어요.

### 4.1. 데이터 마트가 이런 사용성을 지니도록 도모했어요.

- 핵심 지표의 Key Event가 변경되면? → `event_name` 부분만 수정하면 돼요.
- 핵심 지표의 최대 전환기간이 변경되면? → `hours_from_first_visit`, `days_from_first_visit` 부분만 수정하면 돼요.
- 사용자 속성 필터링이 필요하면? → `dim__users` JOIN만 하면 돼요.

### 4.2. 초급 쿼리

- ☝🏻 `key_event_1` 전환 사용자 수 추이를 알려주세요. (전환기간은 상관 없어요.)

```sql
    SELECT
        date,
        COUNT(1) AS users_cnt
    FROM
        fact__first_activation_events
    WHERE TRUE
        AND event_name = 'key_event_1'
    GROUP BY
        1
    ORDER BY
        1
```

### 4.3. 중급 쿼리

- ☝🏻 `first_visit` → 1일 이내 `key_event_1` 전환율 추이를 알려주세요.

```sql
    SELECT
        first_visit_date AS cohort_date,
        COUNT(CASE WHEN event_name = 'first_visit' THEN 1 END) AS first_visit,
        COUNT(CASE WHEN event_name = 'key_event_1' THEN 1 END) AS key_event_1
    FROM
        fact__first_activation_events
    WHERE TRUE
        AND (
            event_name = 'first_visit'
            OR (event_name = 'key_event_1' AND days_from_first_visit <= 1)
        )
    GROUP BY
        1
    ORDER BY
        1
```

- ☝🏻 (스쿼드의 핵심 지표) `first_visit` → 1일 이내 `key_event_1` → 7일 이내 `key_event_2` 전환율 추이를 알려주세요.

```sql
    SELECT
        first_visit_date AS cohort_date,
        COUNT(CASE WHEN event_name = 'first_visit' THEN 1 END) AS first_visit,
        COUNT(CASE WHEN event_name = 'key_event_1' THEN 1 END) AS key_event_1,
        COUNT(CASE WHEN event_name = 'key_event_2' THEN 1 END) AS key_event_2
    FROM
        fact__first_activation_events
    WHERE TRUE
        AND (
            event_name = 'first_visit'
            OR (event_name = 'key_event_1' AND days_from_first_visit <= 1)
            OR (event_name = 'key_event_2' AND days_from_first_visit <= 7)
        )
    GROUP BY
        1
    ORDER BY
        1
```

### 4.4. 고급 쿼리

- ☝🏻 미국 사용자의 `first_visit` → 1일 이내 `key_event_1` → 7일 이내 `key_event_2` 전환율 추이를 알려주세요.

```sql
    SELECT
        FACT.first_visit_date AS cohort_date,
        COUNT(CASE WHEN FACT.event_name = 'first_visit' THEN 1 END) AS first_visit,
        COUNT(CASE WHEN FACT.event_name = 'key_event_1' THEN 1 END) AS key_event_1,
        COUNT(CASE WHEN FACT.event_name = 'key_event_2' THEN 1 END) AS key_event_2
    FROM
        fact__first_activation_events FACT
    LEFT JOIN
        dim__users DIM
        ON FACT.user_id = DIM.user_id
    WHERE TRUE
        AND DIM.country = 'United States'
        AND (
            FACT.event_name = 'first_visit'
            OR (FACT.event_name = 'key_event_1' AND FACT.days_from_first_visit <= 1)
            OR (FACT.event_name = 'key_event_2' AND FACT.days_from_first_visit <= 7)
        )
    GROUP BY
        1
    ORDER BY
        1
```

# 5. 이렇게 모델링했어요.

![]({{ site.baseurl }}/assets/2025-01-25-first-activation-data-mart/3.webp)

### 5.1. [STEP 1] `dim__users` 테이블 전체를 불러와요.

![]({{ site.baseurl }}/assets/2025-01-25-first-activation-data-mart/4.webp)

```sql
    WITH
    CTE_first_visits_raw AS (
        SELECT
            user_id,
            first_date AS date,
            first_datetime AS datetime
        FROM
            {% raw %}{{ ref('dim__users') }}{% endraw %}
    ),	
```

### 5.2. [STEP 2] 신규 `first_visit` 데이터만 남겨요.

![]({{ site.baseurl }}/assets/2025-01-25-first-activation-data-mart/5.webp)

```sql
    {% raw %}{% if is_incremental() %}{% endraw %}

    CTE_first_visits AS (
        SELECT
            SRC.user_id,
            SRC.date,
            SRC.datetime
        FROM
            CTE_first_visits_raw SRC
        LEFT JOIN 
            {% raw %}{{ this }}{% endraw %} EXISTING
            ON SRC.user_id = EXISTING.user_id
            AND EXISTING.event_name = 'first_visit'
        WHERE TRUE
            AND EXISTING.user_id IS NULL
    ),

    {% raw %}{% endif %}{% endraw %}
```

### 5.3. [STEP 3] `fact__events` 테이블을 증분적으로 불러와요.

![]({{ site.baseurl }}/assets/2025-01-25-first-activation-data-mart/6.webp)

```sql
    CTE_events_raw AS (
        SELECT
            user_id,
            event_name,
            MIN(date) AS date,
            MIN(datetime) AS datetime
        FROM
            {% raw %}{{ ref('fact__events') }}{% endraw %}
        WHERE TRUE
            {% raw %}{% if is_incremental() %}{% endraw %}
            AND datetime > (SELECT MAX(datetime) FROM {% raw %}{{ this }}{% endraw %})
            {% raw %}{% endif %}{% endraw %}
            AND event_name IN (
                'Key Event 1',
                'Key Event 2',
                ...
            )
        GROUP BY
            1, 2
    )
```

### 5.4. [STEP 4] 신규 최초 Key Events 데이터만 남겨요.

![]({{ site.baseurl }}/assets/2025-01-25-first-activation-data-mart/7.webp)

```sql
    {% raw %}{% if is_incremental() %}{% endraw %}
    ,

    CTE_events AS (
        SELECT
            SRC.*
        FROM
            CTE_events_raw SRC
        LEFT JOIN 
            {% raw %}{{ this }}{% endraw %} EXISTING
            ON SRC.user_id = EXISTING.user_id
            AND SRC.event_name = EXISTING.event_name
        WHERE TRUE
            AND EXISTING.user_id IS NULL
            AND EXISTING.event_name IS NULL
    )

    {% raw %}{% endif %}{% endraw %}
```

### 5.5. [STEP 5] 신규 `first_visit` 및 신규 최초 Key Events 데이터 합쳐서 삽입해요.

![]({{ site.baseurl }}/assets/2025-01-25-first-activation-data-mart/8.webp)

```sql
    SELECT
        date,
        datetime,
        user_id,
        'first_visit' AS event_name,
        date AS first_visit_date,
        datetime AS first_visit_datetime,
        NULL AS hours_from_first_visit,
        NULL AS days_from_first_visit
    FROM
        {% raw %}{% if is_incremental() %}{% endraw %}
        CTE_first_visits
        {% raw %}{% else %}{% endraw %}
        CTE_first_visits_raw
        {% raw %}{% endif %}{% endraw %}

    UNION ALL

    SELECT
        FCT.date,
        FCT.datetime,
        FCT.user_id,
        FCT.event_name,
        DIM.date AS first_visit_date,
        DIM.datetime AS first_visit_datetime,
        TIMESTAMP_DIFF(
            TIMESTAMP_TRUNC(FCT.datetime, HOUR),
            TIMESTAMP_TRUNC(DIM.datetime, HOUR),
            HOUR
        ) + 1 AS hours_from_first_visit, -- 1부터 시작
        TIMESTAMP_DIFF(
            TIMESTAMP_TRUNC(FCT.datetime, DAY),
            TIMESTAMP_TRUNC(DIM.datetime, DAY),
            DAY
        ) + 1 AS days_from_first_visit -- 1부터 시작
    FROM
        {% raw %}{% if is_incremental() %}{% endraw %}
        CTE_events FCT
        {% raw %}{% else %}{% endraw %}
        CTE_events_raw FCT 
        {% raw %}{% endif %}{% endraw %}
    INNER JOIN
        CTE_first_visits_raw DIM
        ON FCT.user_id = DIM.user_id
```

### 5.6. 마지막으로 다시 살펴볼까요?

![]({{ site.baseurl }}/assets/2025-01-25-first-activation-data-mart/3.webp)

```yaml
models:
  - name: fact__first_activation_events
    description: 사용자의 최초 이벤트 내역
    meta:
      owner: 김진석
    config:
      materialized: incremental
      incremental_strategy: insert_overwrite
      on_schema_change: append_new_columns
      partition_by:
        field: date
        data_type: date
        granularity: day
      time_ingestion_partitioning: true
      require_partition_filter: false
      copy_partitions: true
    columns:
      - name: date
        description: ...
      - name: ...
        description: ...
```

# 6. 모델링 후기를 정리해볼게요.

### 6.1. 요구사항을 잘 정리해야, 좋은 데이터 마트를 만들 수 있어요.

- 좋은 데이터 마트 = 여러 번 지속적으로 써먹을 수 있는 데이터 마트
- 스쿼드의 핵심 지표를 정확하게 이해하기 위해, 스쿼드 리더 분과 수 시간 동안 많은 이야기를 나눴어요.
    - 전환율의 정의가 정확히 어떻게 되는가?
    - 핵심 지표가 추후 어떤 방향으로 변동될 수 있는가?

### 6.2. 데이터 모델링은 이론 학습만으로 완성되지 않아요.

- Kimball, Inmon 등 DWH에 대한 체계적인 이론이 있어요.
- 하지만, 가장 중요한 건 “문제 해결에 도움이 되는가?”
    - 조직의 데이터 활용 성향, 데이터 특성, 핵심 문제
- `fact__first_activation_events` 테이블은 이론에 기대어 만든 테이블이 아니에요.
    - 조직이 필요해서 DWH 이론을 응용해서 만든 거예요.

# 7. 감사의 인사를 드려요.

### 7.1. 토스증권의 "DW 설계 후기" 영상에서 영감을 얻었어요.

> [토스ㅣSLASH 24 - 전천후 데이터 분석을 위한 DW 설계 및 운영하기](https://www.youtube.com/watch?v=MWDVBZycou4)

- 사용자 활성화 정보를 적재하는 흐름을 파악하는 데 중요한 단서를 얻었어요.

### 7.2. 스쿼드 리더 분께 정말 감사 드려요.

- 핵심 지표 데이터를 잘 제공해드리기 위한 저의 궁금증을 적극적으로 풀어주셨어요.
    - 비즈니스 목표를 잘 조망할 수 있도록 여러모로 배경을 잘 알려주셨어요.
    - 핵심 지표를 함께 꼼꼼하게 정량화해주셨어요.
- 데이터쟁이가 조직의 목표에 잘 싱크업하는 눈을 기를 수 있도록 강도 높은 트레이닝을 해주셔서 진심으로 감사 드립니다.

---

## *Published by* Joshua Kim

![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)