import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ical from 'node-ical'

const mockPath = resolve('dev/mock/zenso.mock.json')

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

  const mock = JSON.parse(readFileSync(mockPath, 'utf8'))
  const tz = mock.zenso.user.time_zone_iana

  const fetched = []
  for (const url of urls) {
    const data = await ical.async.fromURL(url)
    for (const key of Object.keys(data)) {
      const ev = data[key]
      if (ev.type !== 'VEVENT' || ev.rrule) continue
      fetched.push(toEvent(ev, tz))
    }
  }
  fetched.sort((a, b) => (a.start || '').localeCompare(b.start || ''))

  const today = new Date().toISOString().slice(0, 10)
  mock.calendar = {
    ...mock.calendar,
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
