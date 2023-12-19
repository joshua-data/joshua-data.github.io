---
layout: post
title: "Data Warehouse #06"
tags:
  - SQL
  - Data Warehouse
---

> In this article, I’ll summarize key takeaways from:
>  - SECTION 06. Dimensions

### DISCLAIMER
> This article is a compilation of key takeaways after completing [Data Warehouse — The Ultimate Guide](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/) on Udemy. However, it may be challenging to achieve a comprehensive and deep understanding of Data Warehouse solely through this article. For your in-depth learning, please take the course, which is an excellent resource, and I personally highly recommend it to those who are eager to master data warehousing, dimensional modeling, and the ETL process.

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/data-warehouse.webp)
> [Source](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/)

# Dimension Tables

-   A role of “**group & filter**”
-   Always has a **PK(Primary Key)**.
    -   Recommended to iuse a **Surrogate Key**!
        -   because a Natural Key may or may not have null values.
-   Number of Rows & Columns (compared to Fact Tables)
    -   Number of Rows ⬇️
    -   Number of Columns ⬆️ (with descriptive attributes)

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/dimension-tables.png)

# Date Dimensions

-   One of the most common & important dimensions
-   Contains date-related features
```plain
Year, Quarter, Month(Name & Number), Week, Day, Weekday(Name & Number), etc.
Combination: Year-quarter, Year-Month, etc.
```

-   Surrogate Key: **`YYYYMMDD`** (Integer Type)
    -   The recommended way to fill null values: `NULL` dates in Source → `19000101` in Dimensions

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/date-dimensions.png)

-   Date Dimensions can be populated in advance. (for the next 5 or 10 years, for example.)    
-   Don’t combine time with date!
    -   `Time` should be a separate dimension from `Date`.
-   Date Feature Examples

| **Type** | **Examples**
| - | -
| Number & Text | January / 1
| Long & Abbreviated | January / Jan / Monday / Mon
| Combinations of Features | Q1 / 2022-Q1
| Fiscal Dates | Fiscal Year, etc.
| Flags | Weekend, Holiday, etc.

# Nulls in Dimensions

### `promotion_FK`
-   `NULL` values must be avoided so that they can **appear in JOINs**!

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/nulls-in-dimensions-1.png)

### Replace Nulls with descriptive values!
-   More understandable for business users
-   Values appear in aggregations in BI tools

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/nulls-in-dimensions-2.png)

# Hierarchies in Dimensions

### Snowflake Schema
-   Should be avoided in Data Mart
    -   👍 Good for “**Normalization**”
    -   👎 Bad for “**Query Performance (Read)**”
    
![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/hierarchies-in-dimensions-1.png)

### Star Schema
-   **Denormalized** & **Flattened**

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/hierarchies-in-dimensions-2.png)

### Consider combinations if helpful!

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/hierarchies-in-dimensions-3.png)

# Conformed Dimensions

**A Confirmed Dimension is a dimension shared by multiple fact tables or stars.**
* Used to compare facts across different fact tables.

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/conformed-dimensions-1.png)

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/conformed-dimensions-2.png)

**The same granularity is not necessary, and a different scope of FK can be possible!**

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/conformed-dimensions-3.png)

# Degenerate Dimensions

**A Degenerate Dimension is a dimension that has no attributes or descriptive information, but only a single identifier or key.**
-   Used to simplify fact tables by eliminating the need for a separate dimension table.
-   It can be still useful in the future, so we don’t just drop it.
-   Examples: invoice number, billing number, order id, etc.
-   with a suffix of **`_DD`**

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/degenerate-dimensions.png)

# Junk Dimensions

**A Junk Dimension is a dimension with various flags or indicators with low cardinality.**
-   We call it `Junk Dimension` only internally. When talking to business users, we can refer to it as the “**Transactional Indicator Dimension**”.
-   If there are too many combination cases for the attributes, extract only existing combinations of the fact table.

> 💡 `Junk Dimension` is a concept in data warehousing that involves **combining low-cardinality fields or attributes into a single-dimension table**. These low-cardinality fields may represent different categories or flags that have a limited number of possible values. By consolidating these attributes into a single table, a Junk Dimension reduces the number of dimension tables in a data warehouse. [(Source)](https://www.dremio.com/wiki/junk-dimension/)

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/junk-dimensions.png)

# Role-playing Dimensions

**A Role-playing Dimension is a dimension that is referenced multiple times by a fact table.**

![]({{ site.baseurl }}/assets/2023-12-20-data-warehouse-06/role-playing-dimensions.png)

**What are Role-playing Dimensions?**
* Role-playing Dimensions are dimensions that are used more than once in a fact table, each time with a different meaning or role.
* They are typically derived from the same source dimension table, but with different aliases or prefixes to indicate their role.
	* For example, a date dimension table can be used to create `order_date`, `ship_date`, and `delivery_date` dimensions in a fact table that records product sales.
	* Each of these dimensions has the same structure and attributes, such as `year`, `month`, `quarter`, `day`, etc., but they represent different aspects of the sales process.

**Why are Role-playing Dimensions challenging?**
* (1) Increase the complexity and size of the fact table.
	* Each Role-playing Dimension adds more columns and joins to the fact table.
* (2) Create confusion and inconsistency among users and analysts.
	* Different roles may have different meanings or interpretations for the same dimension attribute.
* (3) Difficult to maintain and update.
	* Any change in the source dimension table may affect multiple Role-playing Dimensions and fact tables.

**How do you design Role-playing Dimensions?**
* (1) Use a single-dimension table for each Role-playing Dimension and join it to the fact table using different foreign keys.
	* **Example**: a date dimension table can be joined to a sales fact table using `order_date_key`, `ship_date_key`, and `delivery_date_key` as foreign keys.
	* **Pros**: simplicity and consistency
	* **Cons**: redundancy and performance issues (The same dimension table is duplicated and joined multiple times to the fact table.)
* (2) Use a single dimension table for each Role-playing Dimension, but with different views or aliases to indicate their role.
	* **Example**: a date dimension table can be viewed or aliased as `order_date`, `ship_date`, and `delivery_date` in the data warehouse schema, and joined to the fact table using the appropriate view or alias name.
	* **Pros**: reducing redundancy and improving performance (The same dimension table is not duplicated and joined multiple times to the fact table.)
	* **Cons**: complexity and dependency (The views or aliases need to be created and maintained in the data warehouse schema.)

> [Source](https://www.linkedin.com/advice/3/how-do-you-deal-changing-business-requirements)

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)