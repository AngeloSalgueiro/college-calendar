import { useState } from 'react';
import { startHour, endHour } from './Week.jsx';

function formatDateKey(date) {
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hourHeight = 60;

function Event({ e, index, catClass, style }) {
    const [clicked, setIsClicked] = useState(false)

    const handleClick = () => {
        setIsClicked(true)

        setTimeout(() => {
            setIsClicked(false);
        }, 300);
    };

    return <div className={`event ${clicked ? `active` : ``} ${catClass}`} style={style} key={e.start + e.subject + index} onClick={handleClick}>
        <div style={{ fontSize: "12px" }}>{e.subject}</div>
        <div style={{ fontSize: "14px", paddingTop: "4px", paddingBottom: "4px" }}>{e.location}</div>
        <div style={{ fontSize: "12px" }}>{e.teacher}</div>
    </div>
}

function DayBody({ dayEvents }) {
    let rows = []

    for (let h = startHour; h <= endHour; h++) {
        const row = <div h={h} className="hour-row" hour={h}></div>
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

    return <div className={`day-column ${(day.toDateString() === (new Date).toDateString() ? 'today' : '')}`} >
        <div className="day-header">
            {dayNames[number]}
            <span> </span>
            {day.getDate()}
        </div>
        <DayBody dayEvents={dayEvents} />
    </div>
}

export default function Days({ start, events }) {
    let days = []

    for (let i = 0; i < 5; i++) {
    const day = <Day key={i} number={i} start={start} events={events} />;
    days.push(day);
}

    return <>{days}</>

}