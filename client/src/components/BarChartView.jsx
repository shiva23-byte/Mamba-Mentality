import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-sheet-border rounded-lg shadow-sheet-lg px-3 py-2 text-xs">
        <p className="font-medium text-slate-primary mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-[11px]">
            {p.name}: {p.value} min
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BarChartView({ activities }) {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setAnimKey((prev) => prev + 1);
  }, [activities]);

  if (!activities || activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-light text-sm">
        No activity data to display
      </div>
    );
  }

  // Prepare data: each activity as a bar group
  const data = activities.map((a) => ({
    name: a.name.length > 10 ? a.name.substring(0, 10) + '…' : a.name,
    fullName: a.name,
    Planned: a.plannedMinutes || 0,
    Actual: a.actualMinutes || 0,
  }));

  return (
    <div className="w-full h-48 animate-reveal-up">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart key={animKey} data={data} barGap={3} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#dfe6e9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#636e72', fontSize: 10 }}
            axisLine={{ stroke: '#dfe6e9' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#636e72', fontSize: 10 }}
            axisLine={{ stroke: '#dfe6e9' }}
            tickLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 184, 148, 0.05)' }} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#636e72' }}
            iconType="circle"
            iconSize={7}
          />
          <Bar
            dataKey="Planned"
            fill="#6c5ce7"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={850}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="Actual"
            fill="#0984e3"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationBegin={150}
            animationDuration={850}
            animationEasing="ease-out"
          >
            <LabelList
              dataKey="Actual"
              position="top"
              content={(props) => {
                const { x, y, width, value, index } = props;
                const planned = data[index]?.Planned || 0;
                const pct = planned > 0 ? Math.round((value / planned) * 100) : 0;
                return (
                  <text
                    x={x + width / 2}
                    y={y - 8}
                    fill="#636e72"
                    fontSize={9}
                    textAnchor="middle"
                    className="font-mono font-bold select-none"
                  >
                    {value}m ({pct}%)
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
