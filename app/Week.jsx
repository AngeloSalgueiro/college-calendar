import { useState, useEffect, Suspense } from 'react'
import Days from "./Days";
import Loader from './Loader';
import getEvents from './data/Data';

export const startHour = 8;
export const endHour = 20;

function TimeColumn() {
    let slots = []
    for (let h = startHour; h <= endHour; h++) {
        const slot = <div key={h} className="time-slot">{h}:00</div>;
        slots.push(slot)
    }

    return <div className="time-column">
        <div className="first-time-slot"></div>
        {slots}
    </div>
}

function WeekContent({ start, eventsPromise }) {
    const events = use(eventsPromise); // ✅ 'use' unwraps server promise in client
    return (
        <div className="week unselectable" id="weekContainer">
            <TimeColumn />
            <Days start={start} events={events} />
        </div>
    );
}

export default function WeekView({ start }) {
    const [events, setEvents] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const data = await getEvents(); 
            setEvents(data);         }

        fetchData();
    }, []);

    if (!events) return <Loader />;

    return (
        <div className="week unselectable" id="weekContainer">
            <TimeColumn />
            <Days start={start} events={events} />
        </div>
    );
}