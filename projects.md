---
layout: projects
title: Projects
subtitle: AI-powered tools, data infrastructure, and analytics solutions
permalink: /projects/
---

<section class="proj-section">

<h2>Featured Projects</h2>

<div class="proj-grid proj-grid--featured">

<div class="proj-card proj-card--featured">
<div class="proj-card__badge">AI / LLM</div>
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--ai">
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2"></path><circle cx="7.5" cy="14.5" r="1.5"></circle><circle cx="16.5" cy="14.5" r="1.5"></circle></svg>
</div>
<h3 class="proj-card__title">DAHAE</h3>
<p class="proj-card__tagline">Internal NL2SQL Slack Bot</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">An AI-powered Slack bot that translates natural language questions into SQL queries, enabling non-technical team members to access data insights instantly without writing code.</p>
<div class="proj-card__features">
<h4>Key Features</h4>
<ul>
<li>Natural language to SQL conversion using Claude API</li>
<li>Integration with DataHub for metadata context</li>
<li>BigQuery query execution and result formatting</li>
<li>Conversational follow-up questions</li>
<li>Query explanation and optimization suggestions</li>
</ul>
</div>
<div class="proj-card__impact">
<div class="proj-card__impact-item">
<span class="proj-card__impact-value">80%</span>
<span class="proj-card__impact-label">Reduction in ad-hoc data requests</span>
</div>
<div class="proj-card__impact-item">
<span class="proj-card__impact-value">50+</span>
<span class="proj-card__impact-label">Active users across teams</span>
</div>
</div>
</div>
<div class="proj-card__footer">
<div class="proj-card__tech">
<span>Claude API</span>
<span>Python</span>
<span>Slack API</span>
<span>DataHub</span>
<span>BigQuery</span>
</div>
<a href="https://joshua-data.medium.com/nl2sql-slack-ai-agent-development-journey-en-d96adbd059f8" class="proj-card__link" target="_blank" rel="noopener">Read Case Study →</a>
</div>
</div>

<div class="proj-card proj-card--featured">
<div class="proj-card__badge">Side Project</div>
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--location">
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
</div>
<h3 class="proj-card__title">FINDY</h3>
<p class="proj-card__tagline">AI-Powered Location Discovery</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">A conversational AI service that helps users discover places and locations based on natural language descriptions. Built as a side project to explore LLM capabilities in location-based services.</p>
<div class="proj-card__features">
<h4>Key Features</h4>
<ul>
<li>Natural language place search ("cozy cafe with outdoor seating")</li>
<li>Context-aware recommendations based on preferences</li>
<li>Integration with location APIs for real-time data</li>
<li>Multi-turn conversation for refining searches</li>
</ul>
</div>
</div>
<div class="proj-card__footer">
<div class="proj-card__tech">
<span>Gemini API</span>
<span>Python</span>
<span>Cloud Run</span>
<span>React</span>
</div>
<a href="https://joshua-data.medium.com/findy-001-59bf3186f928" class="proj-card__link" target="_blank" rel="noopener">Read Case Study →</a>
</div>
</div>

</div>

</section>

<section class="proj-section">

<h2>Data Infrastructure</h2>

<div class="proj-grid">

<div class="proj-card">
<div class="proj-card__badge">Analytics Engineering</div>
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--data">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
</div>
<h3 class="proj-card__title">Core Layer Architecture</h3>
<p class="proj-card__tagline">@ Wrtn Technologies</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">Designed and implemented a new Core Layer in the data warehouse hierarchy, standardizing metric definitions and ensuring consistency across three major products.</p>
<div class="proj-card__highlight">
<strong>Problem:</strong> Metric inconsistencies from ad-hoc staging queries<br>
<strong>Solution:</strong> Standardized DW hierarchy with Core Layer
</div>
</div>
<div class="proj-card__footer">
<div class="proj-card__tech">
<span>dbt</span>
<span>BigQuery</span>
<span>DataHub</span>
</div>
<a href="https://joshua-data.medium.com/analytics-engineering-activated-users-table-b8bce9686b54" class="proj-card__link" target="_blank" rel="noopener">Read Case Study →</a>
</div>
</div>

<div class="proj-card">
<div class="proj-card__badge">Data Engineering</div>
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--pipeline">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
</div>
<h3 class="proj-card__title">PII Masking Pipeline</h3>
<p class="proj-card__tagline">@ Coinone</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">Built an automated PII masking infrastructure using GCP Sensitive Data Protection APIs, enabling secure data analysis while maintaining compliance.</p>
<div class="proj-card__highlight">
<strong>Problem:</strong> Restricted analysis due to PII exposure risks<br>
<strong>Solution:</strong> Terraform-coded BigQuery Remote Functions for automated masking
</div>
</div>
<div class="proj-card__footer">
<div class="proj-card__tech">
<span>Terraform</span>
<span>GCP SDP</span>
<span>BigQuery</span>
<span>Airflow</span>
</div>
<a href="https://joshua-data.medium.com/bigquery-dlp-remote-function-d6dad25df7c5" class="proj-card__link" target="_blank" rel="noopener">Read Case Study →</a>
</div>
</div>

<div class="proj-card">
<div class="proj-card__badge">Analytics Engineering</div>
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--data">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
</div>
<h3 class="proj-card__title">dbt Incremental Macros</h3>
<p class="proj-card__tagline">@ Wrtn Technologies</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">Developed standardized dbt incremental strategy macros ensuring idempotency and stable metric management, replacing legacy batch scripts.</p>
<div class="proj-card__highlight">
<strong>Problem:</strong> Non-idempotent batch backfills causing metric inconsistencies<br>
<strong>Solution:</strong> Robust incremental macros with idempotent design
</div>
</div>
<div class="proj-card__footer">
<div class="proj-card__tech">
<span>dbt</span>
<span>Jinja</span>
<span>BigQuery</span>
</div>
<a href="https://joshua-data.medium.com/analytics-engineering-integrated-interval-management-with-dbt-macro-bad5d260d9b4" class="proj-card__link" target="_blank" rel="noopener">Read Case Study →</a>
</div>
</div>

<div class="proj-card">
<div class="proj-card__badge">Data Engineering</div>
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--pipeline">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
</div>
<h3 class="proj-card__title">Airflow Environment</h3>
<p class="proj-card__tagline">@ IoTrust</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">Established the company's first Airflow environment from scratch, automating data pipelines and Slack notification bots for monitoring.</p>
<div class="proj-card__highlight">
<strong>Problem:</strong> Manual data workflows and no monitoring<br>
<strong>Solution:</strong> Airflow DAGs with Slack alerting
</div>
</div>
<div class="proj-card__footer">
<div class="proj-card__tech">
<span>Airflow</span>
<span>Python</span>
<span>Docker</span>
<span>Slack API</span>
</div>
<a href="https://joshua-data.github.io/implementing-airflow-en/" class="proj-card__link" target="_blank" rel="noopener">Read Article →</a>
</div>
</div>

</div>

</section>

<section class="proj-section">

<h2>Analytics & BI</h2>

<div class="proj-grid">

<div class="proj-card">
<div class="proj-card__badge">Data Mart</div>
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--chart">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
</div>
<h3 class="proj-card__title">First Activation Data Mart</h3>
<p class="proj-card__tagline">@ IoTrust</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">Built a comprehensive data mart tracking new user first activation metrics, enabling product teams to optimize onboarding funnels.</p>
</div>
<div class="proj-card__footer">
<div class="proj-card__tech">
<span>dbt</span>
<span>BigQuery</span>
<span>Lightdash</span>
</div>
<a href="https://joshua-data.github.io/first-activation-data-mart-en/" class="proj-card__link" target="_blank" rel="noopener">Read Article →</a>
</div>
</div>

<div class="proj-card">
<div class="proj-card__badge">BI</div>
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--chart">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
</div>
<h3 class="proj-card__title">Redash KPI Dashboards</h3>
<p class="proj-card__tagline">@ IoTrust</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">Reorganized fragmented ad-hoc dashboards into structured KPI dashboards, reducing data request concentration on analysts.</p>
</div>
<div class="proj-card__footer">
<div class="proj-card__tech">
<span>Redash</span>
<span>SQL</span>
<span>BigQuery</span>
</div>
<a href="https://joshua-data.github.io/redash-dashboard-en/" class="proj-card__link" target="_blank" rel="noopener">Read Article →</a>
</div>
</div>

<div class="proj-card">
<div class="proj-card__badge">Optimization</div>
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--optimize">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
</div>
<h3 class="proj-card__title">Conversion Rate Optimization</h3>
<p class="proj-card__tagline">@ IoTrust</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">Led A/B testing task force and funnel analysis that improved purchase conversion rate by 32%p through data-driven experimentation.</p>
<div class="proj-card__stat">
<span class="proj-card__stat-value">+32%p</span>
<span class="proj-card__stat-label">Conversion improvement</span>
</div>
</div>
<div class="proj-card__footer">
<div class="proj-card__tech">
<span>GA4</span>
<span>A/B Testing</span>
<span>BigQuery</span>
</div>
<a href="https://joshua-data.github.io/how-we-dramatically-improved-conversion-rates-en/" class="proj-card__link" target="_blank" rel="noopener">Read Article →</a>
</div>
</div>

<div class="proj-card">
<div class="proj-card__badge">Automation</div>
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--auto">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
</div>
<h3 class="proj-card__title">Marketing Settlement Automation</h3>
<p class="proj-card__tagline">@ Coinone</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">Automated marketing event settlement queries using BigQuery TVFs, eliminating redundant manual query creation and validation.</p>
</div>
<div class="proj-card__footer">
<div class="proj-card__tech">
<span>BigQuery TVF</span>
<span>SQL</span>
<span>Admin System</span>
</div>
<a href="https://joshua-data.medium.com/bigquery-tvf-1ab3ad792b68" class="proj-card__link" target="_blank" rel="noopener">Read Case Study →</a>
</div>
</div>

</div>

</section>

<section class="proj-section">

<h2>Community & Writing</h2>

<div class="proj-grid proj-grid--community">

<div class="proj-card proj-card--community">
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--community">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
</div>
<h3 class="proj-card__title"><a href="https://www.meetup.com/seoul-dbt-meetup" target="_blank">Seoul dbt Meetup</a></h3>
<p class="proj-card__tagline">Community Organizer</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">Hosting official in-person meetups as part of dbt Labs' global community, fostering a practical learning environment for dbt practitioners in Seoul.</p>
</div>
</div>

<div class="proj-card proj-card--community">
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--community">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
</div>
<h3 class="proj-card__title"><a href="https://www.linkedin.com/company/data-korea" target="_blank">Data Analysis Korea</a></h3>
<p class="proj-card__tagline">Community Founder</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">Founded and operate South Korea's data community with 1,800+ members. Organized 105 presentation sessions with 66 data professionals.</p>
<div class="proj-card__stat">
<span class="proj-card__stat-value">1,800+</span>
<span class="proj-card__stat-label">Members</span>
</div>
</div>
</div>

<div class="proj-card proj-card--community proj-card--speaker-featured">
<div class="proj-card__header">
<div class="proj-card__icon proj-card__icon--speaker">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
</div>
<h3 class="proj-card__title">Datayanolja Speaker</h3>
<p class="proj-card__tagline">2024 & 2025</p>
</div>
<div class="proj-card__body">
<p class="proj-card__desc">Presented technical talks on data modeling topics at Korea's premier data conference.</p>
<div class="proj-videos">
<div class="proj-video">
<div class="proj-video__wrapper">
<iframe src="https://www.youtube.com/embed/Hd_XWCDY3LA?cc_load_policy=1&cc_lang_pref=en" title="Datayanolja 2025 - How I Modeled Data Mart" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
<div class="proj-video__info">
<span class="proj-video__year">2025</span>
<span class="proj-video__title">How I Modeled Data Mart - New User Activation</span>
</div>
</div>
<div class="proj-video">
<div class="proj-video__wrapper">
<iframe src="https://www.youtube.com/embed/nvm9GjEqW3M?cc_load_policy=1&cc_lang_pref=en" title="Datayanolja 2024 - BigQuery Nested Columns via Cross Join" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
<div class="proj-video__info">
<span class="proj-video__year">2024</span>
<span class="proj-video__title">BigQuery Nested Columns via Cross Join</span>
</div>
</div>
</div>
</div>
</div>

</div>

</section>

<section class="proj-section">

<div class="page-cta">
<h2 class="page-cta__title">Want to see more?</h2>
<p class="page-cta__text">Check out my blog for detailed technical articles and case studies.</p>
<div class="page-cta__buttons">
<a href="https://joshua-data.medium.com/" class="page-cta__btn page-cta__btn--medium" target="_blank" rel="noopener">
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
Read on Medium
</a>
<a href="https://github.com/joshua-data" class="page-cta__btn page-cta__btn--github" target="_blank" rel="noopener">
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
View GitHub
</a>
</div>
</div>

</section>
