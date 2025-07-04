import React, { useState, useEffect } from 'react';
import ExportExcelConPlantilla from "../ExportExcelConPlantilla";
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import ActivityProgressBars from './ActivityProgressBars';
import EventsList from './EventsList';
import Warnings from './Warnings';

const hours = Array.from({ length: 36 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const getHourLabel = (index) => hours[index] || '';

const CalendarEvents = () => {
  const maxHoursPerDay = 10;
  const maxPerActivity = { HC: 16, AE: 8, PyE: 16, OI: 40 };
  const [activityType, setActivityType] = useState('HC');
  const [events, setEvents] = useState(() => {
      const saved = localStorage.getItem('tareas');
      return saved ? JSON.parse(saved) : [];
    });;
  const [totalHours, setTotalHours] = useState(40);

  const procesarComando = (transcript) => {
    const dias = { lunes: 1, martes: 2, miércoles: 3, jueves: 4, viernes: 5, sábado: 6 };
    const actividades = ["hc", "ae", "pye", "oi"];

    let diaEncontrado = Object.keys(dias).find(dia => transcript.includes(dia));
    let actividadEncontrada = actividades.find(act => transcript.includes(act));
    const horas = transcript.match(/de (\d{1,2}) a (\d{1,2})/);

    if (diaEncontrado && horas && actividadEncontrada) {
      const inicio = parseInt(horas[1]);
      const fin = parseInt(horas[2]);
      if (inicio >= fin) {
        alert("La hora de inicio debe ser menor a la de fin.");
        return;
      }
      registrarHorarioPorVoz(dias[diaEncontrado], inicio, fin, actividadEncontrada.toUpperCase());
    } else {
      alert("No se pudo interpretar el comando. Intenta decir: 'Registra horario para el lunes de 9 a 12 en HC'");
    }
  };

  useEffect(() => {
    const storedSelections = localStorage.getItem('tareas');
    if (storedSelections) {
      setEvents(JSON.parse(storedSelections));
      
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tareas', JSON.stringify(events));
    
  }, [events]);


  const activities = {
  HC: {bgColor:'bg-blue-600'},
  AE: {bgColor:'bg-indigo-500'},
  PyE: {bgColor:'bg-teal-500'},
  OI: {bgColor:'bg-pink-500'},
};

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'AE': return 'bg-indigo-500 text-black';
      case 'HC': return 'bg-blue-600 text-white';
      case 'PyE': return 'bg-teal-500 text-black';
      case 'OI': return 'bg-pink-500 text-black';
      default: return 'bg-gray-200';
    }
  };



  const deleteSelection = (index) => {
    const updated = events.filter((_, i) => i !== index);
    setEvents(updated);
    localStorage.setItem('tareas', JSON.stringify(updated));
  };





  return (
    <div className="p-4 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      <ExportExcelConPlantilla 
        profesor="Juan Gamboa Abarca" 
        correo="juan@ejemplo.com" 
        events={events} />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/4">
          <CalendarHeader 
          days={days} 
          events={events}
          maxHoursPerDay = {maxHoursPerDay}
          />
                  
          
          <CalendarGrid
            events={events}
            setEvents = {setEvents}
            getHourLabel = {getHourLabel}
            activities={activities}
            days={days}
            hours={hours}
          />
        </div>

        <div className="w-full lg:w-1/4">
          Estadísticas
         <br />
         <br />
          <ActivityProgressBars
            maxPerActivity={maxPerActivity}
            events={events}
            getActivityColor={getActivityColor}
          />
          <EventsList
            days = {days}
            getHourLabel = {getHourLabel}
            events={events}
            deleteSelection={deleteSelection}
            totalHours={totalHours}
            getActivityColor={getActivityColor}
          />
          <Warnings 
            events={events} 
            getHourLabel={getHourLabel} 
          />

        </div>
      </div>
    </div>
  );
};

export default CalendarEvents;
