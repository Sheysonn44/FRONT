// CalendarHeader.jsx
const CalendarHeader = ({ days, events, maxHoursPerDay }) => (
 <div>
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
                  const percent = ((blocksUsed / (maxHoursPerDay * 2)) * 100);
                  return `${hoursUsed}h / ${maxHoursPerDay}h (${percent.toFixed(2)}%)`;
                })()}
              </div>
            ))}
          </div>
  </div>
  
);

export default CalendarHeader;
