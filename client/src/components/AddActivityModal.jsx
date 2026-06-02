import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Plus, Clock, Zap, Calendar, Edit3 } from 'lucide-react';

const CATEGORIES = ['Education', 'Fitness', 'Project', 'Work'];

const CATEGORY_ICONS = {
  Education: '📚',
  Fitness: '💪',
  Project: '🚀',
  Work: '💼',
};

export default function ActivityModal({ open, onOpenChange, onSubmit, selectedDate, initialData }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [plannedMinutes, setPlannedMinutes] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTiltStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`);
  };

  const handleMouseLeave = () => {
    setTiltStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name || '');
        setCategory(initialData.category || '');
        setPlannedMinutes(initialData.plannedMinutes ? String(initialData.plannedMinutes) : '');
        setTimeRange(initialData.timeRange || '');
        setDate(initialData.date || selectedDate || new Date().toISOString().split('T')[0]);
      } else {
        setName('');
        setCategory('');
        setPlannedMinutes('');
        setTimeRange('');
        setDate(selectedDate || new Date().toISOString().split('T')[0]);
      }
    }
  }, [open, selectedDate, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !plannedMinutes || !date) return;

    setSubmitting(true);
    try {
      await onSubmit(date, {
        ...(initialData ? { _id: initialData._id } : {}),
        name: name.trim(),
        category,
        plannedMinutes: parseInt(plannedMinutes),
        timeRange: timeRange.trim(),
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save activity:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const quickTimes = [15, 30, 45, 60, 90, 120];
  const isEdit = !!initialData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transform: tiltStyle, transition: 'transform 0.08s ease-out' }}
          className="bg-white p-6 border border-sheet-border rounded-xl preserve-3d shadow-sheet-lg"
        >
          <DialogHeader className="translate-z-10">
          <DialogTitle className="flex items-center gap-2 text-slate-primary">
            <div className={`p-1.5 rounded-lg ${isEdit ? 'bg-neon-purple/10 border-neon-purple/20' : 'bg-accent-teal/10 border-accent-teal/20'} border`}>
              {isEdit ? <Edit3 className="h-4 w-4 text-neon-purple" /> : <Plus className="h-4 w-4 text-accent-teal" />}
            </div>
            {isEdit ? 'Edit Activity' : 'Add Activity'}
          </DialogTitle>
          <DialogDescription className="text-slate-muted">
            {isEdit ? 'Modify your scheduled activity details.' : 'Schedule a new activity and track your performance.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-secondary flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-muted" />
              Date
            </label>
            <input
              id="activity-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-sheet-bg border border-sheet-border text-slate-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-teal/30 focus:border-accent-teal/50 transition-all duration-200"
              required
            />
          </div>

          {/* Activity Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-secondary">Activity Name</label>
            <input
              id="activity-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., PDF Study, Chest Day, React Project..."
              className="w-full h-10 px-3 rounded-lg bg-sheet-bg border border-sheet-border text-slate-primary text-sm placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-accent-teal/30 focus:border-accent-teal/50 transition-all duration-200"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-secondary">Category</label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="activity-category">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        <span>{CATEGORY_ICONS[cat]}</span>
                        <span>{cat}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-secondary">Time Format</label>
              <input
                id="activity-timerange"
                type="text"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                placeholder="e.g. 9AM to 10AM"
                className="w-full h-10 px-3 rounded-lg bg-sheet-bg border border-sheet-border text-slate-primary text-sm placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-accent-teal/30 focus:border-accent-teal/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Planned Minutes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-secondary flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-muted" />
              Planned Time (minutes)
            </label>
            <input
              id="planned-minutes"
              type="number"
              value={plannedMinutes}
              onChange={(e) => setPlannedMinutes(e.target.value)}
              placeholder="60"
              min="1"
              max="720"
              className="w-full h-10 px-3 rounded-lg bg-sheet-bg border border-sheet-border text-slate-primary text-sm placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-accent-teal/30 focus:border-accent-teal/50 transition-all duration-200"
              required
            />
            {/* Quick time buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickTimes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPlannedMinutes(String(t))}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all duration-200 cursor-pointer ${
                    parseInt(plannedMinutes) === t
                      ? 'bg-accent-teal/15 border-accent-teal/50 text-accent-teal font-semibold'
                      : 'bg-sheet-bg border-sheet-border text-slate-muted hover:text-slate-secondary hover:border-sheet-border-dark'
                  }`}
                >
                  {t >= 60 ? `${t / 60}h` : `${t}m`}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-muted hover:text-slate-primary"
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={!name || !category || !plannedMinutes || !date || submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-teal hover:bg-accent-teal-dark text-white text-sm font-semibold transition-all duration-200 active-spring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5" />
              {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Lock It In')}
            </button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
