---
layout: post
title: "Data Warehouse #07"
tags:
  - SQL
  - Data Warehouse
---

> In this article, I’ll summarize key takeaways from:
>  - SECTION 07. Slowly Changing Dimensions

### DISCLAIMER
> This article is a compilation of key takeaways after completing [Data Warehouse — The Ultimate Guide](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/) on Udemy. However, it may be challenging to achieve a comprehensive and deep understanding of Data Warehouse solely through this article. For your in-depth learning, please take the course, which is an excellent resource, and I personally highly recommend it to those who are eager to master data warehousing, dimensional modeling, and the ETL process.

![]({{ site.baseurl }}/assets/2023-12-19-data-warehouse-06/data-warehouse.webp)
> [Source](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/)

# Slowly Changing Dimensions

Dimensions are rather static than Facts, but they do change in the real world.

Types of Slowly Changing Dimensions (SCDs)
* `Type 0`: Retain Original
* `Type 1`: Overwrite
* `Type 2`: New Row
	* `Type 2'`: Administrative New Row
* `Type 3`: Additional Attributes

# Type 0: Retain Original
* No changes at all.
* Very simple and easy to maintain.
* `Dates Table` is a great example.

# Type 1: Overwrite

![]({{ site.baseurl }}/assets/2024-01-02-data-warehouse-07/overwrite.png)

* Old attributes are just **Overwritten**.
* Only the **Current State** is reflected.
* 👍 **Advantages**
	* Very simple
	* Facts don't need to be modified.
* 👎 **Disadvantages**
	* History is lost.
	* Insignificant Changes ➡️ Do not affect existing queries.
		* i.e., product name
	* Significant Changes ➡️ Affect or break existing queries.
		* i.e., category

# Type 2: New Row

![]({{ site.baseurl }}/assets/2024-01-02-data-warehouse-07/new-row.png)

* Perfectly partitions **history**.
* Changes are reflected in **history**.
* 👎 **Disadvantages**
	* Difficult to calculate the total number of products in the current view.

# Type 2': Administrative New Row

![]({{ site.baseurl }}/assets/2024-01-02-data-warehouse-07/administrative-new-row.png)

* `effective_date` & `expiration_date`
	* The period in which values are valid.
	* `expiration_date`
		* Avoid **Null** values, and fill in a date far in the future instead.
* Requires **Surrogate Key** instead of **Natural Key**.
* Lookup from the Query
	* Step 1) Find the Natural Key. (`product_PK`)
	* Step 2) Then, find the Valid Period. (`effective_date` & `expiration_date`)
	* Step 3) `is_current` column is optional.

# Type 3: Additional Attributes

![]({{ site.baseurl }}/assets/2024-01-02-data-warehouse-07/additional-attributes.png)

* Instead of adding a row, we **add a column**.
* Enables to switch between historical & current views.
* It's typically used for significant changes at a time.
	* i.e., Restructuring in an organization
* 👎 **Disadvantages**
	* Minor Changes ➡️ Type 1 is better.
	* Frequent or Unpredictable Changes ➡️ Type 2 is better.

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)