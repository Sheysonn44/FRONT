// Experimental.jsx
import { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { Trash2, Copy, Pencil } from 'lucide-react';

const CalendarGrid = ({
  events,
  setEvents,
  getHourLabel,
  activities,
  days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  hours = Array.from({ length: 24 }, (_, i) => `${Math.floor(i / 2) + 6}:${i % 2 === 0 ? '00' : '30'}`),
  teacher,
}) => {
  const isDrawing = useRef(false);
  const newBoxRef = useRef(null);

  const [cellWidth, setCellWidth] = useState(120);
  const [cellHeight, setCellHeight] = useState(32);
  const [hourColumnWidth, setHourColumnWidth] = useState(80);
  const [highlightedHours, setHighlightedHours] = useState([]);
  const [hoveredHour, setHoveredHour] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newOverlayData, setNewOverlayData] = useState(null);
  const gridRef = useRef(null);
  const hourColumnRef = useRef(null);

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

  const handleMouseDown = (e) => {
    if (e.target.closest('.rnd-block')) return;
    
    const container = gridRef.current.getBoundingClientRect();
    const startX = e.clientX - container.left;
    const startY = e.clientY - container.top;

    isDrawing.current = true;

    const newDay = Math.floor((startX - hourColumnWidth) / cellWidth) + 1;
    const newHour = Math.floor(startY / cellHeight);

    if (newDay < 1 || newDay > days.length || newHour < 0 || newHour >= hours.length) return;

    const newOverlay = {
      id: Date.now(),
      day: newDay,
      hour: newHour,
      duration: 1,
      activity: "AP",
      teacher: teacher
    };

    newBoxRef.current = newOverlay;
    setEvents(prev => [...prev, newOverlay]);

   

    const handleMouseMove = (moveEvent) => {
      if (!isDrawing.current) return;

      const currentY = moveEvent.clientY - container.top;
      const newDuration = Math.max(1, Math.round((currentY - newHour * cellHeight) / cellHeight));

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

   const isOverlapping = (a, b) => {
        return a.day === b.day &&
        a.hour < b.hour + b.duration &&
        b.hour < a.hour + a.duration;
    };

    const getOverlayStyle = (current, all) => {
        const overlapping = all.filter(other =>
        other.id !== current.id && isOverlapping(current, other)
        );

        const isSmaller = overlapping.some(o => current.duration <= o.duration);

        return isSmaller
        ? {
            border: '2px solid white',
            transform: `translateX(6px)`
            }
            : {};
    };

  const handleCellClick = (day, hour) => {
    if (day < 1 || day > days.length) return;
    const exists = events.find(b => b.day === day && hour >= b.hour && hour < b.hour + b.duration);
    if (exists) return;
    setNewOverlayData({ day, hour });
    setShowModal(true);
  };

  const handleOverlayUpdate = (index, newDay, newHour, newDuration) => {
    if (newDay < 1 || newDay > days.length) return;
    const updated = events.map((o, i) =>
      i === index ? { ...o, day: newDay, hour: newHour, duration: newDuration, activity: o.activity } : o
    );
    setEvents(updated);
    setHighlightedHours(Array.from({ length: newDuration }, (_, k) => newHour + k));
  };

  const handleDelete = (index) => {
    const filtered = events.filter((_, i) => i !== index);
    setEvents(filtered);
    setHighlightedHours([]);
  };

  const handleDuplicate = (index) => {
    const copy = { ...events[index] };
    setEvents([...events, copy]);
  };

  const handleEditActivity = (index) => {
    const task = events[index];
    const activity = prompt("Ingrese nueva actividad (AP, BP):", task.activity);
    if (activity && activities[activity]) {
      const updated = events.map((o, i) =>
        i === index ? { ...o, activity: activity } : o
      );
      setEvents(updated);
    }
  };

  const addNewOverlay = (activity) => {
    const { day, hour } = newOverlayData;
    const newOverlay = { day, hour, duration: 2, activity };
    setEvents([...events, newOverlay]);
    setHighlightedHours([hour, hour + 1]);
    setShowModal(false);
    setNewOverlayData(null);
  };

  return (
    <div className="relative">
      <div className="relative" ref={gridRef} onMouseDown={handleMouseDown}>
      
        <div className="grid grid-cols-[80px_repeat(6,1fr)]" style={{ position: 'relative' }}>
          {[...Array(hours.length)].map((_, rowIndex) => (
            <>
              <div
                key={`hour-${rowIndex}`}
                role="hour-row"
                ref={rowIndex === 0 ? hourColumnRef : null}
                className="h-8 text-xs flex items-center justify-center text-gray-500"
                style={{
                  backgroundColor: highlightedHours.includes(rowIndex) || hoveredHour === rowIndex
                    ? 'rgba(16, 185, 129, 0.2)'
                    : undefined,
                }}
                onMouseEnter={() => setHoveredHour(rowIndex)}
                onMouseLeave={() => setHoveredHour(null)}
              >
                {hours[rowIndex]}
              </div>
              {days.map((_, colIndex) => (
                <div
                  key={`cell-${colIndex + 1}-${rowIndex}`}
                  role="day-col"
                  onClick={() => handleCellClick(colIndex + 1, rowIndex)}
                  style={{
                    height: `${cellHeight}px`,
                    backgroundColor: colIndex % 2 === 0 ? '#f9fafb' : '#f3f4f6',
                  }}
                />
              ))}
            </>
          ))}
        </div>

        {events.map((block, i) => {
          const style = getOverlayStyle(block, events);  
          const startTime = getHourLabel(block.hour);
          const endTime = getHourLabel(block.hour + block.duration);
          const dayLabel = days[block.day - 1] || '';
          return (
            <Rnd
              key={`overlay-${i}`}
              size={{ width: cellWidth, height: block.duration * cellHeight }}
              position={{ x: hourColumnWidth + ((block.day - 1) * cellWidth), y: block.hour * cellHeight }}
              minHeight={cellHeight}
              onDragStop={(e, d) => {
                const newDay = Math.round(((d.x - hourColumnWidth)/ cellWidth)+1); //
                const newHour = Math.round(d.y / cellHeight);
                if (newDay < 1) return;
                handleOverlayUpdate(i, newDay, newHour, block.duration);
              }}
              onResize={(e, direction, ref, delta, position) => {
                const newHour = Math.round(position.y / cellHeight);
                const newDuration = Math.round(ref.offsetHeight / cellHeight);
                const newDay = Math.round(((position.x - hourColumnWidth)/ cellWidth)+1);
                setHighlightedHours(Array.from({ length: newDuration }, (_, k) => newHour + k));
                const updated = events.map((o, idx) =>
                  idx === i
                    ? {
                        ...o,
                        day: newDay,
                        hour: newHour,
                        duration: newDuration,
                        activity: o.activity,
                      }
                    : o
                );
                setEvents(updated);
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const newDuration = Math.round(ref.offsetHeight / cellHeight);
                const newDay = Math.round(((position.x - hourColumnWidth)/ cellWidth)+1);
                const newHour = Math.round(position.y / cellHeight);
                if (newDay < 1) return;
                handleOverlayUpdate(i, newDay, newHour, newDuration);
              }}
              bounds="parent"
              enableResizing={{ bottom: true, top: true }}
              dragGrid={[cellWidth, cellHeight]}
              resizeGrid={[cellWidth, cellHeight]}
              className={`absolute rounded rnd-block text-white text-xs flex flex-col justify-between px-2 py-1 cursor-move shadow ${activities[block.activity].bgColor || 'bg-emerald-500' }`}
              style={{ backgroundColor: activities[block.activity]?.bgColor || 'bg-emerald-500', ...style }}
            >
              <div className="absolute top-1 right-1 flex gap-1">
                <button onClick={() => handleDuplicate(i)} className="text-white hover:text-blue-200">
                  <Copy size={14} />
                </button>
                <button onClick={() => handleEditActivity(i)} className="text-white hover:text-yellow-200">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(i)} className="text-white hover:text-red-200">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-4">
                <div className="text-sm font-semibold">{block.activity}</div>
                <div className="text-xs">{dayLabel} {startTime} - {endTime}</div>
              </div>
            </Rnd>
          );
        })}

        {showModal && (
          <div className="absolute inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-lg font-bold mb-4">Seleccione una actividad</h2>
                <div className="flex gap-4">
                {Object.keys(activities).map((key) => {
                    // Asumiendo que activities[key] es un string tipo "bg-blue-600", no necesitas .bgColor
                    return (
                    <button
                        key={key}
                        onClick={() => addNewOverlay(key)}
                        className={`px-4 py-2 rounded text-white ${activities[key].bgColor}`}
                    >
                        {key}
                    </button>
                    );
                })}
                </div>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CalendarGrid;
