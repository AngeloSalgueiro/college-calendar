'use server'

function formatDateKey(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

let events = {};
let last_update = null

export default async function getEvents() {
    if (last_update === null || new Date().getTime() - last_update.getTime() > 1000 * 60 * 10) {
        
        last_update = new Date()

        const response = await fetch("https://edt-v2.univ-nantes.fr/events?start=2000-03-16&end=2999-03-22&timetables%5B0%5D=106112");
        const data = await response.json();

        for (const e of data) {
            const startDate = new Date(e.start_at);
            const endDate = new Date(e.end_at);

            const key = formatDateKey(startDate);

            const start = startDate.getHours() + startDate.getMinutes() / 60;
            const duration = (endDate - startDate) / (1000 * 60 * 60);

            if (!events[key]) {
                events[key] = [];
            }

            events[key].push({
                start,
                duration,
                category: e.categories,
                subject: e.modules_for_blocks || e.categories || "No title",
                teacher: e.teachers_for_blocks || "",
                location: e.rooms_for_item_details || "No location",
            });
        }
    }


    return events;
}