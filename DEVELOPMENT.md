# Development

Notes for working on the Zenso Calendar plugin itself. End users: see
`README.md`.

## How it works

1. The plugin declares a `data_sources` entry in `zenso.config.json`. It tells the Zenso backend: *fetch these ICS feeds from the user's config and inject the parsed events into the template context as `data.calendar`*.
2. The backend fetches and parses the ICS feeds server-side (expands recurring events, converts times to the user's timezone, formats labels) and passes `data.calendar.events` (each with its feed `color`) into the template context.
3. `src/index.liquid` writes the context into the DOM (`data-*` attributes on `#calendar-grid` plus one `<span>` per event inside `<template id="calendar-data">`, titles via `| escape`); the bundled `assets/main.js` (FullCalendar) reads the dataset, renders into `#calendar-grid`, and sets `window.__ZENSO_READY__` after render. The backend screenshots the result.

## Commands

```bash
npm install
npm run dev            # dev server with mock data
npm run build          # production build: dist/ + plugin.zip
npm run mock:generate  # generate synthetic mock data (no network needed)
npm run mock:refresh   # fetch real ICS feeds into the mock (set CALENDAR_ICS_URLS in .env)
```

## Mock data

Mock data lives in `mock/` and mirrors the backend context: `mock/zenso.json`
(`user`/`device`/`system`, 800×480) plus `mock/plugin.json`
(`plugin`/`config`/`data.calendar` with per-event `color`), so the render is
identical in dev and production.

`mock/plugin.json` is git-ignored and bootstrapped automatically on the first
`npm run dev` (via `predev`, skipped when the file already exists, so local
edits are never clobbered).

`npm run mock:generate` writes synthetic events for the current month (no ICS credentials needed). `npm run mock:refresh` fetches real Google/Apple ICS feeds instead; both keep `config` intact, so the chosen `view` survives.

## Checking it works locally

```bash
CALENDAR_ICS_URLS="https://calendar.google.com/calendar/ical/you/private-xyz/basic.ics,https://pXX-caldav.icloud.com/published/..." \
CALENDAR_ICS_COLORS="#3b82f6,#ef4444" \
npm run mock:refresh   # fetch real feeds into mock/plugin.json
npm run dev              # render with your real events
```

`mock:refresh` reads the same URLs the backend will fetch in production, so if
events show up in dev, the plugin instance config is correct. Google caches
feeds too, so don't expect edits to appear instantly on either provider.

## Project structure

```
├── src/
│   ├── index.liquid     # Entry point (inject context; CSS/JS auto-injected)
│   ├── main.ts          # FullCalendar init (bundled to assets/main.js)
│   └── styles.css       # Theme CSS (typography + FullCalendar overrides, e-ink tuned)
├── mock/
│   ├── zenso.json       # Device/user/system fixture (800×480)
│   └── plugin.json      # Plugin/config/data.calendar fixture
├── scripts/             # Dev tooling (generate-mock, refresh-mock)
├── public/
│   ├── assets/logo.png  # Plugin thumbnail
│   └── favicon.ico      # Plugin-list icon (placeholder — replace with real icon)
├── zenso.config.json    # Plugin contract (id, capabilities, config_schema, data_sources)
├── vite.config.ts       # Just plugins: [zensoPlugin()]
└── dist/ + plugin.zip   # Build output (git-ignored); the ZIP is what gets installed
```

`manifest.json` is never edited by hand — it is generated at build from
`zenso.config.json` + `package.json`. Only `README.md` and `LICENSE` are packed
into the ZIP alongside the build output; this file stays out.
