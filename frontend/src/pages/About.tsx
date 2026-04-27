import { MdCheckCircle } from 'react-icons/md';

export default function About() {
  return (
    <div className="w-full max-w-2xl mx-auto transition-colors duration-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-primary mb-2">SaveSmart</h2>
        <p className="text-slate-500 dark:text-secondary font-body-md">
          A powerful, local-first personal finance tracking dashboard.
        </p>
      </div>

      <div className="bg-white dark:bg-surface-container rounded-xl p-card-padding border border-slate-100 dark:border-slate-800 shadow-sm text-left space-y-4 transition-colors duration-200">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Features</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <MdCheckCircle className="text-emerald-500 dark:text-emerald-400 text-xl" />
            <span>Track multiple wallets and accounts</span>
          </li>
          <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <MdCheckCircle className="text-emerald-500 dark:text-emerald-400 text-xl" />
            <span>Comprehensive income and expense management</span>
          </li>
          <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <MdCheckCircle className="text-emerald-500 dark:text-emerald-400 text-xl" />
            <span>Interactive cashflow trends and charts</span>
          </li>
          <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <MdCheckCircle className="text-emerald-500 dark:text-emerald-400 text-xl" />
            <span>Secure audit logs for all transactions</span>
          </li>
          <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <MdCheckCircle className="text-emerald-500 dark:text-emerald-400 text-xl" />
            <span>Modern light and dark mode optimized interface</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
