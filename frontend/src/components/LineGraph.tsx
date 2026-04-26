import { useMemo } from 'react';
import {
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Area, AreaChart
} from 'recharts';
import type { Record } from '../context/BudgetContext';
import { useTheme } from '../context/ThemeContext';

interface Props { records: Record[]; }

export default function LineGraph({ records }: Props) {
  const { isDark } = useTheme();

  const data = useMemo(() => {
    return [...records]
      .reverse()
      .map(r => ({
        date:    new Date(r.time).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
        balance: r.bal,
      }));
  }, [records]);

  if (data.length === 0) {
    return <p className="text-center text-slate-500 mt-8">No data for chart yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} vertical={false} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} 
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis 
          tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} 
          axisLine={false}
          tickLine={false}
          dx={-10}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: isDark ? '#1e293b' : '#ffffff', 
            border: isDark ? 'none' : '1px solid #e2e8f0', 
            borderRadius: '0.5rem', 
            color: isDark ? '#f1f5f9' : '#1e293b',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
          }}
          itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#3b82f6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorBalance)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
