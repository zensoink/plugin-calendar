import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const mockPath = resolve(__dirname, '../mock/plugin.json')
const zensoPath = resolve(__dirname, '../mock/zenso.json')
const zensoConfigPath = resolve(__dirname, '../zenso.config.json')
// Bootstrap-only mode for predev: never clobber an existing fixture.
const ifMissing = process.argv.includes('--if-missing')

const FEEDS = [
  { url: 'https://calendar.google.com/calendar/ical/example%40gmail.com/private-xyz/basic.ics', color: '#3b82f6' },
  { url: 'https://pXX-caldav.icloud.com/published/example/another.ics', color: '#ef4444' },
]

const SAMPLES = [
  { title: 'Farmers market', all_day: true, hour: null },
  { title: 'Team standup', all_day: false, hour: 9, minute: 30 },
  { title: 'Gym workout', all_day: false, hour: 18, minute: 0 },
  { title: 'Dentist check-up', all_day: false, hour: 14, minute: 0 },
  { title: 'Weekend trip', all_day: true, hour: null },
  { title: 'Lunch with Ada', all_day: false, hour: 12, minute: 30 },
  { title: 'Project review', all_day: false, hour: 16, minute: 15 },
]

function pad(n) {
  return String(n).padStart(2, '0')
}

function daysAheadDefault() {
  try {
    const schema = JSON.parse(readFileSync(zensoConfigPath, 'utf8'))
    const d = schema.config_schema?.properties?.days_ahead?.default
    if (typeof d === 'number') return d
  } catch {
    // fall through to builtin default
  }
  return 14
}

function main() {
  if (ifMissing && existsSync(mockPath)) {
    console.log(`Mock exists, skipping (${mockPath})`)
    return
  }
  const mock = existsSync(mockPath)
    ? JSON.parse(readFileSync(mockPath, 'utf8'))
    : { plugin: {}, config: {}, data: {} }
  mock.data ??= {}
  mock.data.calendar ??= { days_ahead: daysAheadDefault() }
  const zenso = JSON.parse(readFileSync(zensoPath, 'utf8'))
  const cal = mock.data.calendar
  delete cal.days
  const today = new Date()
  const year = today.getUTCFullYear()
  const month = today.getUTCMonth()
  const todayStr = today.toISOString().slice(0, 10)
  const tz = zenso.user.time_zone_iana

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const events = []
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${year}-${pad(month + 1)}-${pad(day)}`
    const count = (day * 7) % 4
    for (let i = 0; i < count; i++) {
      const sample = SAMPLES[(day + i) % SAMPLES.length]
      const feed = FEEDS[(day + i) % FEEDS.length]
      const timeLabel = sample.all_day || sample.hour === null
        ? ''
        : `${pad(sample.hour)}:${pad(sample.minute)}`
      const start = sample.all_day || sample.hour === null
        ? `${dayStr}T00:00:00+00:00`
        : `${dayStr}T${pad(sample.hour)}:${pad(sample.minute)}:00+00:00`
      events.push({
        title: sample.title,
        location: null,
        all_day: sample.all_day,
        day_label: dayStr,
        start,
        end: null,
        time_label: timeLabel,
        end_time_label: null,
        color: feed.color,
      })
    }
  }
  events.sort((a, b) => (a.start || '').localeCompare(b.start || ''))

  const now = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
  }).format(today)

  mock.config.calendar_feeds = FEEDS
  mock.data.calendar = {
    ...cal,
    today: todayStr,
    today_label: new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(today),
    now_label: now,
    days_ahead: cal.days_ahead,
    fetched_at: today.toISOString(),
    sources: FEEDS.map((f) => f.url),
    events,
  }
  writeFileSync(mockPath, `${JSON.stringify(mock, null, 2)}\n`)
  console.log(`Generated ${events.length} synthetic events for ${todayStr} -> ${mockPath}`)
}

main()
