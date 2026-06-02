import React from 'react';
import { useSelection } from '../context/SelectionContext';
import { getCalendarWeeks, DAY_NAMES_SHORT } from '../lib/utils';
import { BarChart3, PieChart, TrendingUp, Flame } from 'lucide-react';

export default function SheetToolbar({ onToggleCoach, coachOpen, weekCount }) {
  const {
    currentMonth,
    activeWeekTab,
    activeDayFilter,
    setActiveWeekTab,
    setActiveDayFilter,
    setCurrentView,
  } = useSelection();

  const totalWeeks = weekCount || 5;

  const handleWeekClick = (idx) => {
    setActiveWeekTab(activeWeekTab === idx ? null : idx);
  };

  const handleDayClick = (idx) => {
    setActiveDayFilter(activeDayFilter === idx ? null : idx);
  };

  return (
    <div className="sheet-toolbar">
      {/* Week tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-slate-muted uppercase tracking-wider mr-1 hidden sm:inline">Weeks</span>
        {(() => {
          const calendarWeeks = getCalendarWeeks(currentMonth.year, currentMonth.month);
          return Array.from({ length: totalWeeks }, (_, i) => {
            const weekDays = calendarWeeks[i] || [];
            const datesStr = weekDays.map(d => d.dayNum).join(',');
            return (
              <button
                key={i}
                onClick={() => handleWeekClick(i)}
                className={`week-tab flex flex-col items-center py-1 px-3.5 min-w-[70px] ${activeWeekTab === i ? `active wt-${i + 1}` : ''}`}
                title={`Week ${i + 1}: ${datesStr}`}
              >
                <span className="text-xs font-bold leading-tight">W{i + 1}</span>
                <span className="text-[8px] opacity-80 font-mono font-medium leading-none mt-0.5">
                  {datesStr}
                </span>
              </button>
            );
          });
        })()}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-sheet-border hidden sm:block" />

      {/* Day filter pills */}
      <div className="flex items-center gap-0.5">
        <span className="text-[10px] font-semibold text-slate-muted uppercase tracking-wider mr-1 hidden sm:inline">Days</span>
        {DAY_NAMES_SHORT.map((day, idx) => (
          <button
            key={day}
            onClick={() => handleDayClick(idx)}
            className={`day-pill ${activeDayFilter === idx ? 'active' : ''}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-sheet-border hidden sm:block" />

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={() => setCurrentView('daily')}
          className="toolbar-btn active-spring"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Daily</span>
        </button>
        <button
          onClick={() => setCurrentView('weekly')}
          className="toolbar-btn active-spring"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Weekly</span>
        </button>
        <button
          onClick={() => setCurrentView('monthly')}
          className="toolbar-btn active-spring"
        >
          <PieChart className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Monthly</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-sheet-border hidden sm:block" />

        <button
          onClick={onToggleCoach}
          className={`toolbar-btn active-spring ${coachOpen ? 'active' : ''}`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Coach</span>
        </button>
      </div>
    </div>
  );
}
