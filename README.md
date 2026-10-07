# market-dashboard

Public rendering target for the weekly NASDAQ/ASX market pipeline. Published via GitHub Pages at **https://stocks.barnyard.site/**.

Previously served at `dashboard.barnyard.site` until 2026-08-19, when that domain was reassigned to a new `barnyard-hub` repo acting as a landing page for this and future projects; this dashboard moved to `stocks.barnyard.site` as part of the same change.

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

## Shared shell and themes (2026-10-07)

The dashboard now sits inside the same app shell as the rest of barnyard.site: left sidebar, top bar, Settings panel with 18 themes (light/dark), backgrounds and density. The files `themes.js`, `shell.js`, `shell.css` and `fonts/` are hand-copied unchanged from the `barnyard-hub` repo (the source of truth); do not edit them here.

- `template.html` loads them from its `<head>`. Its own colour block is replaced by a few alias names that point at the shared theme tokens, so the pages follow the chosen theme, and the sparklines and trend chart read their colours from the theme and redraw when it changes. Section markers, the `<title>` and every `{{placeholder}}` are unchanged, so the generator needs no change.
- `shell.js` wraps the whole page body in the shell and works out which site it is on from the hostname.
- The generator reuses the template head for the index, ticker and new archive pages, so they pick up the new look on the next daily run. Archive pages already published keep the old look.
- No login control is shown in the sidebar here: `auth-gate.js` is not loaded on this origin.