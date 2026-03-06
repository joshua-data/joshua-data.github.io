# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based personal blog for Analytics Engineering content, hosted on GitHub Pages at joshua-data.github.io. The blog features technical articles on data analysis, SQL, Python, A/B testing, and data engineering in both English and Korean.

## Common Commands

```bash
# Install dependencies
bundle install

# Run local development server
bundle exec jekyll serve

# Build the site (outputs to _site/)
bundle exec jekyll build
```

## Architecture

### Layout Hierarchy
- `_layouts/default.html` - Base template wrapping all pages (includes nav, footer, analytics)
- `_layouts/post.html` - Article template extending default (adds title, date, tags, pagination, Disqus, Mermaid)
- `_layouts/page.html` - Static page template

### Content Flow
1. `index.html` - Homepage with paginated post list (5 per page via jekyll-paginate)
2. Posts in `_posts/` are rendered through `post.html` layout
3. All layouts inject content into `default.html`'s `{{ content }}` block

### Key Includes
- `_includes/head.html` - Meta tags, GA4 tracking, stylesheets
- `_includes/nav.html` - Header navigation
- `_includes/mermaid.html` - Diagram support for posts

## Blog Post Conventions

### File Naming
Posts follow the pattern: `YYYY-MM-DD-slug.md`

Example: `2023-04-30-ab-test-review-en.md`

### Front Matter Structure
```yaml
---
layout: post
title: "Post Title"
tags:
  - Language (English)      # or Language (Korean)
  - Article (Project)       # Article type
  - Level (2. Intermediate) # Difficulty level
  - Field (Data Analysis)   # Subject area
  - Skills (Python)         # Technologies used
  - Skills (SQL)
---
```

### Assets
Post images go in `assets/YYYY-MM-DD-post-slug/` and are referenced as:
```markdown
![]({{ site.baseurl }}/assets/2023-04-30-ab-test-review/image.png)
```

## Configuration

- `_config.yml` - Site metadata, navigation, plugins, permalink structure
- Plugins: jekyll-sitemap, jekyll-feed, jekyll-paginate
- Markdown: Kramdown with GFM and Rouge syntax highlighting
