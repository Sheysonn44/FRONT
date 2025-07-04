import React, { useState, useEffect } from 'react';
import { Save, Trash2 } from "lucide-react";

const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

const Button = ({ children, onClick }) => (
  <button onClick={onClick} className="ml-4 text-sm text-blue-700 dark:text-blue-400 hover:underline">
    {children}
  </button>
);



const days = [' ', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const classrooms = ['PrimeroA', 'SegundoB', 'TerceroC'];

const TeacherScheduler = () => {
  const maxPerActivity = { Minor: 16, Pablo: 32, Maicol: 32, Nury: 32 };
  const [selectedClassroom, setSelectedClassroom] = useState('PrimeroA');
  const [events, setEvents] = useState([]);
  const [scheduleDay, setScheduleDay] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activityType, setActivityType] = useState('Minor');
  const [savedSchedules, setSavedSchedules] = useState({});

  const [viewAll, setViewAll] = useState(false); // 🔥 Nuevo estado para alternar

    const getDisplayedSchedules = () => {
    if (viewAll) {
        return Object.values(savedSchedules).flat(); // Todas las aulas combinadas
    } else {
        return savedSchedules[selectedClassroom] || []; // Solo el aula actual
    }
    };

  useEffect(() => {
    const storedSchedules = localStorage.getItem('teacherSchedulerData');
    if (storedSchedules) {
      setSavedSchedules(JSON.parse(storedSchedules));
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEvents([]);
        setScheduleDay(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!savedSchedules[selectedClassroom]) {
      setSavedSchedules(prev => ({ ...prev, [selectedClassroom]: [] }));
    }
  }, [selectedClassroom]);

  const getCurrentSchedules = () => savedSchedules[selectedClassroom] || [];

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
      if (updatedEvents.length === 0) setScheduleDay(null);
    } else {
      setEvents([...events, { day: dayIndex, hour: hourIndex, activity: activityType }]);
    }
  };

  const handleMouseDown = (dayIndex, hourIndex) => {
    if (dayIndex === 0) return;
    const isBlocked = getCurrentSchedules().some(sel => sel.day === dayIndex && sel.blocks.some(b => b.hour === hourIndex));
    if (isBlocked) return;

    setEvents([{ day: dayIndex, hour: hourIndex, activity: activityType }]);
    setScheduleDay(dayIndex);
    setIsDragging(true);
  };

  const handleMouseEnter = (dayIndex, hourIndex) => {
    if (dayIndex === 0) return;
    if (isDragging && scheduleDay === dayIndex && isContiguous(hourIndex)) {
      toggleEvent(dayIndex, hourIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'Minor': return 'bg-blue-300 text-black';
      case 'Pablo': return 'bg-blue-600 text-white';
      case 'Maicol': return 'bg-sky-500 text-black';
      case 'Nury': return 'bg-amber-300 text-black';
      default: return 'bg-gray-200';
    }
  };

  const getCellClass = (dayIndex, hourIndex) => {
    const current = events.find(e => e.day === dayIndex && e.hour === hourIndex);
    if (current) return getActivityColor(current.activity);

    const saved = getCurrentSchedules().find(sel =>
      sel.day === dayIndex && sel.blocks.some(b => b.hour === hourIndex)
    );
    if (saved) return getActivityColor(saved.activity);

    return 'bg-white dark:bg-gray-800';
  };

  const getTimeRange = () => {
    if (events.length === 0) return { start: '', end: '' };
    const sorted = [...events].sort((a, b) => a.hour - b.hour);
    return {
      start: hours[sorted[0].hour],
      end: hours[sorted[sorted.length - 1].hour]
    };
  };

  const deleteSchedule = (index) => {
    const updated = getCurrentSchedules().filter((_, i) => i !== index);
    setSavedSchedules(prev => {
      const newSchedules = { ...prev, [selectedClassroom]: updated };
      localStorage.setItem('teacherSchedulerData', JSON.stringify(newSchedules));
      return newSchedules;
    });
  };

  const saveSchedule = () => {
    if (events.length === 0) return;

    const updatedSchedules = [...getCurrentSchedules(), {
      day: scheduleDay,
      dayLabel: days[scheduleDay],
      startTime: getTimeRange().start,
      endTime: getTimeRange().end,
      activity: activityType,
      blocks: [...events]
    }];

    setSavedSchedules(prev => {
      const newSchedules = { ...prev, [selectedClassroom]: updatedSchedules };
      localStorage.setItem('teacherSchedulerData', JSON.stringify(newSchedules));
      return newSchedules;
    });

    setEvents([]);
    setScheduleDay(null);
  };

  const { start, end } = getTimeRange();

  return (
    <div className="p-4 space-y-6 bg-white dark:bg-gray-900 min-h-screen" onMouseUp={handleMouseUp}>
      <div className="flex flex-wrap gap-4 mb-4">
        <label className="block font-medium text-gray-800 dark:text-gray-200">Aula:</label>
        <select
          className="border px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
          value={selectedClassroom}
          onChange={(e) => setSelectedClassroom(e.target.value)}
        >
          {classrooms.map(room => (
            <option key={room} value={room}>{room}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div>
          {/* Encabezados de días */}
          <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1">
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="text-center font-semibold p-2 border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:text-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                {day}
              </div>
            ))}
          </div>

          {/* Horario semanal */}
          <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1">
            {days.map((_, dayIndex) => (
              <div key={dayIndex} className="flex flex-col">
                {hours.map((hour, hourIndex) => (
                  dayIndex === 0 ? (
                    <div key={hourIndex} className="border h-8 flex items-center justify-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 select-none">
                      {hour}
                    </div>
                  ) : (
                    <div
                      key={hourIndex}
                      className={`border h-8 flex items-center justify-center text-sm cursor-pointer select-none ${getCellClass(dayIndex, hourIndex)}`}
                      onMouseDown={() => handleMouseDown(dayIndex, hourIndex)}
                      onMouseEnter={() => handleMouseEnter(dayIndex, hourIndex)}
                    />
                  )
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Barra lateral */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block font-medium text-gray-800 dark:text-gray-200">Hora inicio:</label>
              <input className="border px-2 py-1 dark:bg-gray-700 dark:text-gray-200" value={start} readOnly />
            </div>
            <div>
              <label className="block font-medium text-gray-800 dark:text-gray-200">Hora fin:</label>
              <input className="border px-2 py-1 dark:bg-gray-700 dark:text-gray-200" value={end} readOnly />
            </div>
            <div>
              <label className="block font-medium text-gray-800 dark:text-gray-200">Profesor:</label>
              <select
                className="border px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                value={activityType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setActivityType(newType);
                  setEvents((prev) => prev.map(ev => ({ ...ev, activity: newType })));
                }}
              >
                <option value="Minor">Minor</option>
                <option value="Pablo">Pablo</option>
                <option value="Maicol">Maicol</option>
                <option value="Nury">Nury</option>
              </select>
            </div>
            <Button onClick={saveSchedule} disabled={events.length === 0}><Save size={20} /></Button>
          </div>

          <div className="space-y-2 mb-4">
            {Object.entries(maxPerActivity).map(([key, max]) => {
                // 🔥 Buscar TODAS las aulas, no sólo la del aula seleccionada
                const used = Object.values(savedSchedules)
                .flat()
                .filter(sel => sel.activity === key)
                .reduce((sum, sel) => sum + sel.blocks.length, 0);

                const percent = (used / max) * 100;

                return (
                <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {key}: {Math.floor(used / 2)} / {max / 2} horas
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{percent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                    <div
                        className={`${getActivityColor(key)} h-full`}
                        style={{ width: `${percent}%`, transition: 'width 0.3s ease-in-out' }}
                    ></div>
                    </div>
                </div>
                );
            })}
            </div>


          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Selecciones guardadas:</h2>
          <div className="flex items-center mb-2">
            <input
                id="viewAll"
                type="checkbox"
                checked={viewAll}
                onChange={() => setViewAll(prev => !prev)}
                className="mr-2"
            />
            <label htmlFor="viewAll" className="text-sm text-gray-800 dark:text-gray-200">
                Ver todas las selecciones
            </label>
            </div>

            <ul className="space-y-1">
            {getDisplayedSchedules().map((sel, index) => (
                <li key={index} className={`p-2 rounded flex justify-between items-center ${getActivityColor(sel.activity)}`}>
                <span>
                    <span className="font-semibold dark:text-white">{sel.activity}</span> - {sel.dayLabel}: {sel.startTime} - {sel.endTime}
                </span>
                <button onClick={() => deleteSchedule(index)} className="ml-4 text-sm text-red-700 dark:text-red-400 hover:underline">
                    <Trash2 />
                </button>
                </li>
            ))}
            </ul>


        </div>
      </div>
    </div>
  );
};

export default TeacherScheduler;
