import { useBudget }    from '../context/BudgetContext';
import { useTheme }     from '../context/ThemeContext';
import LastRecordsCard   from '../components/LastRecordsCard';
import LineGraph         from '../components/LineGraph';
import { IoCash }        from 'react-icons/io5';

export default function Home() {
  const { balance, records, accounts, activeAccountId, setActiveAccountId, addAccount } = useBudget();
  const { isDark, toggleTheme } = useTheme();

  const handleAddWallet = async () => {
    const name = window.prompt('Enter new wallet name (e.g., Bank, Credit Card):');
    if (name) {
      await addAccount(name, 'general', 0);
    }
  };

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

      {/* Wallet Selector */}
      <div className="mb-4 flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Viewing Wallet:
          </label>
          <select
            value={activeAccountId || ''}
            onChange={(e) => setActiveAccountId(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Wallets (Combined)</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleAddWallet}
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl font-medium transition-colors"
        >
          + Add
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
