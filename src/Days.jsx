import { useState, useEffect } from 'react'
import { startHour, endHour } from './App.jsx';
import { formatDateKey } from './App.jsx';
import getEvents from './Events.jsx';

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hourHeight = 70;

function Event({ e, index, catClass, style }) {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(current => !current);

        setTimeout(() => {
            setIsClicked(false);
        }, 200);
    };

    return <div className={"event " + catClass + (isClicked ? "" : " show-more")} style={style} key={e.start + e.subject + index} onClick={handleClick}>
        <div style={{ fontSize: "12px" }}>{e.subject}</div>
        <div style={{ fontSize: "14px", paddingTop: "4px", paddingBottom: "4px" }}>{e.location}</div>
        <div style={{ fontSize: "12px" }}>{e.teacher}</div>
    </div>
}

function DayBody({ dayEvents }) {
    let rows = []

    for (let h = startHour; h <= endHour; h++) {
        const row = <div className="hour-row" hour={h}></div>
        rows.push(row)
    }

    const groupedByStart = {};
    dayEvents.forEach(e => {
        if (!groupedByStart[e.start]) groupedByStart[e.start] = [];
        groupedByStart[e.start].push(e);
    });

    const events = [];

    Object.values(groupedByStart).forEach(overlapGroup => {
        const overlapCount = overlapGroup.length;

        overlapGroup.forEach((e, index) => {
            const catClass = e.category === "CM" ? "cm" :
                e.category === "TD" ? "td" :
                    e.category === "TP" ? "tp" :
                        e.category.includes("Contrôle continu") ? "controle" : "other";

            const top = (e.start - startHour) * hourHeight;
            const height = e.duration * hourHeight;

            const widthPercent = 100 / overlapCount;
            const leftPercent = index * widthPercent;

            const style = {
                top: top + "px",
                height: height + "px",
                width: widthPercent + "%",
                left: leftPercent + "%",
                position: "absolute"
            };

            const event = (
                <Event e={e} index={index} catClass={catClass} style={style} />
            );

            events.push(event);
        });
    });

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