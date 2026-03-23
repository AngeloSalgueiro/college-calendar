import { useState, useEffect } from 'react'
import { startHour, endHour } from './App.jsx';
import { formatDateKey } from './App.jsx';
import getEvents from './Events.jsx';

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hourHeight = 70;

function DayBody({ dayEvents }) {
    let rows = []

    for (let h = startHour; h <= endHour; h++) {
        const row = <div className="hour-row" hour={h}></div>
        rows.push(row)
    }

    let events = []

    dayEvents.forEach(e => {
        const category = () => {
            switch (e.category) {
                case "CM":
                    return "cm"
                case "TD":
                    return "td"
                case "TP":
                    return "tp"
                default:
                    if (e.category.includes("Contrôle continu")) {
                        return "controle"
                    } else {
                        return "other"
                    }
            }
        }

        const top = (e.start - startHour) * hourHeight;
        const height = e.duration * hourHeight;

        const style = {
            top: top + "px",
            height: height + "px"
        }

        const event = <div className={"event " + category()} style={style}>
            <div style={{ fontSize: "12px" }}>
                {e.subject}
            </div>
            <div style={{ fontSize: "14px", paddingTop: "4px", paddingBottom: "4px" }}>
                {e.location}
            </div>
            <div style={{ fontSize: "12px" }}>
                {e.teacher}
            </div>
        </div>

        events.push(event)
    })

    return <div className="day-body">
        {rows}
        {events}
    </div>
}

function Day({ number, start, events }) {

    const day = new Date(start);
    day.setDate(start.getDate() + number);

    const key = formatDateKey(day);
    const dayEvents = events[key] || [];

    return <div className={"day-column " + (day.toDateString() === (new Date).toDateString() ? 'today' : '')}>
        <div className="day-header">
            {dayNames[number]}
            <br></br>
            {day.getDate()}
        </div>
        <DayBody dayEvents={dayEvents} />
    </div>
}

export default function Days({ start }) {

    const [events, setEvents] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await getEvents();
                setEvents(data);
            } catch (err) {
                console.error("Error fetching events:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, []);

    if (loading) return <p>Loading...</p>;

    let days = []

    for (let i = 0; i < 5; i++) {
        const day = <Day number={i} start={start} events={events} />
        days.push(day)
    }

    return <>{days}</>

}