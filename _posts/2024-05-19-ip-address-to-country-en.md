---
layout: post
title: "IP Address-Country Mapping Query Optimization"
tags:
  - Language (English)
  - Article (Issue Resolution)
  - Level (Advanced)
  - Field (Analytics Engineering)
  - Skills (SQL)
---

> "Optimized the process of mapping user country information using IP addresses in a data warehouse. The previous method was inefficient due to long processing times, but the new approach reduced query execution time by 90%."

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
* In an environment operating a global service, it was necessary to map user country information based on connection IP addresses. This task was performed using PostgreSQL, but the previous approach resulted in performance degradation. The existing query took too long to execute, placing a significant burden on data warehouse operations.

### Tasks
* The goal was to optimize the existing IP address mapping query to drastically reduce processing time. This optimization aimed to improve the efficiency of the transformation process, achieving better data warehouse performance. Specifically, the core task was to optimize the computational process for IP address mapping and enhance the efficiency of the JOIN conditions.

### Actions

1. **Analysis of the Existing Approach**
* The existing query used the `<<=` operator to map IP addresses to CIDR networks, identified as the main cause of performance degradation.

2. **Creation of a New Table**
* Created a new table, `dim_ips_countries`, by processing the existing table.
  * This table includes `start_ip` and `end_ip` columns.
  * Converted IP addresses to BIGINT type to improve the efficiency of comparison operations.

3. **Index Creation**
* Created indexes on the `start_ip` and `end_ip` columns to maximize search performance.

4. **Query Optimization**
* Replaced the existing `<<=` operator with the `BETWEEN` operator to simplify IP address comparison and restructure the query for lightweight operations.

### Results
* The optimized query reduced execution time by 90%, significantly improving data warehouse performance.

---

# 2. Situation

> * In an environment operating a global service, it was necessary to map user country information based on connection IP addresses. This task was performed using PostgreSQL, but the previous approach resulted in performance degradation. The existing query took too long to execute, placing a significant burden on data warehouse operations.

### Problem Summary
* In an environment operating a global service, it was necessary to map IP addresses collected from user connections to geographical information such as the country. For this, a table mapping IP addresses to country names was created using PostgreSQL's CIDR operator, but the existing method was highly inefficient.

### Specific Problem Context
* The core task was to map the `session_ip` column in the `src_sessions` table to the `cidr` column in the `src_cidrs_countries` table to create the `fct_sessions` table.
* The existing query used the `<<=` operator to determine whether an IP address was included in a specific CIDR network. However, this method caused performance issues during large-scale data processing, with query execution times being excessively long. This degraded data warehouse performance and caused severe operational disruptions.

---

# 3. Tasks
> * The goal was to optimize the existing IP address mapping query to drastically reduce processing time. This optimization aimed to improve the efficiency of the transformation process, achieving better data warehouse performance. Specifically, the core task was to optimize the computational process for IP address mapping and enhance the efficiency of the JOIN conditions.

### **Assigned Tasks**
* The main objective was to significantly reduce the inefficient query execution time.

### **1. Improve Data Processing Speed**
* Reduce execution time to enhance data processing efficiency and prevent disruption to service operations.

### **2. Query Optimization**
* Design and implement an optimized query structure that can perform IP address and country information mapping more efficiently.

### **3. System Performance Improvement**
* Improve overall data warehouse performance to establish a foundation that can handle future data expansion and growth.

---

# 4. Actions

> 1. **Analysis of the Existing Approach**
> * The existing query used the `<<=` operator to map IP addresses to CIDR networks, identified as the main cause of performance degradation.
> 
> 2. **Creation of a New Table**
> * Created a new table, `dim_ips_countries`, by processing the existing table.
>   * This table includes `start_ip` and `end_ip` columns.
>   * Converted IP addresses to BIGINT type to improve the efficiency of comparison operations.
> 
> 3. **Index Creation**
> * Created indexes on the `start_ip` and `end_ip` columns to maximize search performance.
> 
> 4. **Query Optimization**
> * Replaced the existing `<<=` operator with the `BETWEEN` operator to simplify IP address comparison and restructure the query for lightweight operations.

### 1. Analysis of the Existing Approach
![]({{ site.baseurl }}/assets/2024-05-19-ip-address-to-country/1.webp)

**(STEP 1)** Create an index on the `src_cidrs_countries` table.
* Since the `cidr` column needs to be frequently scanned during the JOIN operation with the `src_sessions` table, an index was created on this column.
  <details>
  <summary>View code</summary>
  <div markdown="1">
  ```sql
    CREATE INDEX idx_cidr ON src_cidrs_countries (cidr);
  ```
  </div>
  </details>  

**(STEP 2)** Created the `fct_sessions` table by joining the `src_cidrs_countries` table with the `src_sessions` table.
* The `<<=` operator was used in the JOIN process.
* However, this operator, which compares CIDR types, had a high computational cost, causing performance degradation during large-scale data processing.
  <details>
  <summary>View code</summary>
  <div markdown="1">
  ```sql
    CREATE TABLE fct_sessions AS
      SELECT
        S.session_id,
        S.user_id,
        C.country
      FROM
        src_sessions S
      LEFT JOIN
        src_cidrs_countries C
        ON S.session_ip::INET <<= C.cidr;
  ```
  </div>
  </details>  

### 2. **Creation of a New Table**
![]({{ site.baseurl }}/assets/2024-05-19-ip-address-to-country/2.webp)

* A new table, `dim_ips_countries`, was created by processing the existing `src_cidrs_countries` table. This table was newly designed to minimize CIDR operations, adding `start_ip` and `end_ip` columns representing the IP address range for each CIDR value.
* By converting IP addresses to BIGINT type for storage, computation speed was greatly improved. `start_ip` and `end_ip` represent the lowest and highest IPs within the CIDR range, simplifying the process of verifying IP addresses within a CIDR network.
<details>
<summary>View code</summary>
<div markdown="1">
```sql
  CREATE TABLE dim_ips_countries AS
    SELECT
      cidr,
      ('x' || 
      LPAD(TO_HEX((SPLIT_PART(HOST(cidr), '.', 1)::INTEGER)), 2, '0') ||
      LPAD(TO_HEX((SPLIT_PART(HOST(cidr), '.', 2)::INTEGER)), 2, '0') ||
      LPAD(TO_HEX((SPLIT_PART(HOST(cidr), '.', 3)::INTEGER)), 2, '0') ||
      LPAD(TO_HEX((SPLIT_PART(HOST(cidr), '.', 4)::INTEGER)), 2, '0')
      )::BIT(32)::BIGINT AS start_ip,
      ('x' ||
      LPAD(TO_HEX((SPLIT_PART(HOST(BROADCAST(cidr)), '.', 1)::INTEGER)), 2, '0') ||
      LPAD(TO_HEX((SPLIT_PART(HOST(BROADCAST(cidr)), '.', 2)::INTEGER)), 2, '0') ||
      LPAD(TO_HEX((SPLIT_PART(HOST(BROADCAST(cidr)), '.', 3)::INTEGER)), 2, '0') ||
      LPAD(TO_HEX((SPLIT_PART(HOST(BROADCAST(cidr)), '.', 4)::INTEGER)), 2, '0')
      )::BIT(32)::BIGINT AS end_ip,				
      country
    FROM
      src_cidrs_countries;
```
</div>
</details>  

### 3. **Index Creation**

* Since the `start_ip` and `end_ip` columns need to be frequently scanned during the JOIN operation with the `src_sessions` table, an index was created on these two columns.
* This index was designed to efficiently find values within an IP address range, enabling quick searches during JOIN operations.
  <details>
  <summary>View code</summary>
  <div markdown="1">
  ```sql
    CREATE INDEX idx_ip_range ON dim_ips_countries (start_ip, end_ip);
  ```
  </div>
  </details>  

### 4. **Query Optimization**

* The existing `<<=` operator was replaced with the `BETWEEN` operator to simplify IP address comparison and restructure the query for lightweight operations.
* The `session_ip` column in the `src_sessions` table was also converted from CIDR to IP address, then to BIGINT type, to be compared with the `start_ip` and `end_ip` columns in the `dim_ips_countries` table.
  <details>
  <summary>View code</summary>
  <div markdown="1">
  ```sql
    CREATE TABLE fct_sessions AS
      SELECT
      S.session_id,
      S.user_id,
      C.country
    FROM (
      SELECT
        session_id,
        user_id,
        ('x' ||
        LPAD(TO_HEX((SPLIT_PART(HOST(session_ip::INET), '.', 1)::INTEGER)), 2, '0') ||
        LPAD(TO_HEX((SPLIT_PART(HOST(session_ip::INET), '.', 2)::INTEGER)), 2, '0') ||
        LPAD(TO_HEX((SPLIT_PART(HOST(session_ip::INET), '.', 3)::INTEGER)), 2, '0') ||
        LPAD(TO_HEX((SPLIT_PART(HOST(session_ip::INET), '.', 4)::INTEGER)), 2, '0')                
        )::BIT(32)::BIGINT AS session_ip
      FROM
        src_sessions
    ) S
    LEFT JOIN
      src_cidrs_countries C
      ON S.session_ip BETWEEN C.start_ip AND C.end_ip;
  ```
  </div>
  </details>

---

# 5. Results
> * The optimized query reduced execution time by 90%, significantly improving data warehouse performance.

### 1. Positive Results

* The optimized approach reduced query execution time from approximately 100x to 10x, effectively cutting execution time by around 90%. This significantly improved data processing speed and system performance. The new approach also maintained stable performance during large-scale data processing and established a foundation that could flexibly respond to future data growth.
* This optimization effort maximized the efficiency of the data warehouse, reducing operational costs and enabling better data analysis and service delivery. As a result, the overall system performance was greatly enhanced, making a significant contribution to the company's data operation strategy.

### 2. Lessons Learned

* As shown in the figure below, SQL JOINs involve a nested loop search process, which needs to be carefully considered.
![]({{ site.baseurl }}/assets/2024-05-19-ip-address-to-country/3.webp)

##### (TIP 1) Columns used in JOIN conditions should have lightweight data types.
* In the existing approach, the `cidr` column was of the CIDR type, but in the new approach, it was parsed into BIGINT to make the data type lighter.

##### (TIP 2) Operators used in JOIN conditions should have lightweight processes.
* In the existing approach, the heavier `<<=` operator was used, but in the new approach, the `BETWEEN` operator was used to reduce the burden.

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)