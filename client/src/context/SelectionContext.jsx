import React, { createContext, useContext, useState, useCallback } from 'react';

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
  const [selection, setSelectionState] = useState({
    type: 'day', // 'day' | 'week' | 'month'
    date: new Date().toISOString().split('T')[0],
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    week: null,
  });

  const [currentMonth, setCurrentMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  // Which week tab (0-5) is active in the toolbar (null = show all)
  const [activeWeekTab, setActiveWeekTab] = useState(null);

  // Which day filter (0-6, Sun-Sat) is active in the toolbar (null = show all)
  const [activeDayFilter, setActiveDayFilter] = useState(null);

  const selectDay = useCallback((dateStr) => {
    setSelectionState({
      type: 'day',
      date: dateStr,
      year: parseInt(dateStr.split('-')[0]),
      month: parseInt(dateStr.split('-')[1]) - 1,
      week: null,
    });
  }, []);

  const selectWeek = useCallback((year, month, weekNum) => {
    setSelectionState({
      type: 'week',
      date: null,
      year,
      month,
      week: weekNum,
    });
  }, []);

  const selectMonth = useCallback((year, month) => {
    setSelectionState({
      type: 'month',
      date: null,
      year,
      month,
      week: null,
    });
  }, []);

  const navigateMonth = useCallback((direction) => {
    setCurrentMonth((prev) => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;

      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      } else if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }

      return { year: newYear, month: newMonth };
    });
    // Reset week/day filters when navigating months
    setActiveWeekTab(null);
    setActiveDayFilter(null);
  }, []);

  const [currentView, setCurrentView] = useState('tracker'); // 'tracker' | 'daily' | 'weekly' | 'monthly'

  return (
    <SelectionContext.Provider
      value={{
        selection,
        currentMonth,
        currentView,
        activeWeekTab,
        activeDayFilter,
        selectDay,
        selectWeek,
        selectMonth,
        navigateMonth,
        setCurrentMonth,
        setCurrentView,
        setActiveWeekTab,
        setActiveDayFilter,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}

export default SelectionContext;
