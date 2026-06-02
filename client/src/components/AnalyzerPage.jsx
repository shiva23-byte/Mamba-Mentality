import React, { useEffect, useState, useMemo } from 'react';
import { useSelection } from '../context/SelectionContext';
import { API_BASE, CATEGORY_COLORS } from '../lib/utils';
import { ArrowLeft, Brain, Target, TrendingUp, Zap, Clock, Activity } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  LineChart, Line,
  PieChart, Pie, Cell,
  ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const QUOTES = [
  "I'm here. I'm not going anywhere. No matter what the injury — unless it's completely debilitating — I'm going to be the same player I've always been.",
  "Dedication sees dreams come true.",
  "May you always remember to enjoy the road, especially when it's a hard one.",
  "I can't relate to lazy people. We don't speak the same language.",
  "Great things come from hard work and perseverance. No excuses.",
  "The most important thing is to try and inspire people so that they can be great in whatever they want to do.",
  "If you're afraid of failing, then you're probably going to fail.",
  "Rest at the end, not in the middle.",
  "Everything negative — pressure, challenges — is all an opportunity for me to rise."
];

export default function AnalyzerPage() {
  const { selection, currentMonth, currentView, setCurrentView } = useSelection();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let start, end, url;
        if (currentView === 'daily') {
          if (!selection.date) return;
          url = `${API_BASE}/activities/${selection.date}`;
        } else if (currentView === 'weekly') {
          const year = currentMonth.year;
          const month = currentMonth.month;
          const firstDay = new Date(year, month, 1);
          const startOffset = (selection.week || 1 - 1) * 7 - firstDay.getDay();
          const startDate = new Date(year, month, 1 + startOffset);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          start = startDate.toISOString().split('T')[0];
          end = endDate.toISOString().split('T')[0];
          url = `${API_BASE}/activities/range/${start}/${end}`;
        } else if (currentView === 'monthly') {
          const year = currentMonth.year;
          const month = currentMonth.month;
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
          end = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
          url = `${API_BASE}/activities/range/${start}/${end}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        
        if (currentView === 'daily') {
          setActivities(data.activities || []);
        } else {
          const flattened = data.flatMap(d => (d.activities || []).map(a => ({ ...a, date: d.date })));
          setActivities(flattened);
        }
      } catch (err) {
        console.error('Analyzer fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentView, selection, currentMonth]);

  const totalPlanned = useMemo(() => activities.reduce((s, a) => s + (a.plannedMinutes || 0), 0), [activities]);
  const totalActual = useMemo(() => activities.reduce((s, a) => s + (a.actualMinutes || 0), 0), [activities]);
  const mambaScore = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

  const radarData = useMemo(() => {
    const cats = { Education: { planned: 0, actual: 0 }, Fitness: { planned: 0, actual: 0 }, Project: { planned: 0, actual: 0 }, Work: { planned: 0, actual: 0 } };
    activities.forEach(a => {
      if (cats[a.category]) {
        cats[a.category].planned += (a.plannedMinutes || 0);
        cats[a.category].actual += (a.actualMinutes || 0);
      }
    });
    return Object.keys(cats).map(key => ({ subject: key, A: cats[key].actual, B: cats[key].planned, fullMark: Math.max(cats[key].planned, 1) }));
  }, [activities]);

  const barData = useMemo(() => {
    const map = {};
    activities.forEach(a => {
      if (!map[a.name]) map[a.name] = { name: a.name.substring(0, 10), actual: 0, planned: 0 };
      map[a.name].actual += (a.actualMinutes || 0);
      map[a.name].planned += (a.plannedMinutes || 0);
    });
    return Object.values(map).sort((a, b) => b.planned - a.planned).slice(0, 6);
  }, [activities]);

  const pieData = useMemo(() => {
    let completed = 0, lagging = 0, inProgress = 0;
    activities.forEach(a => {
      if (a.status === 'completed') completed++;
      else if (a.status === 'lagging') lagging++;
      else inProgress++;
    });
    return [
      { name: 'Completed', value: completed, color: '#00b894' },
      { name: 'In Progress', value: inProgress, color: '#0984e3' },
      { name: 'Lagging', value: lagging, color: '#d63031' }
    ].filter(d => d.value > 0);
  }, [activities]);

  const trendData = useMemo(() => {
    if (currentView === 'daily') {
      return activities.map(a => ({ name: a.name.substring(0, 8), Actual: a.actualMinutes || 0 }));
    } else {
      const dateMap = {};
      activities.forEach(a => {
        if (!dateMap[a.date]) dateMap[a.date] = { date: a.date.substring(5), Actual: 0, Planned: 0 };
        dateMap[a.date].Actual += (a.actualMinutes || 0);
        dateMap[a.date].Planned += (a.plannedMinutes || 0);
      });
      return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
    }
  }, [activities, currentView]);

  const viewTitle = currentView === 'daily' ? 'Daily' : currentView === 'weekly' ? 'Weekly' : 'Monthly';

  const tooltipStyle = { backgroundColor: '#ffffff', border: '1px solid #dfe6e9', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#1e272e' };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between sheet-container p-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('tracker')} className="toolbar-btn active-spring">
            <ArrowLeft className="h-4 w-4" /> Back to Tracker
          </button>
          <h1 className="text-xl font-bold tracking-widest uppercase text-accent-teal font-heading">
            {viewTitle} Analyzer
          </h1>
        </div>
        {loading && <div className="h-5 w-5 border-2 border-accent-teal/30 border-t-accent-teal rounded-full animate-spin" />}
      </div>

      {activities.length === 0 && !loading ? (
        <div className="sheet-container p-12 text-center">
          <Brain className="h-12 w-12 text-slate-light mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-primary">No Data Available</h2>
          <p className="text-slate-muted mt-2">Track activities in this timeframe to generate analytics.</p>
        </div>
      ) : (
        <>
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="sheet-container p-6 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent-teal/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Activity className="h-6 w-6 text-accent-teal mb-2" />
              <p className="text-xs font-semibold text-slate-muted uppercase tracking-widest mb-1">Mamba Score</p>
              <h2 className="text-5xl font-black text-slate-primary font-mono">{mambaScore}<span className="text-xl text-accent-teal">%</span></h2>
            </div>
            
            <div className="sheet-container p-6 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Clock className="h-6 w-6 text-neon-purple mb-2" />
              <p className="text-xs font-semibold text-slate-muted uppercase tracking-widest mb-1">Total Actual Hours</p>
              <h2 className="text-4xl font-bold text-slate-primary font-mono">{(totalActual / 60).toFixed(1)}</h2>
            </div>

            <div className="sheet-container p-6 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-status-done/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Target className="h-6 w-6 text-status-done mb-2" />
              <p className="text-xs font-semibold text-slate-muted uppercase tracking-widest mb-1">Activities Tracked</p>
              <h2 className="text-4xl font-bold text-slate-primary font-mono">{activities.length}</h2>
            </div>
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="sheet-container p-6 h-80 flex flex-col">
              <h3 className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <Brain className="h-4 w-4 text-neon-purple" /> Category Balance
              </h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#dfe6e9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#636e72', fontSize: 11 }} />
                    <Radar name="Actual" dataKey="A" stroke="#0984e3" fill="#0984e3" fillOpacity={0.4} />
                    <Radar name="Planned" dataKey="B" stroke="#6c5ce7" fill="#6c5ce7" fillOpacity={0.15} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#636e72' }} />
                    <RechartsTooltip contentStyle={tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Trend Chart */}
            <div className="sheet-container p-6 h-80 flex flex-col">
              <h3 className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-status-done" /> Productivity Trend
              </h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00b894" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#00b894" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dfe6e9" vertical={false} />
                    <XAxis dataKey={currentView === 'daily' ? 'name' : 'date'} tick={{ fill: '#636e72', fontSize: 11 }} axisLine={{ stroke: '#dfe6e9' }} tickLine={false} />
                    <YAxis tick={{ fill: '#636e72', fontSize: 11 }} axisLine={{ stroke: '#dfe6e9' }} tickLine={false} />
                    <RechartsTooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="Actual" stroke="#00b894" fillOpacity={1} fill="url(#colorActual)" />
                    {currentView !== 'daily' && <Area type="monotone" dataKey="Planned" stroke="#6c5ce7" fillOpacity={0} />}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="sheet-container p-6 h-80 flex flex-col">
              <h3 className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent-blue" /> Top Activities
              </h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dfe6e9" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#636e72', fontSize: 11 }} axisLine={{ stroke: '#dfe6e9' }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#636e72', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <RechartsTooltip cursor={{ fill: 'rgba(0,184,148,0.05)' }} contentStyle={tooltipStyle} />
                    <Bar dataKey="actual" fill="#0984e3" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Doughnut Chart */}
            <div className="sheet-container p-6 h-80 flex flex-col">
              <h3 className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-status-lag" /> Completion Status
              </h3>
              <div className="flex-1 w-full min-h-0 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#636e72' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-slate-primary">{pieData.reduce((s,d)=>s+d.value,0)}</span>
                  <span className="text-[10px] text-slate-muted uppercase tracking-widest">Total</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Motivational Quote */}
      <div className="pt-8 pb-6 flex justify-center">
        <div className="relative group max-w-2xl text-center cursor-default">
          <div className="sheet-container p-8 transition-all duration-500 group-hover:shadow-sheet-lg">
            <div className="absolute -top-6 -left-4 text-8xl text-slate-light/20 font-serif font-black">"</div>
            <p className="text-xl md:text-2xl font-medium text-slate-primary italic leading-relaxed relative z-10 font-serif">
              "{quote}"
            </p>
            <div className="mt-6 text-sm font-bold tracking-[0.2em] text-accent-teal uppercase">
              — Kobe Bryant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
