---
layout: post
title: "Data Warehouse #03"
tags:
  - english
  - sql
  - data_warehouse
---

> In this article, I’ll summarize key takeaways from:
> -   SECTION 03. Data Warehouse Architecture

### DISCLAIMER

> This article is a compilation of key takeaways after completing  [Data Warehouse — The Ultimate Guide](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/)  on Udemy. However, it may be challenging to achieve a comprehensive and deep understanding of Data Warehouse solely through this article. For your in-depth learning, please take the course, which is an excellent resource, and I personally highly recommend it to those who are eager to master data warehousing, dimensional modeling, and the ETL process.

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-03/data-warehouse.webp)
> [Source](https://www.udemy.com/course/data-warehouse-the-ultimate-guide/)

# Data Lake vs. Data Warehouse

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-03/data-lake-vs-data-warehouse.webp)

# Pentaho & PostgreSQL

### Pentaho

-   **ETL Tool**
-   [Pentaho Community Edition Download](https://www.hitachivantara.com/en-us/products/pentaho-plus-platform/data-integration-analytics/pentaho-community-edition.html)
-   `pdi-ce-9.4.0.0-343.zip`
-   After unzipping the downloaded file, click the  `spoon`  file.

### PostgreSQL

-   **Database Management System**
-   [PostgreSQL Download](https://www.postgresql.org/download/)
-   After installing the downloaded file, run  `PGAdmin`.

# The Layers of a Data Warehouse

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-03/The Layers of a Data Warehouse.webp)

### Data Sources → The Staging Layer
* **`E`** of ETL Process
* **"The Landing Zone Extracted Data"**
	* Data in Tables and on a Separate Database
	* As little "toughing" as possible
	* We don't charge the source systems.
	* Temporary or Persistent Staging Layers
* Short Time on the Source Systems
* Quickly Extracted
* Move the Data into Relational Database
* Start Transformations from There
* Minimal Transformation

### The Staging Layer → The Cleansing Layer
* **`TL`** of ETL Process

### The Cleansing Layer → Core / Access Layer / Data Warehouse
* **"Core"**
	* Business Logic

### Core / Access Layer / Data Warehouse → Data Mart
* **"Data Mart"**
	* Subset of a Data Warehouse
	* Dimensional Model
	* Can be Further Aggregated.
	* Usability + Acceptance
	* Performance
* Can Vary depending on Each Tool, Each Department, Each Region, Each Usecase

# In-memory Databases

### Traditional Databases

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-03/traditional-databases.webp)

### In-memory Databases

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-03/in-memory-databases.webp)

-   Highly Optimized for Query Performance
-   Good for Analytics & High Query Volume
-   Usually Used for Data Marts
-   Relational & Non-relational
-   Techniques: Columnar Storage, Parallel Query Plans, and Others

# Demo: Setting up the Staging Area with PostgreSQL

![]({{ site.baseurl }}/assets/2023-12-06-data-warehouse-03/pgadmin4.webp)
-   Created a  **database**  named  `DataWarehouseX`.
-   Created a  **schema**  named  `Staging`.

---

## *Published by* Joshua Kim
![Joshua Kim]({{ site.baseurl }}/assets/profile/joshua-profile.png)