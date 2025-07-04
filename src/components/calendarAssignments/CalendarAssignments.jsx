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
  const [sugerencias, setSugerencias] = useState(() => {
    const saved = localStorage.getItem('sugerencias');
    return saved ? JSON.parse(saved) : [];
  });

  const [asignaciones, setAsignaciones] = useState(() => {
    const saved = localStorage.getItem('asignaciones');
    return saved ? JSON.parse(saved) : [];
  });

  const teachersList = [...new Set(sugerencias.map(s => s.teacher))];

  const [teacher, setTeacher] = useState(""); 
  const [classRooms, setClassRooms] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9])
  const [totalHours, setTotalHours] = useState(40);
  const [selectedClassRoom, setSelectedClassRoom] = useState(0);

  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [showAssignments, setShowAssignments] = useState(true);

  useEffect(() => {
    const storedSug = localStorage.getItem('sugerencias');
    if (storedSug) {
      setSugerencias(JSON.parse(storedSug));
    }
    const storedAsg = localStorage.getItem('asignaciones');
    if (storedAsg) {
      setAsignaciones(JSON.parse(storedAsg));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sugerencias', JSON.stringify(sugerencias));
  }, [sugerencias]);

  useEffect(() => {
    localStorage.setItem('asignaciones', JSON.stringify(asignaciones));
  }, [asignaciones]);

  const activities = {
    AP: { bgColor: 'bg-blue-600' },
    BP: { bgColor: 'bg-indigo-500' },
  };

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'AP': return 'bg-blue-600 text-white';
      case 'BP': return 'bg-indigo-500 text-black';
      default: return 'bg-gray-200';
    }
  };

  const deleteSelection = (index) => {
    const updated = asignaciones.filter((_, i) => i !== index);
    setAsignaciones(updated);
    localStorage.setItem('asignaciones', JSON.stringify(updated));
  };

  return (
    <div className="p-4 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/4">
          <CalendarHeader 
            teachersList = {teachersList}
            selectedTeachers = {selectedTeachers}
            setSelectedTeachers={setSelectedTeachers}
            showAssignments = {showAssignments}
            setShowAssignments = {setShowAssignments}
            days={days} 
            events={asignaciones.filter(ev => ev.teacher === teacher)}
            classRooms = {classRooms}
            selectedClassRoom = {selectedClassRoom}
            setSelectedClassRoom = {setSelectedClassRoom}
          />

          <CalendarGrid
            events={asignaciones.filter(ev => !teacher || ev.teacher === teacher)}
            suggestions={!teacher ? sugerencias : sugerencias.filter(s => s.teacher === teacher)}
            setEvents={setAsignaciones}
            getHourLabel={getHourLabel}
            activities={activities}
            days={days}
            hours={hours}
            selectedTeachers = {selectedTeachers}
            showAssignments = {showAssignments}
            teacher={teacher}
            selectedClassroom={selectedClassRoom}
          />
        </div>

        <div className="w-full lg:w-1/4">
          Estadísticas
          <br /><br />
          <ActivityProgressBars
            activities={activities}
            events={asignaciones.filter(ev => ev.teacher === teacher)}
            getActivityColor={getActivityColor}
          />

          <EventsList
            days={days}
            getHourLabel={getHourLabel}
            events={asignaciones.filter(ev => ev.teacher === teacher)}
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
