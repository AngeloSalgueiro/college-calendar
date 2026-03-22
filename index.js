const { useState, useEffect } = React

const startHour = 8;
const endHour = 20;
const hourHeight = 70;
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function formatDateKey(date) {
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");
}

async function getEvents() {
  const response = await fetch("http://localhost:3000/calendar");
  const data = await response.json();

  const events = {};

  data.forEach(e => {
    console.log(e.start_at)
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

function Header({ changeWeek, label }) {
  return <div className="header">
    <button onClick={() => changeWeek(-1)}>◀</button>
    <h2 id="weekLabel">{label}</h2>
    <button onClick={() => changeWeek(1)}>▶</button>
  </div>
}

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

function TimeColumn() {
  let slots = []
  for (let h = startHour; h <= endHour; h++) {
    const slot = <div className="time-slot">{h}:00</div>
    slots.push(slot)
  }

  return <div className="time-column">
    <div className="time-slot"></div>
    {slots}
  </div>
}

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const options = { month: "long", day: "numeric" };

  function changeWeek(offset) {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + offset * 7);
      return newDate;
    });
  }

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diff);
    return d;
  }

  const start = getStartOfWeek(currentDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const label =
    start.toLocaleDateString(undefined, options) +
    " - " +
    end.toLocaleDateString(undefined, options);

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

  return <div className="calendar">
    <Header changeWeek={changeWeek} label={label} />
    <div className="week" id="weekContainer">
      <TimeColumn />
      {days}
    </div>
  </div>;
}

const domNode = document.querySelector('#root');
const root = ReactDOM.createRoot(domNode);
root.render(<Calendar />);