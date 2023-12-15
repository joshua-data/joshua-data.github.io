---
layout: post
title: "Data Warehouse #05"
tags:
  - SQL
  - Data Warehouse
---

> In this article, I’ll summarize key takeaways from:
> -   SECTION 05. Facts

### DISCLAIMER
> This article is a compilation of key takeaways after completing  [Data Warehouse — The Ultimate Guide](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/)  on Udemy. However, it may be challenging to achieve a comprehensive and deep understanding of Data Warehouse solely through this article. For your in-depth learning, please take the course, which is an excellent resource, and I personally highly recommend it to those who are eager to master data warehousing, dimensional modeling, and the ETL process.

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/data-warehouse.webp)
> [Source](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/)

# Additivity in Facts

**1. Fully Additive Facts**
-   Can be added across  **all dimensions**
-   Most Flexible & Useful
-   **Most fact tables**  are fully additive!

**2. Semi-additive Facts**
-   Can be added across  **a few dimensions**
-   Less Flexible & Used Carefully
-   **Averaging**  might be an alternative! (i.e.,  **Balance**)

**3. Non-additive Facts**
-   Can  **NOT**  be added across  **any dimensions**
-   Limited Analytical
-   Store the  **underlying values**  instead! (i.e.,  **Ratio**,  **Percentage**,  **Price**, etc.)

### 1. Fully Additive Facts
-   Given the tables below:

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/fully-additive-facts-1.webp)

-   `units`  are  **additive**.

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/fully-additive-facts-2.webp)

### 2. Semi-additive Facts

-   Given the tables below:

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/semi-additive-facts-1.webp)

-   `balance`  is  **semi-additive**.

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/semi-additive-facts-2.webp)

### 3. Non-additive Facts

-   Given the tables below:

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/non-additive-facts-1.webp)

-   `price`  is  **non-additive**.

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/non-additive-facts-2.webp)

# Year-to-Date in Facts

**Month-to-Date, Quarter-to-Date, Year-to-Date**
* Often requested by business users
* Tempted to store them in columns
* **DO NOT store them in Fact Tables!**
	* Instead, better store  **the underlying values**  in Fact Tables!

# Types of Fact Tables

**1. Transactional Fact Tables**
**2. Periodic Snapshot Fact Tables**
**3. Accumulating Snapshot Fact Tables**

### 1. Transactional Fact Tables

* 1 Row = Measurement of 1 Event/Transaction
* It takes place at a specific time.
* One transaction defines the lowest grain.

**Characteristics**
-   Most Common & Very Flexible
-   Typically Additive
-   Other dimension tables associated ⬆️
-   Size ⬆️⬆️

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/transactional-fact-tables.webp)

### 2. Periodic Snapshot Fact Tables

* 1 Row = Summarizes Measurement of Many Events/Transactions
* Summarized of standard period (i.e., 1 day, 1 week, etc.)
* One period defines the lowest grain.

**Characteristics**
-   No Events = NULL or 0
-   Typically Additive
-   Other fact tables associated ⬆️ / Other dimension tables associated ⬇️
-   Size ⬇️

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/periodic-snapshot-fact-tables.webp)

### 3. Accumulating Snapshot Fact Tables

* 1 Row = Summarizes Measurement of Many Events/Transactions
* Summarized of the lifespan of 1 process (i.e., order fulfillment)
* Definite beginning & Definite ending (with steps)

**Characteristics**
-   Least Common
-   Workflow or Process Analysis
-   Multiple Datetime Foreign Keys (for each process step)
-   Other Datetime dimension tables associated ⬆️⬆️⬆️
-   Size ⬇️⬇️⬇️

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/accumulating-snapshot-fact-tables.webp)

# Steps to Create a Fact Table

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/steps-to-create-a-fact-table.webp)

### 4 Key Decisions

**1. Identify a business process for analysis.**
-   Examples: Sales, Order processing

**2. Declare the grain.**
-   Examples: Transaction, Order, Order lines, Daily, Location

**3. Identify relevant dimensions.**
-   “Filtering & Grouping”
-   “Soul” for Analysis
-   Examples: Time, Locations, Product Category, Users

**4. Identify facts for measurement.**
-   Defined by the grain! (Not by specific use cases)
-   Examples: Revenue, Order Amount

# Factless Fact Tables

Only dimensional aspects of an event are recorded.
-   How many employees have been registered last month?
-   How many employees have been registered in a certain region?

There are no measurement columns in the Factless Fact Tables.

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/factless-fact-tables.webp)
> [Source](https://learn.microsoft.com/ko-kr/power-bi/guidance/star-schema#factless-fact-tables)

# Natural vs. Surrogate Key

### Natural Key
-   Comes out of the source system

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/natural-keys.webp)

### Surrogate Key
-   Artificial Keys
-   Integer Number
-   `_PK` or `_FK` suffixes
-   Created by the Database or ETL Tool

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/surrogate-keys.webp)

**Benefits of Surrogate Key**
-   Improve performance (Storage ⬇️, Easy Joins ⬆️)
-   Handle dummy values such as NULLs or Missing Values (using 999 or -1)
-   Integrate multiple source systems
-   Easier Administration & Updates
-   Sometimes there are even NO Natural Keys available.

**Practical Guidelines of Surrogate Key**
-   Always use Surrogate Keys in tables as Main PK and FK
-   Use Surrogate Keys both for Fact & Dimension Tables (Except the Date Dimension Tables)
-   Optionally keep the Natural Keys

# Case Study: E-commerce

### Data Collection
-   Shopping Cart Checkouts

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/data-collection-1.webp)

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/data-collection-2.webp)

### Goals
-   Maximizing Profits (profit margins, sales volume, product cost, promotions, and discounts)

### 1. Identify a business process for analysis.
-   Which products have been sold?
-   How much is the sales profit?
-   How much is the sales profit for each website?
-   How much is the performance on each different day?
-   What does the sales trend look like over time?

### 2. Declare the grain.
-   The grains should have the most analytical values
-   The grains should have the highest dimensionalities.
-   In this case:  `order_id`  and  `product_id`

### 3. Identify relevant dimensions.
-   Dimensions should be the descriptive aspects of measures.
-   Dimensions should be naturally derived after the grains are defined.
-   In this case:  `customers`,  `products`,  `promotions`,  `datetimes`,  `websites`

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/identify-relevant-dimensions.webp)

### 4. Identify facts for measurement.
-   The facts must comply with the grains that we have defined above.
-   `discount`: additive vs. non-additive
-   `profit` : also complies with the grain

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/identify-facts-for-measurement.webp)

### 5. Final Results

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-05/final-results.webp)

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)