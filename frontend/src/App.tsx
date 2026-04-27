import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Home from './pages/Home';
import Add from './pages/Add';
import AllRecords from './pages/AllRecords';
import About from './pages/About';
import AuditLogs from './pages/AuditLogs';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

import { MdDashboard, MdAccountBalanceWallet, MdReceiptLong, MdAccountBalance, MdAnalytics, MdSettings, MdSearch, MdNotifications, MdHelp } from 'react-icons/md';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';



function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, user } = useContext(AuthContext);

  if (!isAuthenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background font-body-md text-slate-700 dark:text-on-surface transition-colors duration-200">
      {/* SideNavBar Shell */}
      <aside className="fixed left-0 top-0 h-full w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-50 overflow-y-auto transition-colors duration-200">
        <div className="flex flex-col h-full p-6 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-primary-container flex items-center justify-center">
              <MdAccountBalance className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-primary">Budget Tracker</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 font-manrope font-medium text-[14px] rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-primary hover:translate-x-1' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-blue-600 hover:translate-x-1'}`}>
              <MdDashboard className="text-xl" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/add" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 font-manrope font-medium text-[14px] rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-primary hover:translate-x-1' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-blue-600 hover:translate-x-1'}`}>
              <MdAccountBalanceWallet className="text-xl" />
              <span>Add Transaction</span>
            </NavLink>
            <NavLink to="/allrecords" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 font-manrope font-medium text-[14px] rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-primary hover:translate-x-1' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-blue-600 hover:translate-x-1'}`}>
              <MdReceiptLong className="text-xl" />
              <span>Records</span>
            </NavLink>
            <NavLink to="/audit" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 font-manrope font-medium text-[14px] rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-primary hover:translate-x-1' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-blue-600 hover:translate-x-1'}`}>
              <MdAnalytics className="text-xl" />
              <span>Audit Logs</span>
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 font-manrope font-medium text-[14px] rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-primary hover:translate-x-1' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-blue-600 hover:translate-x-1'}`}>
              <MdHelp className="text-xl" />
              <span>About</span>
            </NavLink>
          </nav>


          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2 transition-colors duration-200">
            <button onClick={logout} className="w-full flex items-center gap-3 text-rose-500 dark:text-red-400 px-4 py-2.5 font-manrope font-medium text-[14px] hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all">
              <MdSettings className="text-xl" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* TopNavBar Shell */}
      <header className="fixed top-0 right-0 left-72 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex justify-end items-center px-8 z-40 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-6">

          <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-primary flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden lg:block text-right">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.username}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Premium Plan</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-72 pt-24 px-8 pb-12 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BudgetProvider>
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/add" element={<ProtectedRoute><Add /></ProtectedRoute>} />
                <Route path="/allrecords" element={<ProtectedRoute><AllRecords /></ProtectedRoute>} />
                <Route path="/audit" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
                <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </BudgetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
