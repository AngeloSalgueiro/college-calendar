import { formatDateKey } from './App.jsx';

export default async function getEvents() {
    const response = await fetch("http://localhost:3000/calendar");
    const data = await response.json();

    const events = {};

    data.forEach(e => {
        const startDate = new Date(e.start_at);
        const endDate = new Date(e.end_at);

        const key = formatDateKey(startDate);

        const start =
            startDate.getHours() + startDate.getMinutes() / 60;

        const duration =
            (endDate - startDate) / (1000 * 60 * 60);

        if (!events[key]) {
            events[key] = [];
        }

        events[key].push({
            start: start,
            duration: duration,
            category: e.categories,
            subject: e.modules_for_blocks || e.categories || "No title",
            teacher: e.teachers_for_blocks || "",
            location: e.rooms_for_item_details || "No location"
        });
    });

    return events;
}