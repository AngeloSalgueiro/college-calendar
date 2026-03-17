let currentDate = new Date();
const startHour = 8;
const endHour = 20;
const hourHeight = 60;

function parseICSDate(icsDate) {
    return new Date(
        icsDate.replace(
            /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
            "$1-$2-$3T$4:$5:$6Z"
        )
    );
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diff);
    return d;
}

function formatDateKey(date) {
    return date.toISOString().split("T")[0];
}

function saveEvents(events) {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
}

async function getEvents() {
    const response = await fetch("http://localhost:3000/proxy-calendar");
    const data = await response.json();

    const events = {};

    data.forEach(e => {
        console.log(e)

        const startDate = parseICSDate(e.startDate);
        const endDate = parseICSDate(e.endDate);

        const key = formatDateKey(startDate); // ✅ correct day

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
            text: e.summary || "No title",
            description: e.description || "No description",
            location: e.location || "No location"
        });
    });

    return events;
}

async function renderWeek() {
    const container = document.getElementById("weekContainer");
    const label = document.getElementById("weekLabel");
    container.innerHTML = "";

    const start = getStartOfWeek(currentDate);
    const today = new Date();
    const events = await getEvents();

    const options = { month: "short", day: "numeric" };
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    label.textContent =
        `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;

    // TIME COLUMN
    const timeColumn = document.createElement("div");
    timeColumn.className = "time-column";

    const slot = document.createElement("div");
    slot.className = "time-slot";
    timeColumn.appendChild(slot);


    for (let h = startHour; h <= endHour; h++) {
        const slot = document.createElement("div");
        slot.className = "time-slot";
        slot.textContent = `${h}:00`;
        timeColumn.appendChild(slot);
    }

    container.appendChild(timeColumn);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    for (let i = 0; i < 5; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);

        const key = formatDateKey(day);
        const dayEvents = events[key] || [];

        const column = document.createElement("div");
        column.className = "day-column";

        if (day.toDateString() === today.toDateString()) {
            column.classList.add("today");
        }

        // HEADER
        const header = document.createElement("div");
        header.className = "day-header";
        header.innerHTML = `${dayNames[i]}<br>${day.getDate()}`;

        // BODY
        const body = document.createElement("div");
        body.className = "day-body";

        for (let h = startHour; h <= endHour; h++) {
            const row = document.createElement("div");
            row.className = "hour-row";
            row.dataset.hour = h;
            body.appendChild(row);
        }



        dayEvents.forEach(ev => {
            const event = document.createElement("div");
            event.className = "event";

            const top = (ev.start - startHour) * hourHeight;
            const height = ev.duration * hourHeight;

            event.style.top = top + "px";
            event.style.height = height + "px";

            const title = document.createElement("div")
            title.style.fontSize = "13px";
            title.textContent = ev.text

            const location = document.createElement("div")
            location.style.fontSize = "10px"
            location.textContent = ev.location

            const description = document.createElement("div")
            description.style.fontSize = "10px"
            description.textContent = ev.description

            event.appendChild(title)
            event.appendChild(location)
            event.appendChild(description)
            body.appendChild(event);
        });

        column.appendChild(header);
        column.appendChild(body);
        container.appendChild(column);
    }
}

async function changeWeek(offset) {
    currentDate.setDate(currentDate.getDate() + offset * 7);
    await renderWeek();
}

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("prevBtn").onclick = () => changeWeek(-1);
    document.getElementById("nextBtn").onclick = () => changeWeek(1);

    await renderWeek();
})

