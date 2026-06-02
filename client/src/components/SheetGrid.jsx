import React, { useEffect, useState, useRef } from 'react';
import { useSelection } from '../context/SelectionContext';
import {
  CATEGORY_COLORS, CATEGORY_ICONS, STATUS_COLORS, RAINBOW_WEEK_COLORS,
  API_BASE, DAY_NAMES_FULL, getCalendarWeeks, getDaysInMonth
} from '../lib/utils';
import socket from '../lib/socket';
import {
  CheckCircle, AlertTriangle, Timer, Minus, Plus,
  Edit3, Trash2, Target, Clock, TrendingUp, TrendingDown,
} from 'lucide-react';
import PieChartView from './PieChartView';
import BarChartView from './BarChartView';

export default function SheetGrid({ onEditActivity }) {
  const {
    currentMonth, selection, selectDay,
    activeWeekTab, activeDayFilter,
  } = useSelection();

  const { year, month } = currentMonth;
  const [monthData, setMonthData] = useState({});
  const [loading, setLoading] = useState(false);
  const weekRefs = useRef([]);

  const today = new Date().toISOString().split('T')[0];

  // Build calendar weeks
  const calendarWeeks = getCalendarWeeks(year, month);

  // Fetch entire month data
  const fetchMonthData = async () => {
    setLoading(true);
    try {
      const daysInMonth = getDaysInMonth(year, month);
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

      const res = await fetch(`${API_BASE}/activities/range/${startDate}/${endDate}`);
      const days = await res.json();
      const map = {};
      days.forEach((d) => {
        map[d.date] = d.activities || [];
      });
      setMonthData(map);
    } catch {
      setMonthData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthData();

    const handleUpdate = () => fetchMonthData();
    window.addEventListener('activity-added', handleUpdate);
    socket.on('activity-updated', handleUpdate);
    return () => {
      window.removeEventListener('activity-added', handleUpdate);
      socket.off('activity-updated', handleUpdate);
    };
  }, [year, month]);

  // Auto-scroll to active week tab
  useEffect(() => {
    if (activeWeekTab !== null && weekRefs.current[activeWeekTab]) {
      weekRefs.current[activeWeekTab].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeWeekTab]);

  // Handlers
  const handleUpdateMinutes = async (date, activity, increment) => {
    const newMinutes = Math.max(0, (activity.actualMinutes || 0) + increment);
    handleSetMinutes(date, activity, newMinutes);
  };

  const handleSetMinutes = async (date, activity, newMinutes) => {
    try {
      const res = await fetch(`${API_BASE}/activities/${date}/${activity._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualMinutes: newMinutes }),
      });
      const data = await res.json();
      setMonthData(prev => ({ ...prev, [date]: data.activities || [] }));
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDelete = async (date, activity) => {
    try {
      const res = await fetch(`${API_BASE}/activities/${date}/${activity._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      setMonthData(prev => ({ ...prev, [date]: data.activities || [] }));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleCheckbox = (date, activity, checked) => {
    if (checked) {
      handleSetMinutes(date, activity, activity.plannedMinutes);
    } else {
      handleSetMinutes(date, activity, 0);
    }
  };

  const handleCreateActivityOnDate = async (date, templateAct) => {
    try {
      const res = await fetch(`${API_BASE}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          activity: {
            name: templateAct.name,
            category: templateAct.category,
            plannedMinutes: templateAct.plannedMinutes,
            timeRange: templateAct.timeRange,
            actualMinutes: templateAct.plannedMinutes, // Directly complete on click
            status: 'completed'
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMonthData(prev => ({ ...prev, [date]: data.activities || [] }));
        window.dispatchEvent(new CustomEvent('activity-added', { detail: data }));
      }
    } catch (err) {
      console.error('Failed to create activity:', err);
    }
  };

  const handleDeleteRow = async (name, instances) => {
    if (window.confirm(`Delete all instances of "${name}" from this week?`)) {
      try {
        const promises = Object.entries(instances).map(([date, act]) => {
          return fetch(`${API_BASE}/activities/${date}/${act._id}`, {
            method: 'DELETE',
          });
        });
        await Promise.all(promises);
        fetchMonthData();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  // Filter weeks based on active tab
  const visibleWeeks = activeWeekTab !== null
    ? [{ week: calendarWeeks[activeWeekTab], idx: activeWeekTab }]
    : calendarWeeks.map((week, idx) => ({ week, idx }));

  // Calculate overall stats
  const allActivities = Object.values(monthData).flat();
  const totalPlanned = allActivities.reduce((s, a) => s + (a.plannedMinutes || 0), 0);
  const totalActual = allActivities.reduce((s, a) => s + (a.actualMinutes || 0), 0);
  const completedCount = allActivities.filter((a) => a.status === 'completed').length;
  const laggingCount = allActivities.filter((a) => a.status === 'lagging').length;

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3.5 w-3.5 text-status-done" />;
      case 'lagging': return <AlertTriangle className="h-3.5 w-3.5 text-status-lag" />;
      default: return <Timer className="h-3.5 w-3.5 text-status-progress" />;
    }
  };

  if (loading) {
    return (
      <div className="sheet-container animate-fade-in">
        {/* Loading skeleton */}
        <div className="sheet-col-header">
          <div className="grid grid-cols-12 gap-2 px-4 py-3">
            {['', 'Activity', 'Category', 'Time', 'Planned', 'Actual', 'Progress', '', '', ''].map((_, i) => (
              <div key={i} className="h-3 rounded skeleton-bg" style={{ gridColumn: i === 1 ? 'span 3' : 'span 1' }} />
            ))}
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-3 border-b border-sheet-border">
            <div className="h-4 rounded skeleton-bg" style={{ width: `${60 + Math.random() * 30}%` }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats bar */}
      <div className="flex items-center gap-3 flex-wrap px-1">
        <div className="stat-chip">
          <Target className="h-3 w-3 text-neon-purple" />
          <span className="text-slate-primary font-bold">{totalPlanned}</span>
          <span className="text-slate-muted">min planned</span>
        </div>
        <div className="stat-chip">
          <Clock className="h-3 w-3 text-accent-blue" />
          <span className="text-slate-primary font-bold">{totalActual}</span>
          <span className="text-slate-muted">min actual</span>
        </div>
        <div className="stat-chip">
          <TrendingUp className="h-3 w-3 text-status-done" />
          <span className="text-status-done font-bold">{completedCount}</span>
          <span className="text-slate-muted">done</span>
        </div>
        <div className="stat-chip">
          <TrendingDown className="h-3 w-3 text-status-lag" />
          <span className="text-status-lag font-bold">{laggingCount}</span>
          <span className="text-slate-muted">lagging</span>
        </div>
      </div>

      {/* Main spreadsheet */}
      <div className="sheet-container overflow-x-auto">
        {/* Week sections */}
        {visibleWeeks.map(({ week, idx: weekIdx }) => {
          // Get date range text for this week
          const firstDay = week[0];
          const lastDay = week[6];
          const weekStart = new Date(firstDay.date + 'T00:00:00');
          const weekEnd = new Date(lastDay.date + 'T00:00:00');
          const rangeText = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

          // Group activities in this week
          const uniqueActivities = [];
          const uniqueActivityKeys = new Set();
          
          week.forEach((cell) => {
            const dayActs = monthData[cell.date] || [];
            dayActs.forEach((act) => {
              const key = `${act.name.toLowerCase().trim()}-${act.category}-${act.plannedMinutes}`;
              if (!uniqueActivityKeys.has(key)) {
                uniqueActivityKeys.add(key);
                uniqueActivities.push({
                  name: act.name,
                  category: act.category,
                  plannedMinutes: act.plannedMinutes,
                  timeRange: act.timeRange,
                  instances: {} // date -> act
                });
              }
              const uniqueAct = uniqueActivities.find(
                u => `${u.name.toLowerCase().trim()}-${u.category}-${u.plannedMinutes}` === key
              );
              if (uniqueAct) {
                uniqueAct.instances[cell.date] = act;
              }
            });
          });

          const weekActivitiesCount = uniqueActivities.length;

          return (
            <div
              key={weekIdx}
              ref={(el) => (weekRefs.current[weekIdx] = el)}
              className="min-w-[800px]"
            >
              {/* Week header stripe */}
              <div className={`week-header week-stripe-${weekIdx + 1}`}>
                <span className="text-sm font-black">W{weekIdx + 1}</span>
                <span className="opacity-80 text-xs font-normal">{rangeText}</span>
                <span className="ml-auto text-[10px] font-normal opacity-70">
                  {weekActivitiesCount} {weekActivitiesCount === 1 ? 'activity' : 'activities'}
                </span>
              </div>

              {/* Day dates sub-headers side-by-side */}
              {uniqueActivities.length > 0 && (
                <div className="sheet-col-header border-b border-sheet-border">
                  <div 
                    className="grid items-center px-4 py-2 gap-2"
                    style={{ gridTemplateColumns: 'minmax(150px, 3fr) 50px 60px repeat(7, 1fr) 85px' }}
                  >
                    <div className="text-left font-bold text-slate-secondary">Activity</div>
                    <div className="text-center font-bold text-slate-secondary">Cat</div>
                    <div className="text-center font-bold text-slate-secondary">Plan</div>
                    {week.map((cell) => {
                      const dateObj = new Date(cell.date + 'T00:00:00');
                      const weekdayShort = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                      const dayOfWeek = dateObj.getDay();
                      const isToday = cell.date === today;
                      const isSelected = selection.type === 'day' && selection.date === cell.date;
                      const isFilterActive = activeDayFilter === dayOfWeek;
                      
                      return (
                        <button
                          key={cell.date}
                          onClick={() => selectDay(cell.date)}
                          className={`text-center py-0.5 rounded transition-all cursor-pointer font-bold ${
                            isToday 
                              ? 'bg-accent-teal/15 text-accent-teal' 
                              : isSelected 
                              ? 'bg-accent-blue/15 text-accent-blue' 
                              : isFilterActive
                              ? 'bg-accent-blue/20 text-accent-blue-dark'
                              : 'text-slate-muted hover:bg-sheet-hover'
                          }`}
                          title={dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        >
                          <div className="text-[9px] uppercase leading-none">{weekdayShort}</div>
                          <div className="text-[11px] leading-tight font-mono">{cell.dayNum}</div>
                        </button>
                      );
                    })}
                    <div className="text-center font-bold text-slate-secondary">Actions</div>
                  </div>
                </div>
              )}

              {/* Grouped activity rows */}
              {uniqueActivities.map((uniqueAct, actIdx) => {
                return (
                  <div
                    key={uniqueAct.name + actIdx}
                    className="sheet-row animate-row-enter border-b border-sheet-border last:border-b-0"
                    style={{ animationDelay: `${actIdx * 30}ms` }}
                  >
                    <div 
                      className="grid items-center px-4 py-2 gap-2"
                      style={{ gridTemplateColumns: 'minmax(150px, 3fr) 50px 60px repeat(7, 1fr) 85px' }}
                    >
                      {/* 1. Activity Name & Category color dot */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-1 h-6 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[uniqueAct.category] || '#b2bec3' }}
                        />
                        <span className="text-sm font-semibold text-slate-primary truncate" title={uniqueAct.name}>
                          {uniqueAct.name}
                        </span>
                      </div>

                      {/* 2. Category Icon */}
                      <div className="text-center text-base">
                        {CATEGORY_ICONS[uniqueAct.category] || '📋'}
                      </div>

                      {/* 3. Planned Minutes */}
                      <div className="text-center text-xs font-mono font-bold text-slate-muted">
                        {uniqueAct.plannedMinutes}m
                      </div>

                      {/* 4. The 7 day columns */}
                      {week.map((cell) => {
                        const dateObj = new Date(cell.date + 'T00:00:00');
                        const dayOfWeek = dateObj.getDay();
                        const inst = uniqueAct.instances[cell.date];
                        const hasInstance = !!inst;
                        const isCompleted = hasInstance && inst.status === 'completed';
                        const actualMinutes = hasInstance ? (inst.actualMinutes || 0) : 0;
                        const isFilterActive = activeDayFilter === dayOfWeek;
                        
                        return (
                          <div 
                            key={cell.date}
                            className={`flex flex-col items-center justify-between py-1 relative group min-h-[68px] hover:bg-sheet-hover rounded transition-colors ${
                              isFilterActive ? 'bg-accent-blue/5' : ''
                            }`}
                          >
                            {hasInstance ? (
                              <>
                                {/* Top row: checkbox + actual minutes badge side-by-side */}
                                <div className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={isCompleted}
                                    onChange={(e) => handleCheckbox(cell.date, inst, e.target.checked)}
                                    className="sheet-checkbox active-spring z-10"
                                  />
                                  {actualMinutes > 0 && (
                                    <span className={`text-[9px] font-mono font-bold px-1 rounded ${
                                      isCompleted ? 'bg-status-done/15 text-status-done' : 'bg-accent-blue/15 text-accent-blue'
                                    }`}>
                                      {actualMinutes}m
                                    </span>
                                  )}
                                </div>
                                
                                {/* Bottom area: Always visible, clean 2x2 grid of adjust buttons */}
                                <div className="grid grid-cols-2 gap-0.5 mt-1 w-full max-w-[62px] z-10">
                                  <button
                                    onClick={() => handleUpdateMinutes(cell.date, inst, -30)}
                                    className="px-0.5 py-0.2 text-[8px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded hover:bg-rose-600 hover:text-white transition-all cursor-pointer active-spring"
                                    title="-30 min"
                                  >
                                    -30
                                  </button>
                                  <button
                                    onClick={() => handleUpdateMinutes(cell.date, inst, -15)}
                                    className="px-0.5 py-0.2 text-[8px] font-mono font-bold bg-amber-50 text-amber-600 border border-amber-100 rounded hover:bg-amber-600 hover:text-white transition-all cursor-pointer active-spring"
                                    title="-15 min"
                                  >
                                    -15
                                  </button>
                                  <button
                                    onClick={() => handleUpdateMinutes(cell.date, inst, 15)}
                                    className="px-0.5 py-0.2 text-[8px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded hover:bg-emerald-600 hover:text-white transition-all cursor-pointer active-spring"
                                    title="+15 min"
                                  >
                                    +15
                                  </button>
                                  <button
                                    onClick={() => handleUpdateMinutes(cell.date, inst, 30)}
                                    className="px-0.5 py-0.2 text-[8px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-600 hover:text-white transition-all cursor-pointer active-spring"
                                    title="+30 min"
                                  >
                                    +30
                                  </button>
                                </div>
                              </>
                            ) : (
                              <button
                                onClick={() => handleCreateActivityOnDate(cell.date, uniqueAct)}
                                className="w-4.5 h-4.5 rounded-full border border-dashed border-slate-light hover:border-accent-teal hover:bg-accent-teal/10 flex items-center justify-center text-[10px] text-slate-light hover:text-accent-teal transition-all cursor-pointer active-spring my-auto"
                                title={`Schedule on ${cell.date}`}
                              >
                                +
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* 5. Actions */}
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            const firstInst = Object.values(uniqueAct.instances)[0];
                            if (firstInst) {
                              selectDay(firstInst.date);
                              onEditActivity && onEditActivity({ ...firstInst, date: firstInst.date });
                            }
                          }}
                          className="action-icon-btn edit active-spring"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow(uniqueAct.name, uniqueAct.instances)}
                          className="action-icon-btn delete active-spring"
                          title="Delete all days"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty week state */}
              {weekActivitiesCount === 0 && (
                <div className="px-6 py-6 text-center text-xs text-slate-light">
                  No activities this week
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts row (below the spreadsheet) */}
      {allActivities.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-reveal-up">
          <div className="sheet-container p-4">
            <h3 className="text-xs font-semibold text-slate-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon-purple" />
              Category Breakdown
            </h3>
            <PieChartView activities={allActivities} />
          </div>
          <div className="sheet-container p-4">
            <h3 className="text-xs font-semibold text-slate-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-blue" />
              Planned vs Actual
            </h3>
            <BarChartView activities={allActivities} />
          </div>
        </div>
      )}
    </div>
  );
}
