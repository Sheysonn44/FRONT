// ActivityProgressBars.jsx
const ActivityProgressBars = ({ activities, events, getActivityColor }) => (
  <div className="space-y-2 mb-4">
    {Object.entries(activities).map(([key]) => {
      const used = events
        .filter(sel => sel.activity === key)
        .reduce((sum, sel) => sum + (sel.duration / 2), 0);
      const percent = (used) * 100;
      return (
        <div key={key}>
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{key}: {(used)}</div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
            <div className={`${getActivityColor(key)} h-full`} style={{ width: `${percent}%` }}></div>
          </div>
        </div>
      );
    })}
  </div>
);

export default ActivityProgressBars;
