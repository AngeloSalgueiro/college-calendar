'use client'
import { useState } from 'react'
import WeekView from './Week.jsx';

function Header({ changeWeek, label }) {
  return <div className="header">
    <button onClick={() => changeWeek(-1)}>◀</button>
    <h2 id="weekLabel">{label}</h2>
    <button onClick={() => changeWeek(1)}>▶</button>
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
    <WeekView start={start} />
  </div>;
}

export default App
