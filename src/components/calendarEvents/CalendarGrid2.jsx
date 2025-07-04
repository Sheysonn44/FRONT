// CalendarGrid.jsx
const CalendarGrid = ({
  days,
  hours,
  getCellClass,
  handleMouseDown,
  handleMouseEnter,
  handleDragStart,
  handleDragOver,
  handleDrop,
  isFirstSelectedBlock,
  overlayBlocks = []
}) => (
  <div className="relative">
    {/* Overlay de selección encima del grid */}
    {overlayBlocks.map((block, i) => {
      const cellHeight = 32; // equivalente a h-8 en Tailwind
      const colWidthPercent = 100 / 6; // 6 columnas (lunes a sábado)
      const top = `${block.hour * cellHeight}px`;
      const left = `${(block.day - 1) * colWidthPercent}%`;

      return (
        <div
          key={`overlay-${i}`}
          className="absolute z-10 bg-blue-400 opacity-40 rounded"
          style={{
            top,
            left,
            width: `${colWidthPercent}%`,
            height: `${cellHeight}px`,
          }}
        />
      );
    })}

    {/* Grilla del calendario */}
    <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1">
      {days.map((_, dayIndex) => (
        <div
          key={dayIndex}
          className="flex flex-col"
          onDragOver={(e) => handleDragOver && handleDragOver(e)}
          onDrop={(e) => handleDrop && handleDrop(e, dayIndex)}
        >
          {hours.map((hour, hourIndex) => (
            dayIndex === 0 ? (
              <div
                key={hourIndex}
                className="border h-8 flex items-center justify-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 select-none"
              >
                {hour}
              </div>
            ) : (
              <div
                key={hourIndex}
                draggable={isFirstSelectedBlock && isFirstSelectedBlock(dayIndex, hourIndex)}
                onDragStart={(e) => handleDragStart && handleDragStart(e, dayIndex)}
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
);

export default CalendarGrid;
