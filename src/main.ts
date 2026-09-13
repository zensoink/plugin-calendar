import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

declare global {
    interface Window {
        __ZENSO_READY__?: boolean;
    }
}

const VIEW_BY_CONFIG: Record<string, string> = {
    list: 'listMonth',
    month: 'dayGridMonth',
    week: 'timeGridRollingWeek',
    day: 'timeGridDay'
};

const grid = document.getElementById('calendar-grid');
const gridData = grid?.dataset ?? {};
const today = gridData.today || undefined;
const nowLabelRaw = gridData.nowLabel || undefined;
const fetchedAt = gridData.fetchedAt || undefined;
const view = gridData.view || undefined;
const timeFormat = gridData.timeFormat || undefined;

const dataHolder = document.getElementById('calendar-data');
const eventNodes =
    dataHolder instanceof HTMLTemplateElement
        ? dataHolder.content.querySelectorAll('span')
        : document.querySelectorAll('#calendar-data span');

const events = [...eventNodes].map((node) => {
    const d = (node as HTMLElement).dataset;
    return {
        title: d.title ?? '(untitled)',
        start: d.start || undefined,
        end: d.end || undefined,
        allDay: d.allDay === 'true',
        color: d.color || undefined
    };
});

const now = new Date();
const pad = (n: number): string => String(n).padStart(2, '0');
// Backend time wins — the server renders in UTC, so the env clock is UTC, not user time.
const nowLabel =
    typeof nowLabelRaw === 'string' && /^\d{2}:\d{2}$/.test(nowLabelRaw)
        ? nowLabelRaw
        : `${pad(now.getHours())}:${pad(now.getMinutes())}`;
const scrollTime = `${nowLabel}:00`;
const backendNow =
    typeof fetchedAt === 'string' && !Number.isNaN(Date.parse(fetchedAt)) ? fetchedAt : undefined;

const anchor = today ? new Date(`${today}T00:00:00`) : now;
anchor.setHours(0, 0, 0, 0);
// ponytail: 4 cols on small e-ink (~185px/col at 800px) vs 7 on large; one constant if taste changes
const smallScreen = window.innerWidth < 1000;
const dayCount = smallScreen ? 4 : 7;
const rollingEnd = new Date(anchor);
rollingEnd.setDate(rollingEnd.getDate() + dayCount);

// ponytail: explicit hour12 beats locale guessing; missing key falls back to manifest default '24h'
const hour12 = (timeFormat ?? '24h') === '12h';

if (grid) {
    const fc = new Calendar(grid, {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
        initialView: VIEW_BY_CONFIG[view ?? ''] ?? 'dayGridMonth',
        initialDate: today,
        views: {
            timeGridRollingWeek: {
                type: 'timeGrid',
                duration: { days: dayCount },
                visibleRange: () => ({ start: anchor, end: rollingEnd })
            }
        },
        height: '100%',
        events,
        headerToolbar: false,
        dayMaxEvents: true,
        eventDisplay: 'block',
        displayEventTime: false,
        nowIndicator: true,
        now: backendNow,
        scrollTime,
        slotDuration: '01:00:00',
        slotMinTime: '06:00:00',
        slotMaxTime: '23:00:00',
        slotLabelFormat: { hour: '2-digit', minute: '2-digit', omitZeroMinute: false, hour12 },
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12 },
        expandRows: true
    });

    fc.render();
}

window.__ZENSO_READY__ = true;
