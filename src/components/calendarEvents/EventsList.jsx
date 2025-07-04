// SavedSelectionsList.jsx
import { Trash2 } from "lucide-react";

const EventsList = ({days, getHourLabel,  events, deleteSelection, totalHours, getActivityColor }) => {
  const total = events.reduce((sum, sel) => sum + sel.duration, 0);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Selecciones guardadas:</h2>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Total registrado: {(total / 2)} / {(totalHours)} horas</p>
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mb-4">
        <div className="h-full bg-blue-500" style={{ width: `${(total / totalHours) * 100}%` }}></div>
      </div>

      <ul className="space-y-1">
        {events.map((sel, index) => {
          const startTime = getHourLabel(sel.hour);
          const endTime = getHourLabel(sel.hour + sel.duration);
          return(
          <li key={index} className={`p-2 rounded flex justify-between items-center ${getActivityColor(sel.activity)}`}>
            <span><span className="font-semibold dark:text-white">{sel.activity}</span> - {days[sel.day-1]}: {startTime} - {endTime}</span>
            <button onClick={() => deleteSelection(index)} className="ml-4 text-sm text-red-700 dark:text-red-400 hover:underline"><Trash2 /></button>
          </li>
        )})}
      </ul>
    </div>
  );
};

export default EventsList;
