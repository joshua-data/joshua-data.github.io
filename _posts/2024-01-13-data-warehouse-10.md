---
layout: post
title: "Data Warehouse #10"
tags:
  - SQL
  - Data Warehouse
---

> In this article, I’ll summarize key takeaways from:
>  - SECTION 10. Case Study: Creating a Data Warehouse

### DISCLAIMER
> This article is a compilation of key takeaways after completing [Data Warehouse — The Ultimate Guide](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/) on Udemy. However, it may be challenging to achieve a comprehensive and deep understanding of Data Warehouse solely through this article. For your in-depth learning, please take the course, which is an excellent resource, and I personally highly recommend it to those who are eager to master data warehousing, dimensional modeling, and the ETL process.

![]({{ site.baseurl }}/assets/2023-12-19-data-warehouse-06/data-warehouse.webp)
> [Source](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/)

# Guidelines
1. Look at the problem and plan
2. Set up tables & schema
3. Staging
4. Core (Dimension Tables)
5. Core (Fact Tables)
6. Set up Jobs & Testing

# Fact Table Design
1. `date_FK`
2. `product_FK`
3. `payment_FK`
4. Additional Columns:
	* `total_price`
	* `total_cost`
	* `profit`

![]({{ site.baseurl }}/assets/2024-01-13-data-warehouse-10/1.png)

# Processing Order

![]({{ site.baseurl }}/assets/2024-01-13-data-warehouse-10/2.png)

### Source → Staging
* `Extract`
	* Add Surrogate Key
	* Delta Logic
### Staging → Core
* `Transform` + `Load`
	* Clean Data
	* Add Additional Columns

# Scheduling
* Jobs or Packages
* Scheduling at:
	* Specific Times
	* Frequencies

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)