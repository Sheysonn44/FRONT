// CalendarGrid.jsx
import { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { Trash2 } from 'lucide-react';

const CalendarGrid = ({
  events,
  suggestions,
  setEvents,
  getHourLabel,
  activities,
  days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  hours = Array.from({ length: 36 }, (_, i) => `${Math.floor(i / 2) + 6}:${i % 2 === 0 ? '00' : '30'}`),
  teacher,
  selectedTeachers, 
  showAssignments,
  selectedClassroom,
}) => {
  const isDrawing = useRef(false);
  const newBoxRef = useRef(null);
  const gridRef = useRef(null);
  const hourColumnRef = useRef(null);

  const [cellWidth, setCellWidth] = useState(120);
  const [cellHeight, setCellHeight] = useState(32);
  const [hourColumnWidth, setHourColumnWidth] = useState(80);
  
  


  useEffect(() => {
    const updateDimensions = () => {
      if (gridRef.current) {
        const cols = gridRef.current.querySelectorAll('div[role="day-col"]');
        if (cols.length > 0) setCellWidth(cols[0].offsetWidth);
        const rows = gridRef.current.querySelectorAll('div[role="hour-row"]');
        if (rows.length > 0) setCellHeight(rows[0].offsetHeight);
        if (hourColumnRef.current) setHourColumnWidth(hourColumnRef.current.offsetWidth);
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const isWithinSuggestions = (day, hour, duration = 1) => {
    return suggestions.some(sug =>
      sug.day === day &&
      hour >= sug.hour &&
      hour + duration <= sug.hour + sug.duration &&
      selectedTeachers.includes(sug.teacher)
    );
  };

  const getTeacherColor = (teacherName) => {
    const colors = [
      'rgba(59,130,246,0.2)',
      'rgba(16,185,129,0.2)',
      'rgba(234,179,8,0.2)',
      'rgba(239,68,68,0.2)',
      'rgba(168,85,247,0.2)',
      'rgba(253,224,71,0.2)'
    ];
    const index = teacherName?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

    const findOverlaps = (allSuggestions) => {
    const overlaps = [];
    for (let i = 0; i < allSuggestions.length; i++) {
      for (let j = i + 1; j < allSuggestions.length; j++) {
        const a = allSuggestions[i];
        const b = allSuggestions[j];
        if (
          a.teacher !== b.teacher &&
          a.day === b.day &&
          a.hour < b.hour + b.duration &&
          b.hour < a.hour + a.duration
        ) {
          overlaps.push(a.id);
          overlaps.push(b.id);
        }
      }
    }
    return new Set(overlaps);
  };

  const overlappingSuggestions = findOverlaps(suggestions);

  const handleMouseDown = (e) => {
    if (selectedTeachers.length !== 1 || e.target.closest('.rnd-block')) return;

    const container = gridRef.current.getBoundingClientRect();
    const startX = e.clientX - container.left;
    const startY = e.clientY - container.top;

    const newDay = Math.floor((startX - hourColumnWidth) / cellWidth) + 1;
    const newHour = Math.floor(startY / cellHeight);

    if (newDay < 1 || newDay > days.length || newHour < 0 || newHour >= hours.length) return;
    if (!isWithinSuggestions(newDay, newHour)) return;

    isDrawing.current = true;

    const newOverlay = {
      id: Date.now(),
      day: newDay,
      hour: newHour,
      duration: 1,
      activity: "AP",
      teacher: selectedTeachers[0],
      classRoom: selectedClassroom
    };

    newBoxRef.current = newOverlay;
    setEvents(prev => [...prev, newOverlay]);

    const handleMouseMove = (moveEvent) => {
      if (!isDrawing.current) return;

      const currentY = moveEvent.clientY - container.top;
      const newDuration = Math.max(1, Math.round((currentY - newHour * cellHeight) / cellHeight));

      if (!isWithinSuggestions(newDay, newHour, newDuration)) return;

      setEvents(prev => prev.map(block =>
        block.id === newOverlay.id
          ? { ...block, duration: newDuration }
          : block
      ));
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const tryUpdateEvent = (index, newDay, newHour, newDuration) => {
    if (newDay < 1 || newDay > days.length || newHour < 0 || newHour + newDuration > hours.length) return;
    if (!isWithinSuggestions(newDay, newHour, newDuration)) return;

    setEvents(prev => prev.map((e, i) => i === index ? { ...e, day: newDay, hour: newHour, duration: newDuration } : e));
  };

  return (
    <div className="relative">
      

      <div className="relative" ref={gridRef} onMouseDown={handleMouseDown}>
        <div className="grid grid-cols-[80px_repeat(6,1fr)]">
          {[...Array(hours.length)].map((_, rowIndex) => (
            <>
              <div
                key={`hour-${rowIndex}`}
                role="hour-row"
                ref={rowIndex === 0 ? hourColumnRef : null}
                className="h-8 text-xs flex items-center justify-center text-gray-500 select-none"
              >
                {hours[rowIndex]}
              </div>
              {days.map((_, colIndex) => (
                <div
                  key={`cell-${colIndex + 1}-${rowIndex}`}
                  role="day-col"
                  style={{
                    height: `${cellHeight}px`,
                    backgroundColor: colIndex % 2 === 0 ? '#f9fafb' : '#f3f4f6',
                  }}
                />
              ))}
            </>
          ))}
        </div>

        {suggestions
          .filter(block => selectedTeachers.length === 0 || selectedTeachers.includes(block.teacher))
          .map((block, i) => (
            <div
              key={`sug-${i}`}
              style={{
                width: `${cellWidth}px`,
                height: `${block.duration * cellHeight}px`,
                left: `${hourColumnWidth + (block.day - 1) * cellWidth}px`,
                top: `${block.hour * cellHeight}px`,
                backgroundColor: overlappingSuggestions.has(block.id)
                ? 'rgba(239, 68, 68, 0.4)' // rojo más fuerte si se superpone
                : getTeacherColor(block.teacher || ''),
                border: '1px dashed gray',
                position: 'absolute',
                pointerEvents: 'none'
              }}
              className="rounded text-xs"
            />
          ))}

        {showAssignments && events.map((block, i) => (
          <Rnd
            key={`event-${i}`}
            size={{ width: cellWidth, height: block.duration * cellHeight }}
            position={{ x: hourColumnWidth + ((block.day - 1) * cellWidth), y: block.hour * cellHeight }}
            bounds="parent"
            enableResizing={{ bottom: true, top: true }}
            dragGrid={[cellWidth, cellHeight]}
            resizeGrid={[cellWidth, cellHeight]}
            onDragStop={(e, d) => {
              const newDay = Math.round((d.x - hourColumnWidth) / cellWidth) + 1;
              const newHour = Math.round(d.y / cellHeight);
              tryUpdateEvent(i, newDay, newHour, block.duration);
            }}
            onResizeStop={(e, dir, ref, delta, pos) => {
              const newDay = Math.round((pos.x - hourColumnWidth) / cellWidth) + 1;
              const newHour = Math.round(pos.y / cellHeight);
              const newDuration = Math.round(ref.offsetHeight / cellHeight);
              tryUpdateEvent(i, newDay, newHour, newDuration);
            }}
            className={`absolute rounded rnd-block text-white text-xs px-2 py-1 shadow ${activities[block.activity]?.bgColor || 'bg-emerald-500'}`}
          >
            <div className="absolute top-1 right-1 flex gap-1">
              <button onClick={() => {
                const updated = events.filter((_, idx) => idx !== i);
                setEvents(updated);
              }} className="text-white hover:text-red-200">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold">{block.teacher}-{block.classRoom}</div>
              <div className="text-xs">{days[block.day - 1]} {getHourLabel(block.hour)} - {getHourLabel(block.hour + block.duration)}</div>
            </div>
          </Rnd>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
