---
layout: post
title: "Data Warehouse #14"
tags:
  - SQL
  - Data Warehouse
---

> In this article, I’ll summarize key takeaways from:
>  - SECTION 14. The Modern Data Warehouses

### DISCLAIMER
> This article is a compilation of key takeaways after completing [Data Warehouse — The Ultimate Guide](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/) on Udemy. However, it may be challenging to achieve a comprehensive and deep understanding of Data Warehouse solely through this article. For your in-depth learning, please take the course, which is an excellent resource, and I personally highly recommend it to those who are eager to master data warehousing, dimensional modeling, and the ETL process.

![]({{ site.baseurl }}/assets/2023-12-19-data-warehouse-06/data-warehouse.webp)
> [Source](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/)

# Cloud vs. On-premise

| **Cloud** | **On-premise**
| - | -
| Fully Managed | Full Control
| Scalable | Data Governance & Compliance
| Cost Efficiency ⬆️ | Cost Efficiency ⬇️
| Regulations | Flexibility ⬇️

In most cases, **Cloud Data Warehouse** is the better choice nowadays!
* Snowflake
* Amazon Redshift
* Azure Synapse
* Google BigQuery

# MPP (Massive Parallel Processing)

![]({{ site.baseurl }}/assets/2024-01-14-data-warehouse-14/1.png)
> [Source](https://www.tibco.com/reference-center/what-is-massively-parallel-processing)

- **“Shared Nothing”** Architecture
    - Independent Resources
    - The workload is split up & processed individually.
- The modern way of solving performance issues
- Millions of rows can be processed faster.
- Many people can run queries at the same time with good performance.
- Helpful with centralizing massive amounts of data

# Columnar Databases

![]({{ site.baseurl }}/assets/2024-01-14-data-warehouse-14/2.png)
> [Source](https://en.wikipedia.org/wiki/Column-oriented_DBMS)

```sql
SELECT
	Lastname
FROM
	emp
;
```

### Row-oriented Databases
![]({{ site.baseurl }}/assets/2024-01-14-data-warehouse-14/3.png)
> [Source](https://en.wikipedia.org/wiki/Column-oriented_DBMS)

- All have to be scanned.
    - Bad for fast data retrieval.
- Good for Transactional Databases.

### Column-oriented Databases
![]({{ site.baseurl }}/assets/2024-01-14-data-warehouse-14/4.png)
> [Source](https://en.wikipedia.org/wiki/Column-oriented_DBMS)

- Less data needs to be processed.
- Better compression, Less storage

![]({{ site.baseurl }}/assets/2024-01-14-data-warehouse-14/5.png)

# Tips

- Use Indexes
    - if you frequently want to retrieve less than 15% of the rows in a large table.
    - If you frequently use joins to improve join performance.
- Small tables do not require indexes.
- Wide Range of Values (**High Cardinality**) → Good for **B-tree Indexes**
- Small Range of Values (**Low Cardinality**) → Good for **Bitmap Indexes**

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)