import { MdCheckCircle } from "react-icons/md";

export default function About() {
  const developers = [
    { name: "Muhammad Shabbir", roll: "24K-0502" },
    { name: "Abdullah Kamran", roll: "24K-0723" },
    { name: "Hasan Mujtaba", roll: "24K-0852" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 space-y-10 transition-colors duration-200">

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-primary">
          About SaveSmart
        </h1>
        <p className="text-slate-500 dark:text-secondary max-w-2xl mx-auto">
          SaveSmart is a modern personal finance tracker designed to help you
          take control of your money with simplicity, privacy, and powerful insights.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white dark:bg-surface-container rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
          Our Mission
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Our goal is to make financial management simple and accessible for everyone.
          SaveSmart is built as a local-first application, ensuring your data remains
          private and secure while still giving you powerful tools to analyze and
          improve your financial habits.
        </p>
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-surface-container rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
          Key Features
        </h2>
        <ul className="space-y-3">
          {[
            "Track multiple wallets and accounts",
            "Comprehensive income and expense management",
            "Interactive cashflow trends and charts",
            "Secure audit logs for all transactions",
            "Modern light and dark mode interface",
          ].map((feature, index) => (
            <li
              key={index}
              className="flex items-center gap-3 text-slate-600 dark:text-slate-300"
            >
              <MdCheckCircle className="text-emerald-500 text-xl" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Why Section */}
      <div className="bg-white dark:bg-surface-container rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
          Why SaveSmart?
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Unlike many finance apps, SaveSmart focuses on privacy and simplicity.
          There’s no unnecessary clutter—just the tools you need to track, analyze,
          and improve your finances effectively.
        </p>
      </div>

      {/* Developers Section */}
      <div className="bg-white dark:bg-surface-container rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
          Developers
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {developers.map((dev, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center"
            >
              <h3 className="font-semibold text-slate-800 dark:text-white">
                {dev.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {dev.roll}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}