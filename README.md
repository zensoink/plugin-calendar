# Zenso Calendar

A read-only calendar plugin for Zenso e-ink displays, synced from **Google Calendar** or **Apple iCloud** via standard ICS feeds.

## Features

- Four layouts, set per plugin instance (`view` config):
  - `list` (default): agenda — today + next N days (default 14), grouped by day
  - `month` / `week` / `day`: grid views rendered client-side with FullCalendar
- All-day and timed events, with location when available
- Server-side data fetching via the universal `data_sources` contract
- English UI, e-ink-friendly high-contrast styling

## How it works

1. The plugin declares a `data_sources` entry in `manifest.json`. It tells the Zenso backend: *fetch these ICS feeds from the user's config and inject the parsed events into the template context as `calendar`*.
2. The backend fetches and parses the ICS feeds server-side (expands recurring events, converts times to the user's timezone, formats labels) and passes `calendar.events` into the Liquid template.
3. `src/index.liquid` renders the agenda (`view: list`), or emits an inline data blob + the bundled `calendar.js` for grid views (`month` / `week` / `day`).

> **Note:** the backend data-source engine is a separate piece of work. Until it ships, the plugin renders the mock data from `dev/mock/zenso.mock.json`. Grid views also require the backend `script` capability (see `TODO/`).

## Configuration

Plugin instance config (`configJson`):

| Field            | Type       | Description                                                       | Default    |
| ---------------- | ---------- | ----------------------------------------------------------------- | ---------- |
| `calendar_feeds` | `string[]` | ICS feed URLs (Google secret iCal, Apple iCloud public calendar)  | —          |
| `days_ahead`     | `number`   | How many days ahead to show events (1–60)                         | `14`       |
| `view`           | `string`   | Layout: `list`, `month`, `week`, or `day`                         | `list`     |

### Getting an ICS feed URL

**Google Calendar**

1. Calendar → open the calendar's settings (⋮ → Settings and sharing).
2. Under **Integrate calendar** → copy the **Secret address in iCal format** URL.
3. Paste it into `calendar_feeds`.

**Apple iCloud**

1. On iCloud.com (or the Calendar app): Calendar → click the calendar name → **Share** → enable **Public Calendar**.
2. Copy the public calendar URL (`.ics`), e.g. `https://pXX-caldav.icloud.com/published/...`.
3. Paste it into `calendar_feeds`.

## Development

```bash
npm install
npm run dev            # dev server with mock data
npm run build          # production build in dist/
npm run mock:refresh   # fetch real ICS feeds into the mock (set CALENDAR_ICS_URLS in .env)
```

Mock calendar data lives in `dev/mock/zenso.mock.json` — it mirrors the exact shape the backend data source returns, so the template is identical in dev and production.

The mock's `config.view` (`list` / `month` / `week` / `day`) chooses the layout `npm run dev` renders. It defaults to `month` so FullCalendar is visible out of the box; flip it to `list` to test the agenda. `npm run mock:refresh` keeps `config` intact, so the chosen view survives refreshes.

## Project Structure

```
├── src/                 # Liquid templates + client-side entry
│   ├── index.liquid     # Entry point (header + list/grid layout)
│   ├── main.js          # FullCalendar init for grid views (bundled to calendar.js)
│   └── components/calendar.liquid
├── dev/mock/            # Mock data for local development
├── src/main.css         # Entry CSS (bundles styles/ into one file)
├── styles/              # Theme CSS (typography, calendar, grid overrides)
├── scripts/             # Dev tooling (refresh-mock)
├── manifest.json        # Plugin config (config_schema, data_sources)
└── TODO/                # Deferred work, not forgotten
```

## License

MIT
