import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import { ThemeProvider }  from './context/ThemeContext';
import Home       from './pages/Home';
import Add        from './pages/Add';
import AllRecords from './pages/AllRecords';
import About      from './pages/About';

export default function App() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <BrowserRouter>
          {/* Tab bar — replaces expo-router's tab layout */}
          <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around py-3 z-10">
            <NavLink to="/"           className={({ isActive }) => isActive ? 'text-indigo-500 font-semibold' : 'text-gray-500'}>Home</NavLink>
            <NavLink to="/add"        className={({ isActive }) => isActive ? 'text-indigo-500 font-semibold' : 'text-gray-500'}>Add</NavLink>
            <NavLink to="/allrecords" className={({ isActive }) => isActive ? 'text-indigo-500 font-semibold' : 'text-gray-500'}>Records</NavLink>
            <NavLink to="/about"      className={({ isActive }) => isActive ? 'text-indigo-500 font-semibold' : 'text-gray-500'}>About</NavLink>
          </nav>

          <main className="pb-16 min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/"           element={<Home />} />
              <Route path="/add"        element={<Add />} />
              <Route path="/allrecords" element={<AllRecords />} />
              <Route path="/about"      element={<About />} />
            </Routes>
          </main>
        </BrowserRouter>
      </BudgetProvider>
    </ThemeProvider>
  );
}
