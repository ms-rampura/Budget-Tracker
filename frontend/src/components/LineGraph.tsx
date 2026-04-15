import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import type { Record } from '../context/BudgetContext';

interface Props { records: Record[]; }

export default function LineGraph({ records }: Props) {
  const data = useMemo(() => {
    return [...records]
      .reverse()
      .map(r => ({
        date:    new Date(r.time).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
        balance: r.bal,
      }));
  }, [records]);

  if (data.length === 0) {
    return <p className="text-center text-gray-400 mt-4">No data for chart yet.</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">30-Day Balance Trend</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{ background: '#1F2937', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#F3F4F6' }}
            itemStyle={{ color: '#8e7bbd' }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#6366F1"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
