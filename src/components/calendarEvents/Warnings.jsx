// Warnings.jsx
import React from 'react';

const Warnings = ({ events, getHourLabel }) => {
  const warnings = [];

  // Cruce de eventos
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];
      if (a.day === b.day && a.hour < b.hour + b.duration && b.hour < a.hour + a.duration) {
        warnings.push(
          `⚠️ Cruce entre el evento ${a.activity} (${getHourLabel(a.hour)}-${getHourLabel(a.hour + a.duration)}) ` +
          `y ${b.activity} (${getHourLabel(b.hour)}-${getHourLabel(b.hour + b.duration)}) en ${a.day}`
        );
      }
    }
  }

  // Eventos mayores a 5 horas
  events.forEach(ev => {
    if (ev.duration > 10) {
      warnings.push(`⚠️ Evento ${ev.activity} el día ${ev.day} dura más de 5 horas.`);
    }
  });

  // Eventos contiguos que suman más de 5 horas
  const groupedByDay = {};
  events.forEach(ev => {
    if (!groupedByDay[ev.day]) groupedByDay[ev.day] = [];
    groupedByDay[ev.day].push(ev);
  });

  Object.entries(groupedByDay).forEach(([day, evs]) => {
    const sorted = evs.sort((a, b) => a.hour - b.hour);
    let start = 0;
    while (start < sorted.length) {
      let total = sorted[start].duration;
      let end = start + 1;
      let lastEndHour = sorted[start].hour + sorted[start].duration;

      while (end < sorted.length && sorted[end].hour <= lastEndHour) {
        const overlap = Math.max(0, lastEndHour - sorted[end].hour);
        total += sorted[end].duration - overlap;
        lastEndHour = Math.max(lastEndHour, sorted[end].hour + sorted[end].duration);
        end++;
      }

      if (total > 10) {
        warnings.push(`⚠️ Hay una secuencia contigua de eventos el día ${day} que supera las 5 horas.`);
        break;
      }

      start = end;
    }
  });

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-900 space-y-1">
      {warnings.length > 0 ? (
        warnings.map((w, i) => <div key={i}>{w}</div>)
      ) : (
        <div>✅ Sin advertencias</div>
      )}
    </div>
  );
};

export default Warnings;
