import React, { useState, useEffect } from 'react';
import { useSelection } from '../context/SelectionContext';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import CalendarDropdown from './CalendarDropdown';
import { MONTH_NAMES } from '../lib/utils';

export default function Header({ onAddActivity, completionPct }) {
  const { currentMonth, navigateMonth, selectMonth } = useSelection();
  const [animatedPct, setAnimatedPct] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Progressive fill animation from 0 to current percentage
  useEffect(() => {
    setAnimatedPct(0);
    const frame = setTimeout(() => {
      setAnimatedPct(completionPct);
    }, 100);
    return () => clearTimeout(frame);
  }, [completionPct]);

  return (
    <header className="sticky top-0 z-40 bg-black text-white border-b-2 border-accent-teal shadow-sheet-lg">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 max-w-[1600px] mx-auto">
        {/* Left — Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="/monitor.png" alt="Monitor Icon" className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md" />
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white font-heading">
                MAMBA <span className="text-accent-teal font-bold">TRACKER</span>
              </h1>
              <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase hidden sm:block">
                No days off
              </p>
            </div>
          </div>
        </div>

        {/* Center — Month Navigation with Calendar Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 relative">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-zinc-400 hover:text-white cursor-pointer active-spring"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCalendarOpen(!calendarOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/15 hover:bg-white/5 transition-all duration-300 cursor-pointer active-spring select-none"
          >
            <Calendar className="h-3.5 w-3.5 text-accent-teal" />
            <span className="text-sm sm:text-base font-bold text-white">
              {MONTH_NAMES[currentMonth.month]}
            </span>
            <span className="text-xs sm:text-sm text-zinc-500 font-mono">
              {currentMonth.year}
            </span>
            <ChevronLeft className={`h-3 w-3 text-zinc-500 transition-transform duration-200 ${calendarOpen ? 'rotate-90' : '-rotate-90'}`} />
          </button>

          <button
            onClick={() => navigateMonth(1)}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-zinc-400 hover:text-white cursor-pointer active-spring"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Calendar Dropdown Popover */}
          <CalendarDropdown
            isOpen={calendarOpen}
            onClose={() => setCalendarOpen(false)}
          />
        </div>

        {/* Right — Actions + Progress */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Progress Bar */}
          <div className="hidden md:flex items-center gap-2 min-w-[140px]">
            <div className="flex-1 h-2.5 bg-zinc-200 border border-white/20 rounded-full overflow-hidden relative shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out progress-bar-shimmer"
                style={{
                  width: `${animatedPct}%`,
                  backgroundImage: animatedPct >= 80 
                    ? 'linear-gradient(to right, #00b894, #059669, #51cf66)' 
                    : animatedPct >= 40 
                    ? 'linear-gradient(to right, #ffa502, #ffd43b, #ffa502)' 
                    : 'linear-gradient(to right, #ff6b6b, #d63031, #ff6b6b)',
                }}
              />
            </div>
            <span className="text-xs font-mono text-zinc-200 font-bold w-10 text-right">
              {Math.round(animatedPct)}%
            </span>
          </div>

          {/* Add Activity Button */}
          <button
            onClick={onAddActivity}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-teal hover:bg-accent-teal-dark text-white text-xs sm:text-sm font-semibold transition-all duration-200 active-spring cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Activity</span>
          </button>
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="md:hidden px-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2.5 bg-zinc-200 border border-white/20 rounded-full overflow-hidden relative shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out progress-bar-shimmer"
              style={{
                width: `${animatedPct}%`,
                backgroundImage: animatedPct >= 80 
                  ? 'linear-gradient(to right, #00b894, #059669, #51cf66)' 
                  : animatedPct >= 40 
                  ? 'linear-gradient(to right, #ffa502, #ffd43b, #ffa502)' 
                  : 'linear-gradient(to right, #ff6b6b, #d63031, #ff6b6b)',
              }}
            />
          </div>
          <span className="text-xs font-mono text-zinc-200 font-bold">{Math.round(animatedPct)}%</span>
        </div>
      </div>
    </header>
  );
}
