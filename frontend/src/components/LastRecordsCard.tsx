import type { Record } from '../context/BudgetContext';

export default function LastRecordsCard({ records }: { records: Record[] }) {
  if (records.length === 0) {
    return <p className="text-center text-slate-500 my-8">No transactions yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
          <tr>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors duration-200">
          {records.slice(0, 10).map(record => (
            <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
                  record.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-error-container/50 dark:text-error'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${record.type === 'income' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500 dark:bg-error'}`}></span>
                  {record.type === 'income' ? 'Received' : 'Spent'}
                </span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{record.category}</p>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {new Date(record.time).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <p className={`text-sm font-bold ${record.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                  {record.type === 'income' ? '+' : '-'}Rs. {record.amount.toLocaleString()}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
