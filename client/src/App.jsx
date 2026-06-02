import React, { useState, useEffect } from 'react';
import { SelectionProvider, useSelection } from './context/SelectionContext';
import Header from './components/Header';
import SheetToolbar from './components/SheetToolbar';
import SheetGrid from './components/SheetGrid';
import ActivityModal from './components/AddActivityModal';
import CoachPanel from './components/CoachPanel';
import AnalyzerPage from './components/AnalyzerPage';
import { API_BASE, getCalendarWeeks } from './lib/utils';
import socket from './lib/socket';

function AppContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editActivityData, setEditActivityData] = useState(null);
  const [completionPct, setCompletionPct] = useState(0);
  const [toast, setToast] = useState(null);
  const [coachOpen, setCoachOpen] = useState(false);
  const { selection, currentMonth, currentView, setCurrentView, selectDay } = useSelection();

  // Calculate 6-month completion percentage (starting June 5th)
  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        const start = '2026-06-05';
        const end = '2026-12-05';
        const res = await fetch(`${API_BASE}/activities/range/${start}/${end}`);
        const days = await res.json();
        
        let totalPlanned = 0;
        let totalActual = 0;
        days.forEach((day) => {
          const acts = day.activities || [];
          acts.forEach((a) => {
            totalPlanned += (a.plannedMinutes || 0);
            totalActual += (a.actualMinutes || 0);
          });
        });
        setCompletionPct(totalPlanned > 0 ? Math.min((totalActual / totalPlanned) * 100, 100) : 0);
      } catch {
        setCompletionPct(0);
      }
    };

    fetchCompletion();
    const handleUpdate = () => fetchCompletion();
    socket.on('activity-updated', handleUpdate);
    window.addEventListener('activity-added', handleUpdate);
    return () => {
      socket.off('activity-updated', handleUpdate);
      window.removeEventListener('activity-added', handleUpdate);
    };
  }, []);

  // Socket toast for lagging alerts
  useEffect(() => {
    const handleAlert = (data) => {
      setToast(data.message);
      setTimeout(() => setToast(null), 5000);
    };
    socket.on('lagging-alert', handleAlert);
    return () => socket.off('lagging-alert', handleAlert);
  }, []);

  const handleAddActivity = async (submittedDate, activity) => {
    const date = submittedDate;
    let res;

    if (activity._id) {
      if (editActivityData && editActivityData.originalDate && editActivityData.originalDate !== date) {
        await fetch(`${API_BASE}/activities/${editActivityData.originalDate}/${activity._id}`, {
          method: 'DELETE',
        });
        const { _id, ...activityWithoutId } = activity;
        res = await fetch(`${API_BASE}/activities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, activity: activityWithoutId }),
        });
      } else {
        res = await fetch(`${API_BASE}/activities/${date}/${activity._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activity),
        });
      }
    } else {
      res = await fetch(`${API_BASE}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, activity }),
      });
    }

    if (!res.ok) throw new Error('Failed to save activity');

    const data = await res.json();
    window.dispatchEvent(new CustomEvent('activity-added', { detail: data }));

    selectDay(date);
    setCurrentView('tracker');



    setEditActivityData(null);
    return data;
  };

  const handleEditClick = (activity) => {
    setEditActivityData({ ...activity, originalDate: activity.date || selection.date });
    setModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditActivityData(null);
    setModalOpen(true);
  };

  // Calculate week count for toolbar
  const calendarWeeks = getCalendarWeeks(currentMonth.year, currentMonth.month);
  const weekCount = calendarWeeks.length;

  return (
    <div className="min-h-screen bg-sheet-bg flex flex-col">
      {/* Header */}
      <Header
        onAddActivity={handleOpenNewModal}
        completionPct={completionPct}
      />

      {currentView === 'tracker' ? (
        <>
          {/* Toolbar */}
          <SheetToolbar
            onToggleCoach={() => setCoachOpen(!coachOpen)}
            coachOpen={coachOpen}
            weekCount={weekCount}
          />

          {/* Main Grid */}
          <main className="flex-1 p-4 sm:p-6 max-w-[1600px] mx-auto w-full">
            <SheetGrid onEditActivity={handleEditClick} />

            {/* Collapsible Coach Panel */}
            {coachOpen && (
              <div className="mt-4 sheet-container p-6 coach-panel-enter">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🐍</span>
                  <h3 className="text-sm font-bold text-slate-primary uppercase tracking-wider font-heading">
                    Mamba Voice Coach
                  </h3>
                </div>
                <CoachPanel />
              </div>
            )}
          </main>
        </>
      ) : (
        <AnalyzerPage />
      )}

      {/* Activity Modal */}
      <ActivityModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditActivityData(null);
        }}
        onSubmit={handleAddActivity}
        selectedDate={
          selection.type === 'day' ? selection.date : new Date().toISOString().split('T')[0]
        }
        initialData={editActivityData}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 toast-enter">
          <div className="bg-white border border-status-lag/30 shadow-sheet-lg rounded-lg px-4 py-3 max-w-sm">
            <p className="text-sm text-slate-primary">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SelectionProvider>
      <AppContent />
    </SelectionProvider>
  );
}
