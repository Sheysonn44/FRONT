import { useState} from 'react';
const CalendarHeader = ({
      teachersList,
      selectedTeachers,
      setSelectedTeachers,
      showAssignments,
      setShowAssignments,
      days, 
      events, 
      classRooms, 
      selectedClassRoom,
      setSelectedClassRoom}) =>{
  return(
 <div>
  <div className="flex items-center justify-between mb-2 gap-4">
      <div className="grid grid-cols-1 sm:grid-rows-3 gap-4 mb-2">
        <div className="flex flex-row">
          {teachersList.map((t, i) => (
            <label key={i} className="text-sm">
              <input
                type="checkbox"
                className="mr-1"
                checked={selectedTeachers.includes(t)}
                onChange={() => {
                  setSelectedTeachers(prev =>
                    prev.includes(t) ? prev.filter(p => p !== t) : [...prev, t]
                  );
                }}
              /> {t}
            </label>
          ))}
        </div>

        <div className="flex flex-row">
          <label className="text-sm mb-1">Aula:&nbsp;&nbsp;&nbsp;&nbsp;</label>
          {classRooms.map((room, index) => (
            <label key={index} className="text-sm mb-1 flex items-center">
              <input
                type="radio"
                name="classRoom"
                value={room}
                checked={selectedClassRoom === room}
                onChange={() => setSelectedClassRoom(room)}
                className="mr-2"
              />
              {room} &nbsp;&nbsp;&nbsp;  
            </label>
          ))}
        </div>

        <div className="flex flex-row justify-center">
          <label className="text-sm">
            <input
              type="checkbox"
              className="mr-1"
              checked={showAssignments}
              onChange={() => setShowAssignments(prev => !prev)}
            /> Mostrar asignaciones
          </label>
        </div>
      </div>
      </div>
 <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1">
    <div>
        
    </div>
    {days.map((day, index) => (
      <div
        key={index} 
        className="text-center font-semibold p-2 border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:text-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {day}
      </div>
      
    ))}
    </div>
    <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1">
      <div>
        
      </div>
            {days.map((_, dayIndex) => (
              <div key={dayIndex + 1} className="text-center text-xs text-gray-600 dark:text-gray-400 p-1 border-t">
                { (() => {
                  const index = dayIndex + 1;
                  const blocksUsed = events.filter(sel => sel.day === index).reduce((sum, sel) => sum + sel.duration, 0);
                  const hoursUsed = (blocksUsed / 2);
             
                  return `${hoursUsed}h`;
                })()}
              </div>
            ))}
          </div>
  </div>
  
)};

export default CalendarHeader;
