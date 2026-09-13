# Zenso Calendar

A read-only calendar plugin for Zenso e-ink displays (800×480), synced from
**Google Calendar** or **Apple iCloud** via standard ICS feeds.

## Features

- Layouts, set per plugin instance (`view` config):
  - `list`: FullCalendar list view
  - `month` / `week` / `day`: FullCalendar grid views
- All-day and timed events, with location when available
- Server-side data fetching via the universal `data_sources` contract
- English UI, e-ink-friendly high-contrast styling (black grid lines)
- JS rendering via the `script` capability (bundled `assets/main.js`, no remote scripts)

## How it works

1. The plugin declares a `data_sources` entry in `zenso.config.json`. It tells the Zenso backend: *fetch these ICS feeds from the user's config and inject the parsed events into the template context as `data.calendar`*.
2. The backend fetches and parses the ICS feeds server-side (expands recurring events, converts times to the user's timezone, formats labels) and passes `data.calendar.events` (each with its feed `color`) into the template context.
3. `src/index.liquid` writes the context into the DOM (`data-*` attributes on `#calendar-grid` plus one `<span>` per event inside `<template id="calendar-data">`, titles via `| escape`); the bundled `assets/main.js` (FullCalendar) reads the dataset, renders into `#calendar-grid`, and sets `window.__ZENSO_READY__` after render. The backend screenshots the result.

## Configuration

Plugin instance config (`configJson`, see `config_schema` in `zenso.config.json`):

| Field            | Type               | Description                                                                                   | Default |
| ---------------- | ------------------ | --------------------------------------------------------------------------------------------- | ------- |
| `calendar_feeds` | `{ url, color }[]` | ICS feeds. Each entry is `{ url: string, color: string }` (Google/Apple don't share color, so pick one per feed) | — |
| `days_ahead`     | `number`           | How many days ahead to show events (1–60)                                                     | `14`    |
| `view`           | `string`           | Layout: `list`, `month`, `week`, or `day`                                                     | `list`  |
| `time_format`    | `string`           | Hour format: `24h` or `12h`                                                                   | `24h`   |

### Getting an ICS feed URL

**Google Calendar**

1. Calendar → open the calendar's settings (⋮ → Settings and sharing).
2. Under **Integrate calendar** → copy the **Secret address in iCal format** URL.
3. Add it as a feed: set `url` to that address and pick a `color`.

**Apple iCloud**

1. On iCloud.com (or the Calendar app): Calendar → click the calendar name → **Share** → enable **Public Calendar**.
2. Copy the public calendar URL (`.ics`), e.g. `https://pXX-caldav.icloud.com/published/...`.
3. Add it as a feed: set `url` to that address and pick a `color`.

> Apple iCloud public ICS feeds can lag several to ~15+ minutes behind edits.

## Development

```bash
npm install
npm run dev            # dev server with mock data
npm run build          # production build: dist/ + plugin.zip
npm run mock:generate  # generate synthetic mock data (no network needed)
npm run mock:refresh   # fetch real ICS feeds into the mock (set CALENDAR_ICS_URLS in .env)
```

Mock data lives in `mock/` and mirrors the backend context: `mock/zenso.json`
(`user`/`device`/`system`, 800×480) plus `mock/plugin.json`
(`plugin`/`config`/`data.calendar` with per-event `color`), so the render is
identical in dev and production.

`mock/plugin.json` is git-ignored and bootstrapped automatically on the first
`npm run dev` (via `predev`, skipped when the file already exists, so local
edits are never clobbered).

`npm run mock:generate` writes synthetic events for the current month (no ICS credentials needed). `npm run mock:refresh` fetches real Google/Apple ICS feeds instead; both keep `config` intact, so the chosen `view` survives.

## Project Structure

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
`zenso.config.json` + `package.json`.

## License

MIT
