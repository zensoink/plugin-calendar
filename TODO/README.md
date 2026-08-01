# TODO

Deferred work — both sides of the plugin (this repo) and the backend (`~/Projects/zenso-api`). Kept here so nothing is forgotten. Items are tagged **[frontend]**, **[backend]**, or **[both]**.

## MVP / deferred

### 1. Backend data-source engine (the universal `data_sources`) — [backend]
The whole MVP contract depends on it. Implemented via the prompt prepared for the backend (see the commit / backend session). Until it lands, the plugin renders mock data from `dev/mock/zenso.mock.json`.
- Contract in `manifest.json`: `data_sources` → `{ id, type: "ics", config: { urls_field, days_ahead_field }, refresh_ttl }`.
- Backend injects `calendar` into the Liquid context; shape = `{ today, today_label, now_label, days_ahead, fetched_at, sources, events: [{ title, location, all_day, day_label, start, end, time_label, end_time_label }] }`.

### 2. Script capability (JS rendering for charts) — [both] stage 2
Allow plugins to use JS **for render-time computation only** (charts/layouts), never interactivity (output is a static image).
- **[frontend]** DONE: vite bundles `src/main.js` → `calendar.js` (IIFE, ~220 kB) in the ZIP; `index.liquid` emits an inline `window.__ZENSO_DATA__` blob + `<script src="calendar.js">` for grid views.
- **[backend]** `capabilities: ["script"]` in manifest; `plugin-validator.service.ts` allows `.js` only when the flag is set (with ~2 MB bundle size cap, no remote `<script>`, no `eval`); `browser.service.ts` blocks all network in the render page via `requestInterception` (only `file://` from the plugin's asset dir) and waits for `window.__ZENSO_READY__` (poll every 100 ms, 5 s timeout) instead of relying on `networkidle0`; plugin data passed as inline `window.__ZENSO_DATA__` (escape `</script>` in JSON values).

### 3. Render-cache freshness — [backend]
`render-orchestrator.service.ts` hashes config + runtimeData into the render cache key, but not the *content* of fetched data source results — a screen can stay stale until the data-source TTL (`refresh_ttl`) expires. Consider including a data content hash / `fetched_at` in the cache key.

### 4. Validate `configJson` against `config_schema` — [backend]
Today `config_schema` is `Record<string, unknown>` and is not validated anywhere; a plugin instance can hold garbage config. Add zod validation of instance `configJson` against the plugin's `config_schema`.

### 5. Configurable locale — [backend]
Backend formats `today_label` / `now_label` with locale `en` hard-coded. Add an optional `locale_field` in the source config so plugins can choose the language.

### 6. `?forcefetch=true` (Google) option — [backend]
Google secret ICS refreshes faster with `?forcefetch=true`. Add an optional per-source flag; keep it off by default.

### 7. Dedupe events across multiple feeds — [backend]
The same event (e.g. a shared calendar) can appear from two feeds. Dedupe by UID+start in the ICS handler.

### 8. Per-user rate limiting — [backend]
`refresh_ttl` is a global throttle. Add per-user fetch quotas so one user's plugin config can't hammer third-party feeds.

### 9. Grid views data scope — [both]
FullCalendar `month`/`week` views render a fixed window around `today`; events outside it simply don't show. Decide whether the ICS handler should fetch more than `days_ahead` (e.g. the full current month) so month view isn't sparse, or accept the current range.

### 10. `config_schema` format — [frontend]
Verify what the Zenso web UI expects for rendering plugin config forms; current JSON-Schema-ish shape is a best guess.

### 11. iCloud ICS latency — [both]
Apple iCloud public ICS feeds can lag several to ~15+ minutes behind edits. Document it in the README and consider a "data freshness" hint (e.g. show `fetched_at` on screen) once the backend ships.
