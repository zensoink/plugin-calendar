import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'

const GRID_VIEWS = { month: 'dayGridMonth', week: 'timeGridWeek', day: 'timeGridDay' }

function parseNow() {
  const cal = data.calendar || {}
  const label = cal.now_label
  if (label && cal.today) {
    const [h, m] = label.split(':').map(Number)
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      return new Date(`${cal.today}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
    }
  }
  return new Date()
}

function toHHMMSS(date) {
  return [date.getHours(), date.getMinutes(), date.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':')
}

function initGrid() {
  const view = GRID_VIEWS[data.config.view]
  const now = parseNow()
  const events = (data.calendar.events || []).map((e) => ({
    title: e.title,
    start: e.start,
    end: e.end,
    allDay: e.all_day,
  }))

  const calendar = new Calendar(document.getElementById('calendar-grid'), {
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: view,
    initialDate: data.calendar.today,
    height: '100%',
    events,
    headerToolbar: false,
    dayMaxEvents: true,
    eventDisplay: 'block',
    scrollTime: toHHMMSS(new Date(now.getTime() - 30 * 60 * 1000)),
    slotLaneClassNames: (arg) => (Math.floor(arg.time.milliseconds / 3600000) === now.getHours() ? ['fc-now-hour'] : []),
  })
  calendar.render()
}

const data = window.__ZENSO_DATA__

if (data && data.calendar && data.config && GRID_VIEWS[data.config.view]) {
  initGrid()
}

window.__ZENSO_READY__ = true
