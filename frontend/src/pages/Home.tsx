import { useState, useMemo } from 'react';
import { useBudget }    from '../context/BudgetContext';
import { useTheme }     from '../context/ThemeContext';
import LastRecordsCard   from '../components/LastRecordsCard';
import LineGraph         from '../components/LineGraph';
import { MdAccountBalance, MdPayments, MdShoppingCart, MdSavings, MdTrendingUp, MdLightMode, MdDarkMode } from 'react-icons/md';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Home() {
  const { balance, records, accounts, activeAccountId, setActiveAccountId, addAccount } = useBudget();
  const { isDark, toggleTheme } = useTheme();

  const [pieType, setPieType] = useState<'expense' | 'income'>('expense');

  const handleAddWallet = async () => {
    const name = window.prompt('Enter new wallet name (e.g., Bank, Credit Card):');
    if (name) {
      await addAccount(name, 'general', 0);
    }
  };

  // Calculate some basic mock stats for the cards based on actual records
  const incomeRecords = records.filter(r => r.type === 'income');
  const expenseRecords = records.filter(r => r.type === 'expense');
  
  const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = expenseRecords.reduce((sum, r) => sum + r.amount, 0);

  // Calculate pie chart data
  const pieData = useMemo(() => {
    const relevantRecords = pieType === 'expense' ? expenseRecords : incomeRecords;
    const grouped = relevantRecords.reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + record.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort largest first
  }, [expenseRecords, incomeRecords, pieType]);

  return (
    <div className="w-full transition-colors duration-200">
      {/* Header and Controls */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Financial Overview</h2>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Wallet:
            </label>
            <select
              value={activeAccountId || ''}
              onChange={(e) => setActiveAccountId(e.target.value ? Number(e.target.value) : null)}
              className="bg-white border border-slate-200 dark:bg-slate-800 dark:border-none rounded-lg text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary py-2 px-3 transition-colors duration-200"
            >
              <option value="">All Wallets (Combined)</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
              ))}
            </select>
            <button 
              onClick={handleAddWallet}
              className="px-4 py-2 text-xs font-bold bg-blue-600 dark:bg-primary text-white rounded-lg active:scale-95 transition-all"
            >
              Add Wallet
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <MdLightMode className="text-lg" /> : <MdDarkMode className="text-lg" />}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
        <div className="bg-white dark:bg-surface-container rounded-xl p-card-padding border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 dark:bg-primary/10 rounded-lg">
              <MdAccountBalance className="text-blue-600 dark:text-primary text-xl" />
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10 px-2 py-1 rounded">Active</span>
          </div>
          <p className="text-slate-500 dark:text-secondary font-label-sm uppercase mb-1">Current Balance</p>
          <h2 className={`font-h2 ${balance >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-500 dark:text-red-400'}`}>Rs. {balance.toLocaleString()}</h2>
          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 dark:bg-primary w-[100%]"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-container rounded-xl p-card-padding border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-tertiary/10 rounded-lg">
              <MdPayments className="text-emerald-500 dark:text-tertiary text-xl" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-secondary font-label-sm uppercase mb-1">Total Income</p>
          <h2 className="font-h2 text-emerald-500 dark:text-emerald-400">Rs. {totalIncome.toLocaleString()}</h2>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{incomeRecords.length} Transactions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-container rounded-xl p-card-padding border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 dark:bg-error-container/20 rounded-lg">
              <MdShoppingCart className="text-rose-500 dark:text-error text-xl" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-secondary font-label-sm uppercase mb-1">Total Expenses</p>
          <h2 className="font-h2 text-rose-500 dark:text-error">Rs. {totalExpense.toLocaleString()}</h2>
          <div className="mt-4 flex items-center gap-1">
            <MdTrendingUp className="text-xs text-rose-500 dark:text-error" />
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{expenseRecords.length} Transactions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-container rounded-xl p-card-padding border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-sky-50 dark:bg-blue-400/10 rounded-lg">
              <MdSavings className="text-sky-500 dark:text-blue-400 text-xl" />
            </div>
            <span className="text-xs font-bold text-sky-500 bg-sky-50 dark:text-blue-400 dark:bg-blue-400/10 px-2 py-1 rounded">Target: 80%</span>
          </div>
          <p className="text-slate-500 dark:text-secondary font-label-sm uppercase mb-1">Savings Goal</p>
          <h2 className="font-h2 text-slate-800 dark:text-white">Rs. 100,000</h2>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-primary"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600/40 dark:bg-primary/40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600/20 dark:bg-primary/20"></div>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Goal: New Car</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Graph and Addons */}
      <div className="grid grid-cols-12 gap-gutter mb-8">
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-surface-container rounded-xl p-card-padding border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-h3 text-slate-800 dark:text-white">Cashflow Trend</h3>
              <p className="text-slate-500 dark:text-secondary font-body-md">Financial performance over the last 30 days</p>
            </div>
          </div>
          <div className="h-64">
             <LineGraph records={records} />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white dark:bg-surface-container rounded-xl p-card-padding border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200 flex flex-col min-h-[180px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-h3 text-slate-800 dark:text-white">Breakdown</h3>
            
            {/* Pill Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full text-xs font-bold transition-colors">
              <button 
                onClick={() => setPieType('expense')}
                className={`px-3 py-1 rounded-full transition-colors ${pieType === 'expense' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Expense
              </button>
              <button 
                onClick={() => setPieType('income')}
                className={`px-3 py-1 rounded-full transition-colors ${pieType === 'income' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Income
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center w-full">
            <div className="h-48 w-full relative">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                        border: isDark ? 'none' : '1px solid #e2e8f0', 
                        borderRadius: '0.5rem', 
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ fontWeight: 'bold' }}
                      formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{ name: 'No Data', value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      dataKey="value"
                      stroke="none"
                      fill={isDark ? '#334155' : '#e2e8f0'}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                        border: isDark ? 'none' : '1px solid #e2e8f0', 
                        borderRadius: '0.5rem', 
                        color: isDark ? '#f1f5f9' : '#1e293b'
                      }}
                      formatter={() => ['No transactions yet', 'Status']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {pieData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">No Data</p>
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 min-h-[24px]">
              {pieData.length > 0 ? pieData.slice(0, 4).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="truncate max-w-[60px]">{entry.name}</span>
                </div>
              )) : (
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                  <span>Awaiting Data</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-surface-container rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6 transition-colors duration-200">
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-h3 text-slate-800 dark:text-white">Recent Transactions</h3>
        </div>
        <LastRecordsCard records={records} />
      </div>
    </div>
  );
}
