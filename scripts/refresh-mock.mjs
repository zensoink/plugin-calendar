import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ical from 'node-ical'

const __dirname = dirname(fileURLToPath(import.meta.url))
const mockPath = resolve(__dirname, '../mock/plugin.json')
const zensoPath = resolve(__dirname, '../mock/zenso.json')

function localParts(date, tz) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (type) => parts.find((p) => p.type === type).value
  const offset = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')
    .value.match(/GMT([+-])(\d+)(?::(\d+))?/)
  const sign = offset[1]
  const h = offset[2].padStart(2, '0')
  const min = (offset[3] || '00').padStart(2, '0')
  return {
    iso: `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}${sign}${h}:${min}`,
    day: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  }
}

function toEvent(ev, tz) {
  const start = ev.start ? localParts(ev.start, tz) : null
  const end = ev.end ? localParts(ev.end, tz) : null
  const allDay = Boolean(ev.datetype === 'date')
  return {
    title: ev.summary || '(untitled)',
    location: ev.location || null,
    all_day: allDay,
    day_label: start ? start.day : null,
    start: start ? start.iso : null,
    end: end ? end.iso : null,
    time_label: start && !allDay ? start.time : '',
    end_time_label: end && !allDay ? end.time : null,
  }
}

async function main() {
  const urls = (process.env.CALENDAR_ICS_URLS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (!urls.length) {
    console.error('Set CALENDAR_ICS_URLS in .env (comma-separated ICS feed URLs)')
    process.exit(1)
  }
  const colors = (process.env.CALENDAR_ICS_COLORS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const feeds = urls.map((url, i) => ({
    url,
    color: colors[i] || '#3b82f6',
  }))

  const mock = JSON.parse(readFileSync(mockPath, 'utf8'))
  const zenso = JSON.parse(readFileSync(zensoPath, 'utf8'))
  const tz = zenso.user.time_zone_iana

  const fetched = []
  for (const feed of feeds) {
    const data = await ical.async.fromURL(feed.url)
    for (const key of Object.keys(data)) {
      const ev = data[key]
      if (ev.type !== 'VEVENT' || ev.rrule) continue
      const event = toEvent(ev, tz)
      event.color = feed.color
      fetched.push(event)
    }
  }
  fetched.sort((a, b) => (a.start || '').localeCompare(b.start || ''))

  const today = new Date().toISOString().slice(0, 10)
  mock.config.calendar_feeds = feeds
  mock.data.calendar = {
    ...mock.data.calendar,
    today,
    events: fetched,
    sources: urls,
  }
  writeFileSync(mockPath, `${JSON.stringify(mock, null, 2)}\n`)
  console.log(`Wrote ${fetched.length} events to ${mockPath} (today=${today})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
