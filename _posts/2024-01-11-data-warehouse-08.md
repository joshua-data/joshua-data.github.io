---
layout: post
title: "Data Warehouse #08"
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

# Understanding the ETL Process

### The Layer of a Data Warehouse

![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/1.png)

**ETL Setup**
* 1️⃣ Building Workflows
	* Staging Workflow
	* Core Workflow
	* Data Mart Workflow
* 2️⃣ Jobs
	* Run the Workflows
	* Scheduled based on Defined Rules

# Extracting (Data Sources → Staging)

![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/2.png)

* Transient, most commonly.
	* All the data is copied and then deleted.
* Types of Extracting

| **Initial Load** | **Delta Load** |
| - | - |
| First (real) Run | Subsequent Runs |
| All Data | Only Additional Data |

# Extracting (Data Sources → Staging): 1️⃣ Initial Load

* First Initial Extraction from Source Data
* Followings should be discussed:
	* What data is needed?
	* When is a good time to load the data? (Night? Weekend?)
	* Test with smaller extractions.
	* All the transformation steps should have been designed. (up to Core and Data Marts)

# Extracting (Data Sources → Staging): 2️⃣ Delta Load

* Incremental Periodic Extraction & Load
* **Delta Column**
	* Remember `MAX(sales_key)`

```plain
Variable X = MAX(sales_key)
Next Run: sales_key > X
```

![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/3.png)

What if there is no **Delta Column**?
* Some tools can capture automatically which data has already been loaded.
* Just full-load every time and compare the data with data that is already loaded.
* Depending on the data volume → Performance Issue!

# Loading (Staging → Core): INSERT & UPDATE

![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/4.png)

* **INSERT or APPEND**
	* add new values
* **UPDATE**
	* change the existing values
* **DELETE**?
	* typically, we don't delete data.

# [DEMO] Extracting (Data Sources → Staging)

### Create Table

![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/5.png)

* `dim_products` in Staging Layer

| **column** | **type** |
| - | - |
| `product_PK` | Surrogate Key
| `product_id` | Natural Key
| `product_name` |
| `category` |
| `subcategory` |

### Initial Load

![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/6.png)

* Table input
	* from `products` in Source
* Table output
	* to `dim_products` in Staging Layer

### Delta Load

![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/7.png)

* Table input
	* from `dim_products` in Staging Layer
	* `SELECT MAX(product_id) FROM "Staging".dim_products`
* Set variables
	* Save As `LastLoad`
* Get variables
	* `${LastLoad}`
* Table input
	* from `products` in Source
	* `SELECT * FROM "public".products WHERE product_id > ${LastLoad}`
* Table output
	* to `dim_products` in Staging Layer

# Transformations

### Basic

* Deduplication
![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/8.png)

* Filtering Rows
![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/9.png)

* Filtering Columns
![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/10.png)

* Cleaning & Mapping
![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/11.png)

* Value Standardization
![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/12.png)

* Key Generation
![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/13.png)

### Advanced

* Joining
![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/14.png)

* Splitting
![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/15.png)

* Aggregating
	* `SUM`, `COUNT`, `DISTINCT COUNT`, `AVERAGE`
![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/16.png)

* Deriving New Values
![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/17.png)

# Summary

![]({{ site.baseurl }}/assets/2024-01-11-data-warehouse-08/18.png)

* **Extract**: Source → Staging
	* Add Surrogate Key
	* Delta Logic
* **Transform + Load**: Staging → Core
	* Clean Data
	* Add Additional Columns

# Scheduling

### Can be done either:

* directly from the ETL Tool,
* or using External Tool
	* e.g., Windows Task Scheduler, Server, etc.

### Guidelines

* What are the requirements?
	* 3 times a day?
	* 1 time a day?
	* Every 30 mins?
* How long does it take?
	* 5 mins?
	* 1 hour?
* What is a good time?
	* Initial Load vs. Delta Load
	* Effect on the Productive System
	* Short Read Access
	* Night? Morning?

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)