import { useState } from 'react'
import Days from './Days.jsx';
import './App.css'

export const startHour = 8;
export const endHour = 20;

export function formatDateKey(date) {
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");
}

function Header({ changeWeek, label }) {
  return <div className="header">
    <button onClick={() => changeWeek(-1)}>◀</button>
    <h2 id="weekLabel">{label}</h2>
    <button onClick={() => changeWeek(1)}>▶</button>
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

function App() {
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

  return <div className="calendar">
    <Header changeWeek={changeWeek} label={label} />
    <div className="week unselectable" id="weekContainer">
      <TimeColumn />
      <Days start={start} />
    </div>
  </div>;
}

export default App
