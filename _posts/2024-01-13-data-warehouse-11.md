---
layout: post
title: "Data Warehouse #11"
tags:
  - SQL
  - Data Warehouse
---

> In this article, I’ll summarize key takeaways from:
>  - SECTION 11. ETL vs. ELT

### DISCLAIMER
> This article is a compilation of key takeaways after completing [Data Warehouse — The Ultimate Guide](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/) on Udemy. However, it may be challenging to achieve a comprehensive and deep understanding of Data Warehouse solely through this article. For your in-depth learning, please take the course, which is an excellent resource, and I personally highly recommend it to those who are eager to master data warehousing, dimensional modeling, and the ETL process.

![]({{ site.baseurl }}/assets/2023-12-19-data-warehouse-06/data-warehouse.webp)
> [Source](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/)

# What is ELT?

![]({{ site.baseurl }}/assets/2024-01-13-data-warehouse-11/1.png)

### Data Sources → Data Warehouse
* `Extract` + `Load`
	* Real-time ⬆️

### Data Warehouse → ...
* `Transform`
	* Leverage Database
	* More Flexible!

```sql
SELECT
    category,
    SUM(sales_amount)
FROM
    sales
GROUP BY
    category
```

# ETL vs. ELT

| **ETL** | **ELT**
| - | -
| More Stable with Defined Transformations | Requires High Performing DB
| More Generic Use Cases | More Flexible
| Security ⬆️ | Transformations can be Changed Quickly!
| Reporting | Real-time ⬆️
| Easy to Use | Data Science, ML

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)