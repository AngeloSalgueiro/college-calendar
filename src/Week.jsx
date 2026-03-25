import { useState, useEffect } from 'react'
import Days from "./Days";
import Loader from './Loader';
import getEvents from './data/Data';

export const startHour = 8;
export const endHour = 20;

function TimeColumn() {
    let slots = []
    for (let h = startHour; h <= endHour; h++) {
        const slot = <div className="time-slot">{h}:00</div>
        slots.push(slot)
    }

    return <div className="time-column">
        <div className="first-time-slot"></div>
        {slots}
    </div>
}

export default function Week({ start }) {

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

    if (loading) {
        return <Loader />
    } else {
        return <div className="week unselectable" id="weekContainer">
            <TimeColumn />
            <Days start={start} events={events} />
        </div>
    }


}