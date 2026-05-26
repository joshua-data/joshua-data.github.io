---
title: "Why Event Taxonomy Matters: Lessons from Real-world Practice"
lang: en
tags:
  - data-modeling
  - analytics-engineering
  - data-governance-platform
---

# Table of Contents
1. Event taxonomy
2. The difficulty of managing a taxonomy
3. A real example of taxonomy management
    - 3.1. Events
    - 3.2. User properties
4. Feedback I've received
    - 4.1. "There are edge cases where collection isn't possible."
    - 4.2. "Some event names are ambiguous."
    - 4.3. "Your event definitions mix the developer and the planner perspectives."
    - 4.4. "I want event names to stay consistent across the DB, the dashboards, and the PA tool."
5. Closing thoughts

---

# 1. Event taxonomy

An event taxonomy is **a structured system of events and properties used to record and analyze user behavior**. Calling it the foundation of data analysis is not an exaggeration — how you build the taxonomy directly drives the accuracy, integrity, and ultimate usefulness of your data. That makes taxonomy management an extremely important responsibility for a data team. A Principal Product Manager at [Amplitude](https://amplitude.com/blog/event-taxonomy) put it this way:

> "Behind every great user behavior analysis is a great event taxonomy. It is the set of events and properties that define what users do within the product, and because the taxonomy is the foundation for all future analysis, it's critical to get it right. Working with thousands of customers, what we've learned is that designing and maintaining a clean, consistent taxonomy is one of the hardest steps to successfully using a product analytics tool."

Responsibilities vary by company, but data analysts and analytics engineers usually own event taxonomy management.

![]({{ site.baseurl }}/assets/2024-10-13-why-event-taxonomy-matters-lessons-from-real-world-practice/1.webp)

> [What is Analytics Engineering](https://www.getdbt.com/what-is-analytics-engineering) (dbt)

---

# 2. The difficulty of managing a taxonomy

![]({{ site.baseurl }}/assets/2024-10-13-why-event-taxonomy-matters-lessons-from-real-world-practice/2.webp)

At my company, I'm the one leading taxonomy management, and we use it to collect a wide range of user events and properties effectively. Anyone who has actually done this work knows that **taxonomy management is hard in several distinct ways:**

- You need to accurately understand the product's intent and goals, then reinterpret them from a data perspective to define events and properties.
- You need to walk through the actual product flow in detail using specs and wireframes.
- You need to confirm whether each event can be instrumented from a development perspective, and you need to know every edge case where collection might fail.

For this work to go smoothly, **the ability to evenly understand the different perspectives and ways of thinking inside a product organization** is essential. You need to enable the planning, design, and marketing teams to use the data easily, while at the same time communicating clearly enough with the frontend and backend engineers that they understand exactly when each event should fire.

---

# 3. A real example of taxonomy management

Through a lot of trial and error and feedback, I've gradually improved our taxonomy document. I also share the taxonomy document link in our Slack channel and on Redash dashboards so that colleagues can easily look it up.

![]({{ site.baseurl }}/assets/2024-10-13-why-event-taxonomy-matters-lessons-from-real-world-practice/3.png)

![]({{ site.baseurl }}/assets/2024-10-13-why-event-taxonomy-matters-lessons-from-real-world-practice/4.png)

I split the event definition document above into two sheets to manage it: an **Event sheet** and a **User Property sheet**.

![]({{ site.baseurl }}/assets/2024-10-13-why-event-taxonomy-matters-lessons-from-real-world-practice/5.webp)

### 3.1. Events

Events are written with the following structure.

**(1) Service**: The service the event is collected on. We operate multiple services, so this column lets us separate events service by service.

**(2) Category**: The category of the event or property. This makes it easier to understand the event's context at a glance.

**(3) Status**: The current state of event collection. (Active, Inactive, In development, …)

**(4) Reference**: A source document backing the event or property definition. (Google Tag Manager, a Notion page link, etc.)

**(5) Environment**: For hybrid apps, this distinguishes between native app and webview.

**(6) Event Description (Clients Perspective)**: A definition written from the user's perspective so that planners, designers, and marketers can understand it.

**(7) Event Description (SWEs Perspective)**: A definition written from a developer's perspective so engineers can pin down exactly when the event should trigger.

**(8) Event Name**: Named by putting the category as a prefix and a verb for the rest. (e.g., `category1_start`, `category2_complete`)

**(9) Parameter Name**: The name of the parameter collected with the event.

**(10) Parameter Description**: A definition of the parameter.

**(11) Parameter Value**: An example of the parameter's value.

![]({{ site.baseurl }}/assets/2024-10-13-why-event-taxonomy-matters-lessons-from-real-world-practice/6.png)

### 3.2. User properties

User properties are defined as follows.

**(1) Property Description (Clients Perspective)**: A description planners, designers, and marketers can understand.

**(2) Property Description (SWEs Perspective)**: A description written from a developer's perspective so engineers understand the collection structure.

**(3) User Property Name**: The name of the property.

**(4) User Property Value**: An example of the property's value.

![]({{ site.baseurl }}/assets/2024-10-13-why-event-taxonomy-matters-lessons-from-real-world-practice/7.png)

---

# 4. Feedback I've received

I've gotten valuable feedback from colleagues on taxonomy management over the years. Here are a few pieces of feedback that I found especially useful.

### 4.1. "There are edge cases where collection isn't possible."

![]({{ site.baseurl }}/assets/2024-10-13-why-event-taxonomy-matters-lessons-from-real-world-practice/8.png)

This came from a lead engineer at our company. For certain user properties, collection simply isn't possible at the moment a user first visits — which, when I looked at it, was just unavoidable. The property only becomes visible on a return visit, so the edge case needed to be considered and either **explained clearly so data consumers can interpret it correctly, or handled in the query with explicit NULL handling**. (Something like the query below.)

```sql
SELECT
  date,
  CASE
    WHEN user_property_a IS NULL AND date = user_first_date THEN 'Not Recognized Yet'
    ELSE user_property_a
  END AS user_property_a,
  COUNT(DISTINCT user_id) AS users_cnt
FROM
  fct_events
GROUP BY
  1, 2
ORDER BY
  1, 2
```

### 4.2. "Some event names are ambiguous."

I was using `{category}_verb` as the event naming convention, and the feedback was that I needed to use more precise verbs. For example, splitting "Enter" into "Type", "Select", "Click", etc. captures the user's context better and is good for data literacy.

In other words, "the act of entering or selecting" can be broken down like this:

- **Type**: the user types text on a keyboard.
- **Select**: the user picks an item from a dropdown menu or a list.
- **Click**: the user taps a UI element like a button, checkbox, radio button, or link.

Even though the underlying actions are this varied, lumping them all under the broad "Enter" verb makes it harder to accommodate the many events that should be distinguishable.

### 4.3. "Your event definitions mix the developer and the planner perspectives."

The truth is, data analysts and analytics engineers carry the developer, UX, and marketing perspectives in their heads all at once by the very nature of the role. **Solving business logic and product growth problems through programming, statistics, and machine learning** is the essence of the position.

That means **expressions that mix the developer and the planner perspectives slip in without us noticing**, and to a colleague in a specific role, those expressions can feel hard to parse. Based on this feedback, I started writing event definitions split into a user-facing perspective and a developer-facing perspective.

- For event collection, define the trigger point clearly from the developer's perspective.
- For event usage, define the user behavior clearly from the planner's perspective.

### 4.4. "I want event names to stay consistent across the DB, the dashboards, and the PA tool."

I used to translate event names into more readable terms when displaying them on BI dashboards, but the feedback was that **expressing the naming as defined in the event taxonomy, consistently**, was actually what we needed.

For example, suppose we have an event like the following:

- `add_to_cart` (the event triggered when the "Add to cart" button is clicked)

I used to worry that showing `add_to_cart` raw on a BI dashboard would hurt data literacy, so I'd translate it to something like "**Add to cart**" in plain language.

But it turned out that this translation step can hurt data literacy from a data consumer's perspective in the opposite way. It raises questions like:

> "Does 'Add to cart' mean the `add_to_cart` event specifically? Or does it cover a broader scope than that?"

In other words, **the right approach is to invest in the taxonomy document's quality so it becomes the central pillar of data literacy, and then mirror those exact terms on BI dashboards and in the PA tool**. That prevents confusion and improves consistency of understanding. I concluded this and now have a plan in motion to broadly rewrite our BI dashboards to use event taxonomy terms.

---

# 5. Closing thoughts

![]({{ site.baseurl }}/assets/2024-10-13-why-event-taxonomy-matters-lessons-from-real-world-practice/10.webp)

My core R&R is analytics engineering — data pipelining, data warehouse management, BI dashboard building, and event taxonomy management. In short, **my philosophy is to build an environment that maximizes how usefully data is used internally**. Going back to the point that managing the taxonomy well is the foundation of maximizing data utility, doing this work doggedly matters a lot to me.

To be honest, taxonomy management is fairly dry work. You have to attend to a lot of surface area, and a surprising number of things don't resolve as cleanly as you'd hope — it can be frustrating. But I keep at it by reminding myself: "**How this work is done can change how the organization actually uses data.**"

As someone whose role is to serve data, the most rewarding part is watching the organization use data to solve problems or to set direction more clearly. I'll keep managing the taxonomy that underpins all of this, so that colleagues can hit great outcomes and the company can keep growing in the right direction.

---
