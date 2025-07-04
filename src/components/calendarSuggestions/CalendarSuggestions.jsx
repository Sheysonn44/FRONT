import React, { useState, useEffect } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import ActivityProgressBars from './ActivityProgressBars';
import EventsList from './EventsList';

const hours = Array.from({ length: 36 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const getHourLabel = (index) => hours[index] || '';

const Calendar = () => {
  const [events, setEvents] = useState(() => {
      const saved = localStorage.getItem('sugerencias');
      return saved ? JSON.parse(saved) : [];
    });;
  const [teacher, setTeacher] = useState("JG"); 
  const [totalHours, setTotalHours] = useState(40);

   useEffect(() => {
    const storedSelections = localStorage.getItem('sugerencias');
    if (storedSelections) {
      setEvents(JSON.parse(storedSelections));
      
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sugerencias', JSON.stringify(events));
    
  }, [events]);


  const activities = {
  AP: {bgColor:'bg-blue-600'},
  BP: {bgColor:'bg-indigo-500'},
};

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'AP': return 'bg-blue-600 text-white';
      case 'BP': return 'bg-indigo-500 text-black';
      default: return 'bg-gray-200';
    }
  };



  const deleteSelection = (index) => {
    const updated = events.filter((_, i) => i !== index);
    setEvents(updated);
    localStorage.setItem('sugerencias', JSON.stringify(updated));
  };





  return (
    <div className="p-4 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Seleccione el profesor:
        <input
          type="text"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
        />
      </label>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/4">
          <CalendarHeader 
          days={days} 
          events={events}
          />
                  
          
          <CalendarGrid
            events={events.filter(ev => ev.teacher === teacher)}
            setEvents = {setEvents}
            getHourLabel = {getHourLabel}
            activities={activities}
            days={days}
            hours={hours}
            teacher = {teacher}
          />
        </div>

        <div className="w-full lg:w-1/4">
          Estadísticas
         <br />
         <br />
          <ActivityProgressBars
            activities = {activities}
            events={events.filter(ev => ev.teacher === teacher)}
            getActivityColor={getActivityColor}
          />
          <EventsList
            days = {days}
            getHourLabel = {getHourLabel}
            events={events.filter(ev => ev.teacher === teacher)}
            deleteSelection={deleteSelection}
            totalHours={totalHours}
            getActivityColor={getActivityColor}
          />

        </div>
      </div>
    </div>
  );
};

export default Calendar;
