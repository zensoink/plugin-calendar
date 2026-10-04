# Zenso Calendar

A read-only calendar plugin for Zenso e-ink displays (800×480), synced from
**Google Calendar** or **Apple iCloud** via standard ICS feeds.

## Features

- Layouts, set per plugin instance (`view` config):
  - `list`: FullCalendar list view
  - `month` / `week` / `day`: FullCalendar grid views
- All-day and timed events, with location when available
- Server-side data fetching via the universal `data_sources` contract
- Multi-language & locale support (adapts to user's Zenso profile language/locale), e-ink-friendly high-contrast styling (black grid lines)
- JS rendering via the `script` capability (bundled `assets/main.js`, no remote scripts)

## Configuration

Plugin instance config (`configJson`, see `config_schema` in `zenso.config.json`):

| Field            | Type               | Description                                                                                   | Default |
| ---------------- | ------------------ | --------------------------------------------------------------------------------------------- | ------- |
| `calendar_feeds` | `{ url, color }[]` | ICS feeds. Each entry is `{ url: string, color: string }` (Google/Apple don't share color, so pick one per feed) | — |
| `days_ahead`     | `number`           | How many days ahead to show events (1–60)                                                     | `14`    |
| `view`           | `string`           | Layout: `list`, `month`, `week`, or `day`                                                     | `list`  |
| `time_format`    | `string`           | Hour format: `24h` or `12h`                                                                   | `24h`   |

## Adding your calendars

The plugin is read-only: it subscribes to your existing calendars over the
standard ICS (iCalendar) feed format. For each calendar you want on the
display, grab its feed URL below and add it as a `calendar_feeds` entry
(`{ url, color }`) in the plugin instance settings. Google and Apple feeds
carry no color of their own, so pick one per feed. Repeat for every calendar.

### Google Calendar

1. On a computer, open [calendar.google.com](https://calendar.google.com).
2. In the left sidebar, hover the calendar → click `⋮` → **Settings and sharing**
   (alternatively: gear icon → Settings → *Settings for my calendars* → pick the calendar).
3. Scroll to **Integrate calendar** → copy the **Secret address in iCal format**
   (use the Secret address, not the Public one).
4. Paste it as a feed `url` and pick a `color`.

> Treat the Secret address like a password: anyone holding it can read that
> calendar. You can invalidate it anytime via **Reset** on the same settings
> page. Google Workspace users may not see the address if the admin blocked
> external sharing — ask the admin in that case.

### Apple iCloud

1. Go to [icloud.com/calendar](https://www.icloud.com/calendar) and sign in
   (same toggle also exists in the macOS Calendar sidebar share icon, and on
   iPhone under Calendars → `ⓘ` → Public Calendar).
2. Hover the calendar in the sidebar → click the share icon → turn on
   **Public Calendar** → **Copy** the link.
3. Apple hands out a `webcal://…` link — **change the scheme to `https://`**
   (e.g. `https://pXX-caldav.icloud.com/published/...`), because the backend
   fetches the feed over plain HTTPS.
4. Paste it as a feed `url` and pick a `color`.

> The public link is read-only and exposes full event details (titles, notes,
> locations) to anyone holding it. It stays live until you switch Public
> Calendar off, which kills the link. iCloud edits can lag several to ~15+
> minutes behind before they appear in the feed.


## License

MIT
