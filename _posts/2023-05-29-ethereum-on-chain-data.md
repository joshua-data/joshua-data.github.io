---
layout: post
title: "Ethereum On-chain Data: DAU, MAU, Stickiness, and Retention"
tags:
  - SQL
  - Blockchain
  - On-chain Data
  - Data Analysis
---

> In this article, I’m going to deep dive into Ethereum On-chain Data Analysis not just with the  **DAU**  and  **MAU,** but also with  **Stickiness**, and  **Retention Rate**, which are the basic metrics when it comes to data analysis. Let’s directly dive into it!

### CONTENTS
1.  Introduction
2.  DAU, MAU, and Stickiness (All the Transactions)
	* 2.1.  Ethereum DAU and 30-day Moving MAU
	* 2.2. Ethereum DAU (by new and existing addresses)
	* 2.3. Ethereum DAU (by transaction types)
	* 2.4. Ethereum Stickiness
3.  DAU, MAU, and Stickiness (Contract Call Only)
	* 3.1. Ethereum DAU and 30-day Moving MAU
	* 3.2. Ethereum DAU (new and existing addresses)
	* 3.3. Ethereum DAU (by transaction types)
	* 3.4. Ethereum Stickiness
4.  Cohord Retention (Contract Call Only)
	* 4.1. Ethereum Cohort Retention (Since Jan 2023)
	* 4.2. Ethereum Cohort Retention (Since Jan 2022)
5.  Why the Retention rate was high in May 2023?
6.  Conclusion

---

# 1. Introduction

There are already many Ethereum on-chain data analytics platforms such as Messari, Glassnode, and of course, Etherscan.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/messari.webp)
> Ethereum Daily Number of Active Addresses (Messari)

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/glassnode.webp)
> Ethereum Daily Number of Active Addresses (Glassnode)

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/etherscan.webp)
> Ethereum Daily Number of Transactions Broadcasted (Etherscan)

Unfortunately, The charts above aren’t very helpful if you try to deeply analyze the on-chain data and find a specific action point regarding any blockchain services.

Inthis article, I’m going to deep dive into Ethereum On-chain Data Analysis not just with the  **DAU**  and  **MAU,** but also with  **Stickiness**, and  **Retention Rate**, which are the most basic metrics when it comes to Data Analysis. Let’s directly dive into it!

# 2. DAU, MAU, and Stickiness (All the Transactions)

## 2.1.  Ethereum DAU and 30-day Moving MAU

Basically, I am not able to discern any meaningful insights from the chart below as a data analyst.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/ethereum-dau-mau.webp)

```sql
WITH  
CTE_raw AS (
    SELECT  
        DATE_TRUNC('DAY', block_time) AS block_date,  
        block_number,  
        "from" AS from_address, nonce,  
        success, type,  
        value, data  
    FROM 
	    ethereum.transactions  
    WHERE  
        block_time >= TIMESTAMP '2022-12-01'  
        AND success = true  
),  
CTE_dau_mau AS (
    SELECT  
        block_date,  
        COUNT(DISTINCT from_address) AS dau,  
        (  
            SELECT
	            COUNT(DISTINCT from_address)  
            FROM 
	            CTE_raw SUB  
            WHERE  
                DATE_ADD('DAY', -29, MAIN.block_date) <= SUB.block_date  
                AND SUB.block_date <= DATE_TRUNC('DAY', MAIN.block_date)  
        ) AS mau  
    FROM
	    CTE_raw MAIN  
    GROUP BY
	    block_date  
    ORDER BY 
	    block_date DESC  
)  
SELECT
	*  
FROM 
	CTE_dau_mau  
WHERE 
	block_date >= TIMESTAMP '2023-01-01'  
ORDER BY 
	block_date DESC  
;
```

## 2.2. Ethereum DAU (by new and existing addresses)

Here, I've distinguished daily new addresses from existing ones depending on the **Nonce** values.
* If a transaction has a nonce of 0, it's considered to be broadcast by **a new address**.
* On the other hand, if a transaction nonce is not equal to 0, it's considered to be broadcast by **an existing address**.

Despite this analysis, I am still not able to discern any meaningful insights from the chart below.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/ethereum-dau-new-vs-old.webp)

```sql
WITH  
CTE_raw AS (
    SELECT  
        DATE_TRUNC('DAY', block_time) AS block_date,  
        block_number,  
        "from" AS from_address,   
        CASE  
            WHEN nonce = 0 THEN 'new_address'  
            ELSE 'existing_address'  
        END AS new_existing,  
        success, type,  
        value, data  
    FROM
	    ethereum.transactions  
    WHERE  
        block_time >= TIMESTAMP '2022-12-01'  
        AND success = true  
),  
CTE_dnu_mnu AS (
    SELECT  
        block_date,  
        new_existing,  
        COUNT(DISTINCT from_address) AS dnu,  
        (  
            SELECT
	            COUNT(DISTINCT from_address)  
            FROM 
	            CTE_raw SUB  
            WHERE  
                DATE_ADD('DAY', -29, MAIN.block_date) <= SUB.block_date  
                AND SUB.block_date <= DATE_TRUNC('DAY', MAIN.block_date)  
        ) AS mnu  
    FROM
	    CTE_raw MAIN  
    GROUP BY 
	    block_date, new_existing  
    ORDER BY 
	    block_date DESC, new_existing  
)  
SELECT
	*  
FROM
	CTE_dnu_mnu  
WHERE 
	block_date >= TIMESTAMP '2023-01-01'  
ORDER BY 
	block_date DESC  
;
```

## 2.3. Ethereum DAU (by transaction types)


Here, I've distinquished daily new addresses from existing ones depending on the **Nonce** values.
* If a transaction has a nonce of 0, it's considered to be broadcast by **a new address**.
* On the other hand, if a transaction nonce is not equal to 0, it's considered to be broadcast by **an existing address**.

Despite this analysis, I am still not able to discern any meaningful insights from the chart below.

Again, I am still not able to discern any meaningful insights from the chart below.
* `DynamicFee` indicates that the transaction has been broadcast in compliance with EIP-1559.
* `Legacy` signifies that the transaction has been broadcast using the traditional data format.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/ethereum-dau-tx-type.webp)

```sql
WITH  
CTE_raw AS (
    SELECT  
        DATE_TRUNC('DAY', block_time) AS block_date,  
        block_number,  
        "from" AS from_address, nonce,  
        success, type,  
        value, data  
    FROM
	    ethereum.transactions  
    WHERE  
        block_time >= TIMESTAMP '2022-12-01'  
        AND success = true  
),  
CTE_dau_mau AS (   
    SELECT  
        block_date, type,  
        COUNT(DISTINCT from_address) AS dau,  
        (  
            SELECT
	            COUNT(DISTINCT from_address)  
            FROM
	            CTE_raw SUB  
            WHERE  
                DATE_ADD('DAY', -29, MAIN.block_date) <= SUB.block_date  
                AND SUB.block_date <= DATE_TRUNC('DAY', MAIN.block_date)  
        ) AS mau  
    FROM 
	    CTE_raw MAIN  
    GROUP BY 
	    block_date, type  
    ORDER BY 
	    block_date DESC, type   
)  
SELECT 
	*  
FROM 
	CTE_dau_mau  
WHERE 
	block_date >= TIMESTAMP '2023-01-01'  
ORDER BY 
	block_date DESC  
;
```

## 2.4. Ethereum Stickiness

> **Stickiness** is, by definition, the proportion of users who started their sessions on a particular day among all monthly users.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/stickiness-formula.webp)

For instance, users on various social media platforms like Facebook typically exhibit a significantly high Stickiness Ratio.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/dau-as-perc-of-mau.webp)

When it comes to Ethereum Stickiness, I noticed a potential upward trend since May 2023 in the chart below.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/ethereum-stickiness.webp)

```sql
WITH  
CTE_raw AS (
    SELECT  
        DATE_TRUNC('DAY', block_time) AS block_date,  
        block_number,  
        "from" AS from_address, nonce,  
        success, type,  
        value, data  
    FROM
	    ethereum.transactions  
    WHERE  
        block_time >= TIMESTAMP '2022-12-01'  
        AND success = true  
),  
CTE_dau_mau AS ( 
    SELECT  
        block_date,  
        COUNT(DISTINCT from_address) AS dau,  
        (  
            SELECT
	            COUNT(DISTINCT from_address)  
            FROM
	            CTE_raw SUB  
            WHERE  
                DATE_ADD('DAY', -29, MAIN.block_date) <= SUB.block_date  
                AND SUB.block_date <= DATE_TRUNC('DAY', MAIN.block_date)  
        ) AS mau  
    FROM
	    CTE_raw MAIN  
    GROUP BY 
	    block_date  
    ORDER BY 
	    block_date DESC  
),  
CTE_dau_mau_stickiness AS ( 
    SELECT  
        block_date, dau, mau,  
        CAST(dau AS DOUBLE) / CAST(mau AS DOUBLE) * 100.0 AS stickiness  
    FROM
	    CTE_dau_mau  
    WHERE
	    block_date >= TIMESTAMP '2023-01-01'  
    ORDER BY
	    block_date DESC  
)  
SELECT 
	* 
FROM 
	CTE_dau_mau_stickiness;
```

# 3.  DAU, MAU, and Stickiness (Contract Call Only)

Wait, I overlooked one crucial aspect in all of the above.
1. The primary essence of the Ethereum Network lies in its functionality as an application platform.
2. Consequently, it would be more accurate and insightful to extract transactions data that involves at least one contract call, rather than considering all transactions data.

Let's redraw the same charts, but this time, focusing only on transactions that involve calling a contract.

## 3.1. Ethereum DAU and 30-day Moving MAU

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/ethereum-contract-call-dau-mau.webp)

```sql
WITH  
CTE_raw AS ( 
    SELECT  
        DATE_TRUNC('DAY', block_time) AS block_date,  
        block_number,  
        "from" AS from_address, nonce,  
        success, type,  
        value, data  
    FROM 
	    ethereum.transactions  
    WHERE  
        block_time >= TIMESTAMP '2022-12-01'  
        AND success = true  
        AND data <> 0x  
),  
CTE_dau_mau AS ( 
    SELECT  
        block_date,  
        COUNT(DISTINCT from_address) AS dau,  
        (  
            SELECT 
	            COUNT(DISTINCT from_address)  
            FROM 
	            CTE_raw SUB  
            WHERE  
                DATE_ADD('DAY', -29, MAIN.block_date) <= SUB.block_date  
                AND SUB.block_date <= DATE_TRUNC('DAY', MAIN.block_date)  
        ) AS mau  
    FROM 
	    CTE_raw MAIN  
    GROUP BY 
	    block_date  
    ORDER BY 
	    block_date DESC  
)  
SELECT 
	*  
FROM 
	CTE_dau_mau  
WHERE 
	block_date >= TIMESTAMP '2023-01-01'  
ORDER BY 
	block_date DESC  
;
```

## 3.2. Ethereum DAU (new and existing addresses)

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/ethereum-contract-call-dau-new-vs-old.webp)

```sql
WITH  
CTE_raw AS ( 
    SELECT  
        DATE_TRUNC('DAY', block_time) AS block_date,  
        block_number,  
        "from" AS from_address,   
        CASE  
            WHEN nonce = 0 THEN 'new_address'  
            ELSE 'existing_address'  
        END AS new_existing,  
        success, type,  
        value, data  
    FROM 
	    ethereum.transactions  
    WHERE  
        block_time >= TIMESTAMP '2022-12-01'  
        AND success = true  
        AND data <> 0x  
),  
CTE_dnu_mnu AS (
    SELECT  
        block_date,  
        new_existing,  
        COUNT(DISTINCT from_address) AS dnu,  
        (  
            SELECT 
	            COUNT(DISTINCT from_address)  
            FROM 
	            CTE_raw SUB  
            WHERE  
                DATE_ADD('DAY', -29, MAIN.block_date) <= SUB.block_date  
                AND SUB.block_date <= DATE_TRUNC('DAY', MAIN.block_date)  
        ) AS mnu  
    FROM 
	    CTE_raw MAIN  
    GROUP BY 
	    block_date, new_old  
    ORDER BY 
	    block_date DESC, new_old  
)  
SELECT 
	*  
FROM 
	CTE_dnu_mnu  
WHERE 
	block_date >= TIMESTAMP '2023-01-01'  
ORDER BY 
	block_date DESC  
;
```

## 3.3. Ethereum DAU (by transaction types)

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/ethereum-contract-call-dau-tx-type.webp)

```sql
WITH  
CTE_raw AS ( 
    SELECT  
        DATE_TRUNC('DAY', block_time) AS block_date,  
        block_number,  
        "from" AS from_address, nonce,  
        success, type,  
        value, data  
    FROM 
	    ethereum.transactions  
    WHERE  
        block_time >= TIMESTAMP '2022-12-01'  
        AND success = true  
        AND data <> 0x  
),  
CTE_dau_mau AS (
    SELECT  
        block_date, type,  
        COUNT(DISTINCT from_address) AS dau,  
        (  
            SELECT 
	            COUNT(DISTINCT from_address)  
            FROM 
	            CTE_raw SUB  
            WHERE  
                DATE_ADD('DAY', -29, MAIN.block_date) <= SUB.block_date  
                AND SUB.block_date <= DATE_TRUNC('DAY', MAIN.block_date)  
        ) AS mau  
    FROM 
	    CTE_raw MAIN  
    GROUP BY 
	    block_date, type  
    ORDER BY 
	    block_date DESC, type   
)  
SELECT 
	*  
FROM 
	CTE_dau_mau  
WHERE 
	block_date >= TIMESTAMP '2023-01-01'  
ORDER BY 
	block_date DESC  
;
```

## 3.4. Ethereum Stickiness

I am even more convinced now that the upward trend I noticed earlier is indeed present here as well.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/ethereum-contract-call-stickiness.webp)

```sql
WITH  
CTE_raw AS ( 
    SELECT  
        DATE_TRUNC('DAY', block_time) AS block_date,  
        block_number,  
        "from" AS from_address, nonce,  
        success, type,  
        value, data  
    FROM 
	    ethereum.transactions  
    WHERE  
        block_time >= TIMESTAMP '2022-12-01'  
        AND success = true  
        AND data <> 0x  
),  
CTE_dau_mau AS ( 
    SELECT  
        block_date,  
        COUNT(DISTINCT from_address) AS dau,  
        (  
            SELECT 
	            COUNT(DISTINCT from_address)  
            FROM 
	            CTE_raw SUB  
            WHERE  
                DATE_ADD('DAY', -29, MAIN.block_date) <= SUB.block_date  
                AND SUB.block_date <= DATE_TRUNC('DAY', MAIN.block_date)  
        ) AS mau  
    FROM 
	    CTE_raw MAIN  
    GROUP BY 
	    block_date  
    ORDER BY 
	    block_date DESC  
),  
CTE_dau_mau_stickiness AS ( 
    SELECT  
        block_date, dau, mau,  
        CAST(dau AS DOUBLE) / CAST(mau AS DOUBLE) * 100.0 AS stickiness  
    FROM 
	    CTE_dau_mau  
    WHERE 
	    block_date >= TIMESTAMP '2023-01-01'  
    ORDER BY 
	    block_date DESC  
)  
SELECT * FROM CTE_dau_mau_stickiness;
```

# 4.  Cohord Retention (Contract Call Only)

> **Retention** is basically an indicator of how many users come back to the platform over time.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/amplitude.webp)

There are at least three methodologies to measure the Retention rate, but here I'll use the Cohort Retention.

> **Cohort Retention** is one method of measuring the Retention trends by dividing it based on the first visit date of the new users.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/cohort-table.webp)

## 4.1. Ethereum Cohort Retention (Since Jan 2023)

Newe addresses that have called contracts at least once demonstrate a notably high retention rate for at least a couple of weeks.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/ethereum-cohort-retention-contract-call-only.webp)

```sql
WITH  
CTE_raw AS ( 
    SELECT  
        DATE_TRUNC('DAY', block_time) AS block_date,  
        block_number,  
        "from" AS from_address,   
        nonce, success, type,  
        value, data  
    FROM 
	    ethereum.transactions  
    WHERE  
        block_time >= TIMESTAMP '2023-01-01'  
        AND success = true  
        AND data <> 0x  
),  
CTE_raw_new AS ( 
    SELECT 
	    *   
    FROM 
	    CTE_raw  
    WHERE 
	    from_address IN (  
	        SELECT DISTINCT from_address  
	        FROM CTE_raw  
	        WHERE nonce = 0  
	    )  
),  
CTE_address_date_first AS ( 
    SELECT  
        from_address,  
        block_date AS active_date,  
        MIN(block_date) OVER (
	        PARTITION BY from_address
	        ORDER BY block_date
	        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
        ) AS first_date  
    FROM 
	    CTE_raw_new  
    GROUP BY 
	    from_address, block_date  
),  
CTE_address_date_first_length AS ( 
    SELECT  
        from_address,  
        active_date, first_date,  
        DATE_DIFF('DAY', first_date, active_date) AS length  
    FROM 
	    CTE_address_date_first  
),  
CTE_address_date_first_length7d AS ( 
    SELECT  
        from_address,  
        MAX(active_date) AS active_date,  
        DATE_TRUNC('WEEK', MIN(first_date)) AS first_week,  
        CEIL(length / 7.0) AS length  
    FROM 
	    CTE_address_date_first_length  
    GROUP BY 
	    from_address, CEIL(length / 7.0)  
),  
CTE_final AS (  
    SELECT  
        first_week,  
        SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS new_address,  
        CAST(SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS DOUBLE)
        / 
        CAST(SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS DOUBLE) 
        * 100.0 AS week_0,  
        CAST(SUM(CASE WHEN length = 1 THEN 1 ELSE 0 END) AS DOUBLE) 
        / 
        CAST(SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS DOUBLE) 
        * 100.0 AS week_1,  
        CAST(SUM(CASE WHEN length = 2 THEN 1 ELSE 0 END) AS DOUBLE) 
        / 
        CAST(SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS DOUBLE) 
        * 100.0 AS week_2,  
        CAST(SUM(CASE WHEN length = 3 THEN 1 ELSE 0 END) AS DOUBLE) 
        / 
        CAST(SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS DOUBLE) 
        * 100.0 AS week_3,  
        CAST(SUM(CASE WHEN length = 4 THEN 1 ELSE 0 END) AS DOUBLE) 
        / CAST(SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS DOUBLE) 
        * 100.0 AS week_4  
    FROM 
	    CTE_address_date_first_length7d  
    GROUP BY 
	    first_week  
    ORDER BY 
	    first_week  
)  
SELECT 
	* 
FROM 
	CTE_final;
```

## 4.2. Ethereum Cohort Retention (Since Jan 2022)

Let's repeat the process from above, this time starting from January 2022 for a more convincing analysis.

The retention rate in May 2023 was the second-highest since last year, warranting further analysis.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/ethereum-cohort-retention-contract-call-only-since-2022.webp)

```sql
WITH  
CTE_raw AS ( 
    SELECT  
        DATE_TRUNC('DAY', block_time) AS block_date,  
        block_number,  
        "from" AS from_address,   
        nonce, success, type,  
        value, data  
    FROM 
	    ethereum.transactions  
    WHERE  
        block_time >= TIMESTAMP '2022-01-01'  
        AND success = true  
        AND data <> 0x  
),  
CTE_raw_new AS ( 
    SELECT 
	    *   
    FROM 
	    CTE_raw  
    WHERE 
	    from_address IN (  
	        SELECT DISTINCT from_address  
	        FROM CTE_raw  
	        WHERE nonce = 0  
	    )  
),  
CTE_address_date_first AS ( 
    SELECT  
        from_address,  
        block_date AS active_date,  
        MIN(block_date) OVER (
	        PARTITION BY from_address
	        ORDER BY block_date
	        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
        ) AS first_date  
    FROM 
	    CTE_raw_new  
    GROUP BY 
	    from_address, block_date  
),  
CTE_address_date_first_length AS (   
    SELECT  
        from_address,  
        active_date, first_date,  
        DATE_DIFF('DAY', first_date, active_date) AS length  
    FROM 
	    CTE_address_date_first  
),  
CTE_address_date_first_length7d AS ( 
    SELECT  
        from_address,  
        MAX(active_date) AS active_date,  
        DATE_TRUNC('WEEK', MIN(first_date)) AS first_week,  
        CEIL(length / 7.0) AS length  
    FROM 
	    CTE_address_date_first_length  
    GROUP BY 
	    from_address, CEIL(length / 7.0)  
),  
CTE_final AS (  
    SELECT  
        first_week,  
        SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS new_address,  
        CAST(SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS DOUBLE) 
        / 
        CAST(SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS DOUBLE) 
        * 100.0 AS week_0,  
        CAST(SUM(CASE WHEN length = 1 THEN 1 ELSE 0 END) AS DOUBLE) 
        / 
        CAST(SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS DOUBLE) 
        * 100.0 AS week_1,  
        CAST(SUM(CASE WHEN length = 2 THEN 1 ELSE 0 END) AS DOUBLE) 
        / 
        CAST(SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS DOUBLE) 
        * 100.0 AS week_2,  
        CAST(SUM(CASE WHEN length = 3 THEN 1 ELSE 0 END) AS DOUBLE) 
        / 
        CAST(SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS DOUBLE) 
        * 100.0 AS week_3,  
        CAST(SUM(CASE WHEN length = 4 THEN 1 ELSE 0 END) AS DOUBLE) 
        / 
        CAST(SUM(CASE WHEN length = 0 THEN 1 ELSE 0 END) AS DOUBLE) 
        * 100.0 AS week_4  
    FROM 
	    CTE_address_date_first_length7d  
    GROUP BY 
	    first_week  
    ORDER BY 
	    first_week  
)  
SELECT 
	* 
FROM CTE_final;
```

# 5.  Why the Retention rate was high in May 2023?

The significant increase in the retention rate suggests a positive shift in user experience, indicating that users are now having a more positive experience than ever before.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/ethereum-cohort-retention-contract-call-only-since-2022-2.webp)

Now, let's extract the list of contract addresses that have been called the most by the new addresses from May 1 to May 8, 2023.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/to-address-rank-2023-05-01-2023-05-08.webp)

```sql
WITH  
CTE_raw AS ( 
    SELECT  
        DATE_TRUNC('DAY', block_time) AS block_date,  
        block_number,  
        "from" AS from_address,   
        "to" AS to_address,  
        nonce, success, type,  
        value, data  
    FROM 
	    ethereum.transactions  
    WHERE  
        TIMESTAMP '2023-05-01' <= block_time
        AND block_time < TIMESTAMP '2023-05-08'  
        AND success = true  
        AND data <> 0x  
),  
CTE_raw_new AS ( 
    SELECT 
	    *   
    FROM 
	    CTE_raw  
    WHERE 
	    from_address IN (  
	        SELECT DISTINCT from_address  
	        FROM CTE_raw  
	        WHERE nonce = 0  
	    )  
),  
CTE_ca_new_list AS (  
    SELECT  
        to_address,  
        COUNT(DISTINCT from_address) AS address_cnt  
    FROM 
	    CTE_raw_new  
    GROUP BY 
	    to_address  
    ORDER BY 
	    address_cnt DESC  
    LIMIT 
	    100  
)  
SELECT 
	* 
FROM 
	CTE_ca_new_list;
```

Now, let's identify the top 2 contracts from the table shown below.

**Rank 1. Tether USD (USDT) Contract**

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/etherscan-usdt.webp)

Tether USD (USDT), being a widely traded stablecoin on the Ethereum Network, does not reveal any significant changes in the new user experience.

**Rank 2. Uniswap Universal Router Contract**

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/etherscan-uniswap.webp)

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/universal-router.webp)
> [Permit2 and Universal Router](https://blog.uniswap.org/permit2-and-universal-router)

Now we've idenfified it. The Uniswap Universal Router, introduced in November 2022, has been instrumental in enhancing the positive user experience on the Ethereum Network.

![]({{ site.baseurl }}/assets/2023-05-29-ethereum-on-chain-data/universal-router-flowchart.webp)
> [Permit2 and Universal Router](https://blog.uniswap.org/permit2-and-universal-router)

As demonstrated above, we can execute multiple separate swaps in a single transaction, resulting in lowe gas fees.

# 6.  Conclusion

1. In May 2023, new addresses exhibit the second-highest retention rate since January 2022.
2. This abrupt increase in the retention rate appears to be significantly influenced by the swift and widespread adoption of the Uniswap Universal Router.

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)