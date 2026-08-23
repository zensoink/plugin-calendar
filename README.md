# Zenso Calendar

A read-only calendar plugin for Zenso e-ink displays, synced from **Google Calendar** or **Apple iCloud** via standard ICS feeds.

## Features

- Layouts, set per plugin instance (`view` config):
  - `list`: FullCalendar list view
  - `month` / `week` / `day`: FullCalendar grid views
- All-day and timed events, with location when available
- Server-side data fetching via the universal `data_sources` contract
- English UI, e-ink-friendly high-contrast styling
- JS rendering via the `script` capability (bundled `calendar.js`, no remote scripts)

## How it works

1. The plugin declares a `data_sources` entry in `manifest.json`. It tells the Zenso backend: *fetch these ICS feeds from the user's config and inject the parsed events into the template context as `calendar`*.
2. The backend fetches and parses the ICS feeds server-side (expands recurring events, converts times to the user's timezone, formats labels) and passes `calendar.events` (each with its feed `color`) into the template context.
3. `src/index.liquid` injects the context as `window.__ZENSO_DATA__`, loads the bundled `calendar.js` (FullCalendar), and sets `window.__ZENSO_READY__` after render. The backend screenshots the result.

> **Note:** the backend data-source engine is a separate piece of work, as is the `script` capability (headless-browser render). Until they ship, the plugin renders the mock data from `dev/mock/zenso.mock.json`.

## Configuration

Plugin instance config (`configJson`):

| Field            | Type       | Description                                                       | Default    |
| ---------------- | ---------- | ----------------------------------------------------------------- | ---------- |
| `calendar_feeds` | `{ url, color }[]` | ICS feeds. Each entry is `{ url: string, color: string }` (Google/Apple don't share color, so pick one per feed)  | —          |
| `days_ahead`     | `number`   | How many days ahead to show events (1–60)                         | `14`       |
| `view`           | `string`   | Layout: `list`, `month`, `week`, or `day`                         | `list`     |

### Getting an ICS feed URL

**Google Calendar**

1. Calendar → open the calendar's settings (⋮ → Settings and sharing).
2. Under **Integrate calendar** → copy the **Secret address in iCal format** URL.
3. Add it as a feed: set `url` to that address and pick a `color`.

**Apple iCloud**

1. On iCloud.com (or the Calendar app): Calendar → click the calendar name → **Share** → enable **Public Calendar**.
2. Copy the public calendar URL (`.ics`), e.g. `https://pXX-caldav.icloud.com/published/...`.
3. Add it as a feed: set `url` to that address and pick a `color`.

## Development

```bash
npm install
npm run dev            # dev server with mock data
npm run build          # production build in dist/
npm run mock:generate  # generate synthetic mock data (no network needed)
npm run mock:refresh   # fetch real ICS feeds into the mock (set CALENDAR_ICS_URLS in .env)
```

Mock calendar data lives in `dev/mock/zenso.mock.json` — it mirrors the exact shape the backend data source returns (`calendar.events` with per-event `color`), so the render is identical in dev and production.

`npm run mock:generate` writes synthetic events for the current month (no ICS credentials needed). `npm run mock:refresh` fetches real Google/Apple ICS feeds instead; both keep `config` intact, so the chosen `view` survives.

## Project Structure

```
├── src/
│   ├── index.liquid     # Entry point (inject context + load calendar.js)
│   ├── main.js          # FullCalendar init (bundled to calendar.js)
│   └── main.css         # Entry CSS (bundles styles/ into one file)
├── dev/
│   ├── mock/            # Mock data (zenso.mock.json) for local development
│   ├── pages/           # Vituum dev page entry
│   └── scripts/         # Dev tooling (generate-mock, refresh-mock)
├── styles/              # Theme CSS (typography, calendar, FullCalendar overrides)
├── vite.calendar.config.js  # Bundles src/main.js -> dist/calendar.js
├── manifest.json        # Plugin config (config_schema, data_sources, capabilities)
└── TODO/                # Deferred work, not forgotten
```

## License

MIT
