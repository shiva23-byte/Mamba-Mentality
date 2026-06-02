import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelection } from '../context/SelectionContext';
import { getDaysInMonth, getFirstDayOfMonth, getCalendarWeeks, CATEGORY_COLORS, API_BASE, cn } from '../lib/utils';
import socket from '../lib/socket';

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CalendarDropdown({ isOpen, onClose }) {
  const { currentMonth, selection, selectDay } = useSelection();
  const { year, month } = currentMonth;
  const [monthData, setMonthData] = useState({});
  const popoverRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Fetch month data for dot indicators
  const fetchMonthData = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    fetch(`${API_BASE}/activities/range/${startDate}/${endDate}`)
      .then((res) => res.json())
      .then((days) => {
        const map = {};
        days.forEach((d) => {
          map[d.date] = d.activities || [];
        });
        setMonthData(map);
      })
      .catch(() => setMonthData({}));
  };

  useEffect(() => {
    if (isOpen) {
      fetchMonthData();
    }
  }, [year, month, isOpen]);

  // Listen for updates
  useEffect(() => {
    const handleUpdate = () => { if (isOpen) fetchMonthData(); };
    window.addEventListener('activity-added', handleUpdate);
    socket.on('activity-updated', handleUpdate);
    return () => {
      window.removeEventListener('activity-added', handleUpdate);
      socket.off('activity-updated', handleUpdate);
    };
  }, [isOpen, year, month]);

  const today = new Date().toISOString().split('T')[0];

  const calendarWeeks = useMemo(() => getCalendarWeeks(year, month), [year, month]);

  if (!isOpen) return null;

  return (
    <div ref={popoverRef} className="calendar-popover animate-slide-down">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-semibold text-slate-muted py-1 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-0.5">
        {calendarWeeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-1">
            {week.map((cell) => {
              const isSelected = selection.type === 'day' && selection.date === cell.date;
              const isToday = cell.date === today;
              const activities = monthData[cell.date] || [];
              const categories = [...new Set(activities.map((a) => a.category))];

              // Completion ring
              const totalPlanned = activities.reduce((s, a) => s + (a.plannedMinutes || 0), 0);
              const totalActual = activities.reduce((s, a) => s + (a.actualMinutes || 0), 0);
              const completionPct = totalPlanned > 0 ? Math.min((totalActual / totalPlanned) * 100, 100) : 0;

              return (
                <button
                  key={cell.date}
                  onClick={() => {
                    selectDay(cell.date);
                    onClose();
                  }}
                  className={cn(
                    'relative flex flex-col items-center p-1 rounded-md transition-all duration-200 cursor-pointer min-h-[36px] text-xs',
                    cell.isCurrentMonth ? 'text-slate-primary' : 'text-slate-light',
                    isSelected
                      ? 'bg-accent-teal text-white font-bold shadow-sm'
                      : 'hover:bg-sheet-hover',
                    isToday && !isSelected && 'bg-accent-teal/10 font-bold text-accent-teal'
                  )}
                >
                  <span className="font-medium">{cell.dayNum}</span>

                  {/* Category dots */}
                  {categories.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {categories.slice(0, 3).map((cat) => (
                        <div
                          key={cat}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[cat] || '#b2bec3' }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Completion indicator ring */}
                  {totalPlanned > 0 && (
                    <div
                      className="absolute inset-0 rounded-md pointer-events-none"
                      style={{
                        boxShadow: completionPct >= 100
                          ? 'inset 0 0 0 2px #00b894'
                          : completionPct >= 50
                          ? 'inset 0 0 0 1.5px #fdcb6e'
                          : 'inset 0 0 0 1.5px #d63031',
                        opacity: 0.4,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
