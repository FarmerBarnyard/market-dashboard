# market-dashboard

Public rendering target for the weekly NASDAQ/ASX market pipeline. Published via GitHub Pages at **https://dashboard.barnyard.site/**.

## What lives here

- `index.html` - the current week's dashboard. Regenerated every Monday.
- `archive/<YYYY-MM-DD>.html` - a permanent copy of each week's dashboard, so past weeks stay accessible.
- `template.html` - the fixed page layout, CSS, and section-marker structure that every weekly `index.html` must follow. Read this file's header comment before editing the layout by hand; the automated agent that regenerates `index.html` each week is instructed to follow it exactly rather than redesign the page.

## Where the data comes from

This repo only ever receives rendered output — it does not run any web searches or analysis itself. The actual data pipeline lives in a separate **private** repo (`ClaudeRepo`) run by three chained Claude Code agents (market review -> Morningstar cross-reference -> watchlist builder). The third agent reads that private repo's data and writes the rendered page here. See that repo's `agents/agents.md` for the full pipeline description (not public, since that repo is private).

## Why a separate repo

The source data repo is private. GitHub Pages requires either a public repo or a paid plan to serve a site, so this repo exists purely to hold public-safe rendered output, keeping the private repo's raw data and full history out of public view.

## Not investment advice

Every page here carries this notice, but to be explicit: this is a factual summary of market data and third-party (Morningstar) published ratings, cross-checked where possible. Nothing here is personalized investment advice or a recommendation to buy, sell, or hold anything.
