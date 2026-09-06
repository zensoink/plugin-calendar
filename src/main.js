import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

const VIEW_BY_CONFIG = {
  list: 'listMonth',
  month: 'dayGridMonth',
  week: 'timeGridRollingWeek',
  day: 'timeGridDay',
}

const data = window.__ZENSO_DATA__ || {}
const calendar = data.calendar || {}
const config = data.config || {}

const events = (calendar.events || []).map((e) => ({
  title: e.title,
  start: e.start,
  end: e.end,
  allDay: e.all_day,
  color: e.color,
}))

const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const scrollTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:00`

const anchor = calendar.today ? new Date(`${calendar.today}T00:00:00`) : now
anchor.setHours(0, 0, 0, 0)
// ponytail: 4 cols on small e-ink (~185px/col at 800px) vs 7 on large; one constant if taste changes
const smallScreen = window.innerWidth < 1000
const dayCount = smallScreen ? 4 : 7
const rollingEnd = new Date(anchor)
rollingEnd.setDate(rollingEnd.getDate() + dayCount)

// ponytail: explicit hour12 beats locale guessing; missing key falls back to manifest default '24h'
const hour12 = (config.time_format || '24h') === '12h'

const fc = new Calendar(document.getElementById('calendar-grid'), {
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
  initialView: VIEW_BY_CONFIG[config.view] || 'dayGridMonth',
  initialDate: calendar.today,
  views: {
    timeGridRollingWeek: {
      type: 'timeGrid',
      duration: { days: dayCount },
      visibleRange: () => ({ start: anchor, end: rollingEnd }),
    },
  },
  height: '100%',
  events,
  headerToolbar: false,
  dayMaxEvents: true,
  eventDisplay: 'block',
  displayEventTime: false,
  nowIndicator: true,
  scrollTime,
  slotDuration: '01:00:00',
  slotMinTime: '06:00:00',
  slotMaxTime: '23:00:00',
  slotLabelFormat: { hour: '2-digit', minute: '2-digit', omitZeroMinute: false, hour12 },
  eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12 },
  expandRows: true,
})

fc.render()
window.__ZENSO_READY__ = true
