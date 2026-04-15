import type { Record } from '../context/BudgetContext';

export default function LastRecordsCard({ records }: { records: Record[] }) {
  if (records.length === 0) {
    return <p className="text-center text-gray-400 mt-4">No transactions yet.</p>;
  }

  return (
    <div className="space-y-2">
      {records.slice(0, 10).map(record => (
        <div key={record.id} className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">{record.category}</p>
            <p className="text-xs text-gray-500">{new Date(record.time).toLocaleDateString()}</p>
          </div>
          <span className={`font-bold text-sm ${record.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
            {record.type === 'income' ? '+' : '-'} Rs. {record.amount.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
