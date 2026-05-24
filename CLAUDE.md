# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Build & Serve

```bash
bundle install              # one-time
bundle exec jekyll serve    # local dev server (http://localhost:4000)
bundle exec jekyll build    # production build → _site/
```

GitHub Pages auto-deploys on push to `main`.

## Architecture (data-driven)

Jekyll site originally bootstrapped from the Kiko Now theme, now refactored so
every editable string lives in `_data/` and templates simply iterate over it.

### Directory layout
```
_config.yml          # build/runtime settings only (plugins, defaults, sass)
_data/
  profile.yml        # identity, social links, email, GA — single source of truth
  ui.yml             # nav menu, section titles, footer labels
  home.yml           # home page About cards + Testimonials
  taxonomy.yml       # blog category slug ↔ display name
  medium_articles.yml # external Medium articles surfaced on /tags
_layouts/            # default.html, home.html, page.html, post.html
_includes/           # head, nav, footer, social-link (component), icon-*, mermaid, meta, fonts
_sass/
  _components/       # buttons, cards, badges, cta, testimonials
  _layout/           # header, footer, sections, grid
  _pages/            # home, blog, post (only page-specific styles)
_posts/              # YYYY-MM-DD-slug[-lang].md
tags/index.html      # blog index with language / source / category filters
assets/{post-slug}/  # post images, colocated by date+slug
```

### Styling
`style.scss` imports SCSS partials in this order:
1. Base — `_reset`, `_open-color`, `_variables`, `_custom-properties`, `_typography`, `_animations`
2. Components — `_components/*` (reusable primitives)
3. Layout — `_layout/*` (page scaffolding)
4. Pages — `_pages/*` (only styles unique to one page)
5. Highlights — `_highlights.scss` (code syntax, appended at bottom of style.scss)

Design tokens use a 3-tier system: SCSS vars (`_variables.scss`) → CSS custom
properties (`_custom-properties.scss`, with light/dark mode) → templates
reference `var(--…)`.

## Where to edit what

| You want to change… | Edit this file |
| --- | --- |
| Your name, role, tagline, hero quote | `_data/profile.yml` |
| Social link URL (GitHub / LinkedIn / Medium / RSS) | `_data/profile.yml` → `social.<platform>.url` |
| Email address | `_data/profile.yml` → `email` |
| Google Analytics ID | `_data/profile.yml` → `google_analytics_id` |
| Nav menu items | `_data/ui.yml` → `nav` |
| Home page section titles ("About Me", "What Colleagues Say") | `_data/ui.yml` → `home` |
| Footer headings, copyright text | `_data/ui.yml` → `footer` |
| Home "About" cards (titles, bullets, notes) | `_data/home.yml` → `about_cards` |
| Testimonials | `_data/home.yml` → `testimonials` |
| Add / rename / remove a blog category | `_data/taxonomy.yml` |
| Add a Medium article | `_data/medium_articles.yml` (prepend an entry) |
| Add / remove a social platform | `_data/profile.yml` + add `_includes/icon-<platform>.html` SVG |

To temporarily hide a social link without deleting its URL, set `enabled: false`
under that platform in `profile.yml`.

## Writing a blog post

Filename: `_posts/YYYY-MM-DD-slug[-lang].md` where `lang` is `en` or `ko`.
Bilingual posts use both `-en.md` and `-ko.md` with the same slug.

Front-matter — minimum required:
```yaml
---
title: "Your post title"
lang: en               # or "ko"
tags:                  # use slugs from _data/taxonomy.yml
  - analytics-engineering
  - data-modeling
---
```

You do NOT need `layout: post` — `_config.yml` defaults apply it automatically.

If the post uses Mermaid diagrams, add `mermaid: true` to the front-matter.