# Changelog

## 0.2.0 — 2026-08-01

- Grid views (`month` / `week` / `day`) via FullCalendar (v6), bundled locally as IIFE `calendar.js`.
- `view` config (`list` default) in `config_schema`.
- `mock:refresh` script: fetch real Google/Apple ICS feeds into `dev/mock/zenso.mock.json`.

## 0.1.0 — 2026-08-01

- Calendar agenda view (today + next days), grouped by day.
- English UI, e-ink-friendly styling.
- `data_sources` manifest contract for server-side ICS fetching (backend engine is a separate task).
- Mock calendar data for local development.
