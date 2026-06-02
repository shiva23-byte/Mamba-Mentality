import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS } from '../lib/utils';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white border border-sheet-border rounded-lg shadow-sheet-lg px-3 py-2 text-xs">
        <p className="font-semibold" style={{ color: data.payload.fill }}>
          {data.name}
        </p>
        <p className="text-slate-muted">
          {data.value} min ({((data.value / data.payload.total) * 100).toFixed(0)}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function PieChartView({ activities }) {
  const [activeTab, setActiveTab] = useState('live');
  const [animKey, setAnimKey] = useState(0);
  const [scale, setScale] = useState(0);
  const [hoveredSector, setHoveredSector] = useState(null);

  useEffect(() => {
    setAnimKey((prev) => prev + 1);
  }, [activities]);

  useEffect(() => {
    if (activeTab === 'concept') {
      setScale(0);
      const timer = setTimeout(() => setScale(1), 60);
      return () => clearTimeout(timer);
    }
  }, [activeTab, activities]);

  if (!activities || activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-light text-sm">
        No activity data to display
      </div>
    );
  }

  // Aggregate by category
  const categoryData = {};
  activities.forEach((a) => {
    const cat = a.category || 'Other';
    if (!categoryData[cat]) {
      categoryData[cat] = { name: cat, value: 0 };
    }
    categoryData[cat].value += (a.actualMinutes || 0);
  });

  const data = Object.values(categoryData).filter((d) => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);
  data.forEach((d) => (d.total = total));

  const handleRefresh = () => {
    setScale(0);
    setTimeout(() => setScale(1), 50);
  };

  // Recharts custom label
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 14;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#636e72"
        fontSize={10}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-mono font-bold select-none"
      >
        {name}: {Math.round(percent * 100)}%
      </text>
    );
  };

  // Arc path for Polar Area Chart
  const getArcPath = (cx, cy, startAngle, endAngle, innerRadius, outerRadius) => {
    const RAD = Math.PI / 180;
    const sAngle = (startAngle - 90) * RAD;
    const eAngle = (endAngle - 90) * RAD;

    const x1_out = cx + outerRadius * Math.cos(sAngle);
    const y1_out = cy + outerRadius * Math.sin(sAngle);
    const x2_out = cx + outerRadius * Math.cos(eAngle);
    const y2_out = cy + outerRadius * Math.sin(eAngle);

    const x1_in = cx + innerRadius * Math.cos(eAngle);
    const y1_in = cy + innerRadius * Math.sin(eAngle);
    const x2_in = cx + innerRadius * Math.cos(sAngle);
    const y2_in = cy + innerRadius * Math.sin(sAngle);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1_out} ${y1_out}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2_out} ${y2_out}
      L ${x1_in} ${y1_in}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2_in} ${y2_in}
      Z
    `;
  };

  return (
    <div className="space-y-3 w-full">
      {/* Tab Selector */}
      <div className="flex items-center gap-1.5 bg-sheet-bg p-1 rounded-lg border border-sheet-border max-w-max select-none">
        <button
          onClick={() => setActiveTab('live')}
          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all active-spring ${
            activeTab === 'live'
              ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/20'
              : 'text-slate-muted hover:text-slate-primary'
          }`}
        >
          Live Tracker
        </button>
        <button
          onClick={() => setActiveTab('concept')}
          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all active-spring ${
            activeTab === 'concept'
              ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/20'
              : 'text-slate-muted hover:text-slate-primary'
          }`}
        >
          Polar Tracker
        </button>
      </div>

      {activeTab === 'live' ? (
        data.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-light text-sm">
            No time logged yet
          </div>
        ) : (
          <div className="w-full h-48 animate-reveal-up">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart key={animKey}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={48}
                  paddingAngle={4}
                  dataKey="value"
                  label={renderCustomLabel}
                  labelLine={{ stroke: '#dfe6e9', strokeWidth: 1 }}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={850}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name] || '#b2bec3'}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )
      ) : (
        /* Custom SVG Polar Area Chart */
        data.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-light text-sm">
            No time logged yet
          </div>
        ) : (
          <div className="relative w-full bg-sheet-bg border border-sheet-border rounded-lg overflow-hidden animate-reveal-up select-none" style={{ aspectRatio: '16/9' }}>
            <svg viewBox="0 0 356 200" className="w-full h-full p-2">
              {/* Circular grid lines */}
              {[25, 45, 65, 85].map((r, i) => (
                <circle
                  key={i}
                  cx="178"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke="#dfe6e9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Slices */}
              {data.map((entry, idx) => {
                const cx = 178;
                const cy = 100;
                const innerRadius = 15;
                
                const maxVal = Math.max(...data.map(d => d.value), 1);
                const targetOuterRadius = 25 + (60 * (entry.value / maxVal));
                const currentOuterRadius = innerRadius + (targetOuterRadius - innerRadius) * scale;

                const sectorAngle = 360 / data.length;
                const startAngle = idx * sectorAngle;
                const endAngle = (idx + 1) * sectorAngle;
                const midAngle = startAngle + sectorAngle / 2;

                const path = getArcPath(cx, cy, startAngle, endAngle, innerRadius, currentOuterRadius);
                const color = CATEGORY_COLORS[entry.name] || '#b2bec3';
                const isHovered = hoveredSector?.name === entry.name;

                const labelDist = targetOuterRadius + 15;
                const RAD = Math.PI / 180;
                const lx = cx + labelDist * Math.cos((midAngle - 90) * RAD);
                const ly = cy + labelDist * Math.sin((midAngle - 90) * RAD);

                return (
                  <g key={idx}>
                    <path
                      d={path}
                      fill={color}
                      fillOpacity={isHovered ? 0.85 : 0.65}
                      stroke={color}
                      strokeWidth={isHovered ? 1.5 : 0.5}
                      className="transition-all duration-300 cursor-pointer"
                      style={{ transformOrigin: '178px 100px' }}
                      onMouseEnter={() => setHoveredSector(entry)}
                      onMouseLeave={() => setHoveredSector(null)}
                    />

                    <circle
                      cx={lx}
                      cy={ly}
                      r="3"
                      fill={color}
                      className="transition-opacity duration-300"
                      style={{ opacity: scale }}
                    />

                    <text
                      x={lx + (lx > cx ? 6 : -6)}
                      y={ly}
                      fill="#636e72"
                      fontSize="9"
                      textAnchor={lx > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="font-mono font-bold transition-opacity duration-300"
                      style={{ opacity: scale }}
                    >
                      {entry.name}: {Math.round((entry.value / total) * 100)}%
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip overlay */}
            {hoveredSector && (
              <div className="absolute top-4 left-4 bg-white border border-sheet-border rounded-lg shadow-sheet-lg px-2.5 py-1.5 text-[10px] pointer-events-none animate-reveal-up">
                <p className="font-bold" style={{ color: CATEGORY_COLORS[hoveredSector.name] }}>
                  {hoveredSector.name}
                </p>
                <p className="text-slate-muted font-mono">
                  {hoveredSector.value} min ({((hoveredSector.value / total) * 100).toFixed(0)}%)
                </p>
              </div>
            )}

            {/* Refresh button */}
            <div className="absolute bottom-3 right-3">
              <button
                type="button"
                onClick={handleRefresh}
                className="p-1.5 bg-white border border-sheet-border rounded-md text-slate-muted hover:text-slate-primary hover:bg-sheet-bg transition-all cursor-pointer active-spring shadow-sm"
                title="Re-animate Chart"
              >
                <svg width="16" height="16" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 0 1 1 1v1.172a6.001 6.001 0 1 1-1.785 8.16l1.733-1A4 4 0 1 0 5.518 6H8a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
