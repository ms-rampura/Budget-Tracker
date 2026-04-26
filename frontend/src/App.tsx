import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import { ThemeProvider }  from './context/ThemeContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Home       from './pages/Home';
import Add        from './pages/Add';
import AllRecords from './pages/AllRecords';
import About      from './pages/About';
import Login      from './pages/Login';
import Register   from './pages/Register';

function ProtectedRoute({ children }: { children: JSX.Element }) {
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

function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, user } = useContext(AuthContext);

  if (!isAuthenticated) return <>{children}</>;

  return (
    <>
      <nav className="fixed top-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center px-4 py-3 z-10">
        <div className="font-bold text-lg dark:text-white">BudgetTracker</div>
        <div className="flex gap-4 items-center">
          <span className="text-sm dark:text-gray-300">Hi, {user?.username}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:text-red-600 font-semibold">Logout</button>
        </div>
      </nav>

      <main className="pt-16 pb-16 min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around py-3 z-10">
        <NavLink to="/"           className={({ isActive }) => isActive ? 'text-indigo-500 font-semibold' : 'text-gray-500'}>Home</NavLink>
        <NavLink to="/add"        className={({ isActive }) => isActive ? 'text-indigo-500 font-semibold' : 'text-gray-500'}>Add</NavLink>
        <NavLink to="/allrecords" className={({ isActive }) => isActive ? 'text-indigo-500 font-semibold' : 'text-gray-500'}>Records</NavLink>
        <NavLink to="/about"      className={({ isActive }) => isActive ? 'text-indigo-500 font-semibold' : 'text-gray-500'}>About</NavLink>
      </nav>
    </>
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
                <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </BudgetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
