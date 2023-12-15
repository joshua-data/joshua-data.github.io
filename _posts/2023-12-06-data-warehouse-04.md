---
layout: post
title: "Data Warehouse #04"
tags:
  - english
  - sql
  - data_warehouse
---

> In this article, I’ll summarize key takeaways from:
> -   SECTION 04. Dimensional Modeling

### DISCLAIMER
> This article is a compilation of key takeaways after completing  [Data Warehouse — The Ultimate Guide](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/)  on Udemy. However, it may be challenging to achieve a comprehensive and deep understanding of Data Warehouse solely through this article. For your in-depth learning, please take the course, which is an excellent resource, and I personally highly recommend it to those who are eager to master data warehousing, dimensional modeling, and the ETL process.

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/data-warehouse.webp)
> [Source](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/)

# What is Dimensional Modeling?

**Dimensional Modeling**
* Unique Technique of Structuring Data
* Commonly Used in Data Warehouse
* Optimized for Faster Data Regrieval
* Performance & Usability Oriented
* Designed Reporting & OLAP

**Details**
-   It is the  **Method of Organizing Data**  in a Data Warehouse.
-   `Profit`  by  `Year`?  `Profit`  by  `Category`?
	-   **Facts**:  **Measurements**  like  `Profit`
	-   **Dimensions**:  **Contexts**  like  `Period`  or  `Category`

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/star-schema.webp)

# Why is Dimensional Modeling?

-   Dimensional Modeling → `Performance` ⬆️ / `Usability` ⬆️

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/dimensional-modeling.webp)

# Facts

**Facts** usually...
* Aggregatable (with Numeric Values)
* Measurable
* Event or Transactional Data
* Date or Time in a Fact Table
* Foundation of Data Warehouse
* Key Measurements
* Aggregated and Analyzed

# Dimensions

**Dimensions** usually...
* Non-aggregatable
* Descriptive
* More Static than Facts
* Categorizes Facts
* Supportive & Descriptive
* Filtering, Grouping, and Labeling

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/star-vs-snowflake.webp)
> [Source](https://nidhig631.medium.com/star-schema-vs-snowflake-schema-78dc9424a8a2)

**Star Schema**
* Most Common Schema in Data Mart
* Simplest Form (vs. Snowflake Schema)
* Works Best for Specific Needs (Simple Queries vs. Complex Queries)
* Usability + Query Performance (`Read`)

**Denormalized** (= Star Schema)
-   Data Redundancy ⬆️
-   Optimized to get data out ⬆️
-   Query Performance (`Read`) ⬆️
-   User Experience ⬆️

**Normalized** (= Snowflake Schema)
-   Data Redundancy ⬇️
-   Storage ⬇️
-   Query Performance (`Write & Update`) ⬆️
-   Number of Tables ⬆️
-   Joins Necessary ⬆️

# Snowflake Schema

**Advantages**
-   Storage Cost ⬇️
-   Data Redundancy ⬇️
-   Query Performance (`Write & Update`) ⬆️

**Disadvantages**
-   Complex Queries with Joins
-   Query Performance (`Read`) ⬇️

**Star Schema vs. Snowflake Schema**
-   **Data Mart**  →  `Star Schema`  is Preferred!
-   **Core**  →  `Star Schema`  is Preferred, but  `Snowflake Schema`  can be considered!

# Demo: Product & Category Dimensions (`Snowflake Schema`)

(1) With  `products.csv`, we are now trying to create a “**Category Dimension**” using PostgreSQL!

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/products-csv.webp)

(2) In PGAdmin, Click “`Query Tool`” on the  **public schema**.

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/query-tool.webp)

(3) Run the code block to create  `products`  table, then you’ll see the table has been created.

```sql
CREATE TABLE products (  
    product_id VARCHAR(5),  
    product_name VARCHAR(100),  
    category VARCHAR(50),  
    subcategory VARCHAR(50)  
);
```

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/public.webp)

(4) Right-click on the  `products`  table, then click “**Import/Export Data**” button.

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/import-export-data.webp)

(5) Designate the  **products.csv**  file to import on  `products`  table.

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/import.webp)

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/options.webp)

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/columns.webp)

(6) Run the code block to see if your data has been imported.

```sql
SELECT * FROM products;
```

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/data-output.webp)

(7) Run the code block to see what kind of unique  **category**  is in  `products`  table.

```sql
SELECT  
    DISTINCT category  
FROM products;
```

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/data-output-category.webp)

(8) Run the code block to create a dimension table named  `categories`.

```sql
SELECT  
    ROW_NUMBER() OVER (ORDER BY category) AS category_id,  
    category  
INTO categories  
FROM (  
    SELECT DISTINCT category  
    FROM products  
) SUB  
;
```

(9) See if the  `categories`  table has been created.

```sql
SELECT * FROM categories;
```

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-04/data-output-category-id.webp)

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)