export default function About() {
  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-indigo-500 mb-2">Finance Tracker</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        A simple, local-first personal finance tool.
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow text-left space-y-2">
        <p className="text-gray-700 dark:text-gray-300">✅ Track income and expenses</p>
        <p className="text-gray-700 dark:text-gray-300">✅ Category breakdown</p>
        <p className="text-gray-700 dark:text-gray-300">✅ 30-day balance chart</p>
        <p className="text-gray-700 dark:text-gray-300">✅ Dark / Light mode</p>
      </div>
    </div>
  );
}
