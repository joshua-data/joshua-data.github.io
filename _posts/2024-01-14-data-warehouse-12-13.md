---
layout: post
title: "Data Warehouse #12-13"
tags:
  - SQL
  - Data Warehouse
---

> In this article, I’ll summarize key takeaways from:
>  - SECTION 12. Using a Data Warehouse
>  - SECTION 13. Optimizing a Data Warehouse

### DISCLAIMER
> This article is a compilation of key takeaways after completing [Data Warehouse — The Ultimate Guide](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/) on Udemy. However, it may be challenging to achieve a comprehensive and deep understanding of Data Warehouse solely through this article. For your in-depth learning, please take the course, which is an excellent resource, and I personally highly recommend it to those who are eager to master data warehousing, dimensional modeling, and the ETL process.

![]({{ site.baseurl }}/assets/2023-12-19-data-warehouse-06/data-warehouse.webp)
> [Source](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/)

# Using Indexes

![]({{ site.baseurl }}/assets/2024-01-14-data-warehouse-12-13/1.png)

```sql
SELECT
	product_id
FROM
	sales
WHERE
	customer_id = 5
```

### WITHOUT Indexes
- Table Scan
- Read Efficiency ⬇️
- Write Efficiency ⬆️

### WITH Indexes
- Read Efficiency ⬆️
- Write Efficiency ⬇️
- How It Works:
    - Write Data in a Specific Order
    - Create a Lookup Table (to find a pointer to read later)

![]({{ site.baseurl }}/assets/2024-01-14-data-warehouse-12-13/2.png)
> Write Data in a Specific Order

![]({{ site.baseurl }}/assets/2024-01-14-data-warehouse-12-13/3.png)
> Create a Lookup Table

![]({{ site.baseurl }}/assets/2024-01-14-data-warehouse-12-13/4.png)

# B-tree Indexes

![]({{ site.baseurl }}/assets/2024-01-14-data-warehouse-12-13/5.png)
> [Source](https://velog.io/@gayeong39/B-%ED%8A%B8%EB%A6%AC-%EC%9D%B8%EB%8D%B1%EC%8A%A4)

- Multi-level Tree Structure
- It breaks data down into pages or blocks.
- Columns should be High Cardinality
- Not Entire Table
- Storage Cost ⬆️

# Bitmap Indexes

![]({{ site.baseurl }}/assets/2024-01-14-data-warehouse-12-13/6.png)
> [Source](https://velog.io/@gayeong39/%EB%B9%84%ED%8A%B8%EB%A7%B5-%EC%9D%B8%EB%8D%B1%EC%8A%A4BitMap-Index)

- Particularly Good for Data Warehouses
- Columns should be **Low Cardinality** + **Large Amounts of Data**
- Storage Cost ⬇️
- Read Optimization ⬆️
- DML Operation ⬆️

# Guidelines

| **B-tree Index** | **Bitmap Index**
| - | - 
| Default Index | Slow Update
| Unique Columns | Storage Efficiency
| (Surrogate Key, Names) | Read Performance ⬆️

![]({{ site.baseurl }}/assets/2024-01-14-data-warehouse-12-13/7.png)

### Fact Tables
- Choose Columns that are used as `Filters`.
- Surrogate Key → **B-tree Index**
- Foreign Keys → **Bitmap Index**

### Dimension Tables
- Are they used in searches a lot?
- Choose based on `Cardinality`.

### Create Index Examples
```sql
CREATE INDEX
	index_name ON table_name [USING method]
	(
		column_name [ASC | DESC],
		...
	)
;
```

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)