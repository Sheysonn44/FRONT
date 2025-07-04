import React, { useState, useEffect } from 'react';

const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

const Button = ({ children, onClick }) => (
  <button onClick={onClick} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded">
    {children}
  </button>
);

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const CalendarModule = () => {
  const max_hours_per_day = 10;
  const maxPerActivity = { HC: 16, AE: 8, PYE: 16, OI: 8 };
  const [events, setEvents] = useState([]);
  const [selectionDay, setSelectionDay] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activityType, setActivityType] = useState('HC');
  const [savedSelections, setSavedSelections] = useState([]);
  const [totalHours, setTotalHours] = useState(40);

  useEffect(() => {
    const storedSelections = localStorage.getItem('calendarSelections');
    if (storedSelections) {
      setSavedSelections(JSON.parse(storedSelections));
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEvents([]);
        setSelectionDay(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isContiguous = (newHourIndex) => {
    const selectedHours = events.map(e => e.hour).sort((a, b) => a - b);
    if (selectedHours.length === 0) return true;
    return Math.abs(newHourIndex - selectedHours[selectedHours.length - 1]) === 1;
  };

  const toggleEvent = (dayIndex, hourIndex) => {
    const existing = events.find(e => e.day === dayIndex && e.hour === hourIndex);
    if (existing) {
      const updatedEvents = events.filter(e => !(e.day === dayIndex && e.hour === hourIndex));
      setEvents(updatedEvents);
      if (updatedEvents.length === 0) setSelectionDay(null);
    } else {
      setEvents([...events, { day: dayIndex, hour: hourIndex, activity: activityType }]);
    }
  };

  const handleMouseDown = (dayIndex, hourIndex) => {
    const isBlocked = savedSelections.some(sel => sel.day === dayIndex && sel.blocks.some(b => b.hour === hourIndex));
    if (isBlocked) return;
    if (selectionDay === null || events.length === 0 || selectionDay !== dayIndex) {
      setSelectionDay(dayIndex);
      setEvents([{ day: dayIndex, hour: hourIndex, activity: activityType }]);
    } else if (isContiguous(hourIndex)) {
      toggleEvent(dayIndex, hourIndex);
    }
    setIsDragging(true);
  };

  const handleMouseEnter = (dayIndex, hourIndex) => {
    if (isDragging && selectionDay === dayIndex && isContiguous(hourIndex)) {
      toggleEvent(dayIndex, hourIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'AE': return 'bg-green-400 text-white';
      case 'HC': return 'bg-blue-400 text-white';
      case 'PYE': return 'bg-yellow-400 text-black';
      case 'OI': return 'bg-red-500 text-white';
      default: return 'bg-gray-200';
    }
  };

  const getCellClass = (dayIndex, hourIndex) => {
    const current = events.find(e => e.day === dayIndex && e.hour === hourIndex);
    if (current) return getActivityColor(current.activity);

    const saved = savedSelections.find(sel =>
      sel.day === dayIndex && sel.blocks.some(b => b.hour === hourIndex)
    );
    if (saved) return getActivityColor(saved.activity);

    return 'bg-white';
  };

  const getTimeRange = () => {
    if (events.length === 0) return { start: '', end: '' };
    const sorted = [...events].sort((a, b) => a.hour - b.hour);
    return {
      start: hours[sorted[0].hour],
      end: hours[sorted[sorted.length - 1].hour]
    };
  };

  const deleteSelection = (index) => {
    const updated = savedSelections.filter((_, i) => i !== index);
    setSavedSelections(updated);
    localStorage.setItem('calendarSelections', JSON.stringify(updated));
  };

  const saveSelection = () => {
    const dayBlockCount = savedSelections
      .filter(sel => sel.day === selectionDay)
      .reduce((sum, sel) => sum + sel.blocks.length, 0) + events.length;

    if (dayBlockCount > max_hours_per_day * 2) {
      alert(`No puede superar las ${max_hours_per_day} horas permitidas por día.`);
      return;
    }
    const currentActivityCount = savedSelections
      .filter(sel => sel.activity === activityType)
      .reduce((sum, sel) => sum + sel.blocks.length, 0) + events.length;
    const maxAllowed = maxPerActivity[activityType];

    if (currentActivityCount > maxAllowed) {
      alert(`No puede superar el máximo permitido de ${maxAllowed / 2} horas para la actividad ${activityType}.`);
      return;
    }
    const totalSelectedHours = savedSelections.reduce((sum, sel) => sum + sel.blocks.length, 0) + events.length;
    if (totalSelectedHours > totalHours) {
      alert(`No puede superar el máximo de ${totalHours} horas asignadas.`);
      return;
    }

    const selection = {
      day: selectionDay,
      dayLabel: days[selectionDay],
      startTime: getTimeRange().start,
      endTime: getTimeRange().end,
      activity: activityType,
      blocks: [...events]
    };
    const newSelections = [...savedSelections, selection];
    setSavedSelections(newSelections);
    localStorage.setItem('calendarSelections', JSON.stringify(newSelections));
    setEvents([]);
    setSelectionDay(null);
  };

  const { start, end } = getTimeRange();

  return (
    <div className="p-4 space-y-6" onMouseUp={handleMouseUp}>
      <h1 className="text-2xl font-bold">Horario Semanal</h1>
        <div className="flex-1">
          <div className="mb-4 flex gap-4 items-center flex-wrap">
            <div>
              <label className="block font-medium">Hora inicio:</label>
              <input className="border px-2 py-1" value={start} readOnly />
            </div>
            <div>
              <label className="block font-medium">Hora fin:</label>
              <input className="border px-2 py-1" value={end} readOnly />
            </div>
            <div>
              <label className="block font-medium">Actividad:</label>
              <select
                className="border px-2 py-1"
                value={activityType}
                onChange={(e) => {
                const newType = e.target.value;
                setActivityType(newType);
                setEvents((prev) => prev.map(ev => ({ ...ev, activity: newType })));
              }}
              >
                <option value="HC">HC</option>
                <option value="AE">AE</option>
                <option value="PYE">PYE</option>
<option value="OI">OI</option>
              </select>
            </div>
            <Button onClick={saveSelection}>Guardar</Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
        <div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="text-center font-semibold p-2 border">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((_, dayIndex) => {
            const blocksUsed = savedSelections
              .filter(sel => sel.day === dayIndex)
              .reduce((sum, sel) => sum + sel.blocks.length, 0);
            const hoursUsed = Math.floor(blocksUsed / 2);
            const percent = Math.floor((blocksUsed / (max_hours_per_day * 2)) * 100);
            return (
              <div key={dayIndex} className="text-center text-xs text-gray-600 p-1 border-t">
                {hoursUsed}h / {max_hours_per_day}h<br />
                ({percent}% usado)
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-7 gap-1">
       
          {days.map((_, dayIndex) => (
            <div key={dayIndex} className="flex flex-col">
              {hours.map((hour, hourIndex) => (
                <div
                  key={hourIndex}
                  className={`border h-8 flex items-center justify-center text-sm cursor-pointer select-none ${getCellClass(dayIndex, hourIndex)}`}
                  onMouseDown={() => handleMouseDown(dayIndex, hourIndex)}
                  onMouseEnter={() => handleMouseEnter(dayIndex, hourIndex)}
                >
                  {hour}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
        <div className="w-full lg:w-1/3">
          <div className="space-y-2 mb-4">
            {Object.entries(maxPerActivity).map(([key, max]) => {
              const used = savedSelections.filter(sel => sel.activity === key).reduce((sum, sel) => sum + sel.blocks.length, 0);
              const percent = (used / max) * 100;
              return (
                <div key={key}>
                  <div className="text-sm font-medium text-gray-800">{key}: {Math.floor(used / 2)} / {max / 2} horas</div>
                  <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                    <div className={`${getActivityColor(key)} h-full`} style={{ width: `${percent}%`, transition: 'width 0.3s ease-in-out' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <h2 className="text-lg font-semibold mb-2">Selecciones guardadas:</h2>
          <p className="text-sm text-gray-700 mb-1">Total registrado: {Math.floor(savedSelections.reduce((sum, sel) => sum + sel.blocks.length, 0) / 2)} / {Math.floor(totalHours / 2)} horas</p>
          <div className="w-full h-3 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${(savedSelections.reduce((sum, sel) => sum + sel.blocks.length, 0) / totalHours) * 100}%`, transition: 'width 0.3s ease-in-out' }}
            ></div>
          </div>
          <ul className="space-y-1">
            {savedSelections.map((sel, index) => (
              <li key={index} className={`p-2 rounded flex justify-between items-center ${getActivityColor(sel.activity)}`}>
                <span><span className="font-semibold">{sel.activity}</span> - {sel.dayLabel}: {sel.startTime} - {sel.endTime}</span>
                <button onClick={() => deleteSelection(index)} className="ml-4 text-sm text-red-700 hover:underline">Eliminar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      
    </div>
  );
};

export default CalendarModule;
