import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

const VIEW_BY_CONFIG = {
  list: 'listMonth',
  month: 'dayGridMonth',
  week: 'timeGridWeek',
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

const fc = new Calendar(document.getElementById('calendar-grid'), {
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
  initialView: VIEW_BY_CONFIG[config.view] || 'dayGridMonth',
  initialDate: calendar.today,
  height: '100%',
  events,
  headerToolbar: false,
  dayMaxEvents: true,
  eventDisplay: 'block',
  nowIndicator: true,
})

fc.render()
window.__ZENSO_READY__ = true
