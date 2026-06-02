import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const API_BASE = 'http://localhost:5000/api';

export const CATEGORY_COLORS = {
  Education: '#0984e3',
  Fitness: '#00b894',
  Project: '#6c5ce7',
  Work: '#fdcb6e',
};

export const CATEGORY_ICONS = {
  Education: '📚',
  Fitness: '💪',
  Project: '🚀',
  Work: '💼',
};

export const CATEGORY_GLOW_CLASSES = {
  Education: 'border-glow-blue',
  Fitness: 'border-glow-green',
  Project: 'border-glow-purple',
  Work: 'border-glow-gold',
};

export const STATUS_COLORS = {
  completed: '#00b894',
  'in-progress': '#0984e3',
  lagging: '#d63031',
};

// Rainbow week accent colors
export const RAINBOW_WEEK_COLORS = [
  '#ff6b6b', // Week 1 — Red
  '#ffa502', // Week 2 — Orange
  '#ffd43b', // Week 3 — Yellow
  '#51cf66', // Week 4 — Green
  '#339af0', // Week 5 — Blue
  '#845ef7', // Week 6 — Violet
];

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function getWeekOfMonth(date) {
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  return Math.ceil((d.getDate() + firstDay.getDay()) / 7);
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * Get all calendar weeks for a given month (6 weeks max, padded with prev/next month days).
 * Returns array of weeks, each week is array of { date, dayNum, isCurrentMonth }.
 */
export function getCalendarWeeks(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const cells = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ date, dayNum: day, isCurrentMonth: false });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ date, dayNum: day, isCurrentMonth: true });
  }

  // Next month leading days
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const date = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ date, dayNum: day, isCurrentMonth: false });
  }

  // Split into weeks
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}
