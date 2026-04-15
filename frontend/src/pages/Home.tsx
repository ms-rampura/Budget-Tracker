import { useBudget }    from '../context/BudgetContext';
import { useTheme }     from '../context/ThemeContext';
import LastRecordsCard   from '../components/LastRecordsCard';
import LineGraph         from '../components/LineGraph';
import { IoCash }        from 'react-icons/io5';

export default function Home() {
  const { balance, records } = useBudget();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="p-4 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Finance Tracker</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow mb-4 flex items-center gap-4">
        <IoCash size={40} className="text-indigo-500 dark:text-purple-400" />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            Rs. {balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 30-Day Chart */}
      <LineGraph records={records} />

      {/* Recent Transactions */}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">
        Recent Transactions
      </h2>
      <LastRecordsCard records={records} />
    </div>
  );
}
