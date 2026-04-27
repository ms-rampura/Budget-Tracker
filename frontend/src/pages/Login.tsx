import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MdAccountBalanceWallet, MdLock, MdMail, MdVisibility, MdVisibilityOff, MdSecurity, MdInsights, MdLightMode, MdDarkMode } from 'react-icons/md';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-background font-body-md text-slate-900 dark:text-white transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm fixed top-0 w-full z-50 transition-colors duration-200">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <MdAccountBalanceWallet className="text-blue-600 dark:text-primary text-2xl" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SaveSmart</span>
          </div>
          <nav className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <MdLightMode className="text-lg" /> : <MdDarkMode className="text-lg" />}
            </button>
            <div className="hidden md:flex gap-8 items-center">
              <Link to="/login" className="text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 py-1 font-medium">Login</Link>
              <Link to="/register" className="text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium">Register</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
        {/* Background Decorative Mesh */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-600 dark:bg-primary blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-500 blur-[120px]"></div>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left Column (Marketing/Info) */}
          <div className="hidden lg:flex flex-col space-y-8 pr-12">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight text-slate-900 dark:text-white">
                Master your money with <span className="text-blue-600 dark:text-primary">SaveSmart</span>.
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md">
                Professional-grade budgeting tools designed for clarity, trust, and your financial freedom.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <div className="p-2 bg-blue-100 dark:bg-primary/20 rounded-lg">
                  <MdSecurity className="text-blue-600 dark:text-primary text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">Bank-Level Security</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your data is encrypted with the highest industry standards.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Auth Form) */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-surface-container rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">

              {/* Form Header Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                <Link to="/login" className="flex-1 py-4 text-center text-sm font-semibold text-blue-600 dark:text-primary border-b-2 border-blue-600 dark:border-primary bg-slate-50 dark:bg-slate-900/50 transition-all">
                  Sign In
                </Link>
                <Link to="/register" className="flex-1 py-4 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                  Register
                </Link>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Please enter your details to access your account.</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {error && (
                    <div className="p-3 text-sm text-center text-rose-600 dark:text-red-400 bg-rose-50 dark:bg-error-container/20 border border-rose-200 dark:border-error/30 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-400 uppercase">Email Address</label>
                    <div className="relative">
                      <MdMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-primary/40 focus:border-blue-500 dark:focus:border-primary text-slate-900 dark:text-white transition-all"
                        placeholder="name@company.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-400 uppercase">Password</label>
                    </div>
                    <div className="relative">
                      <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-primary/40 focus:border-blue-500 dark:focus:border-primary text-slate-900 dark:text-white transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      >
                        {showPassword ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input id="remember" type="checkbox" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                    <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">Keep me logged in for 30 days</label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-blue-600 text-white font-bold text-base rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
                  >
                    Sign In
                  </button>
                </form>

                <div className="bg-slate-50 dark:bg-slate-900/50 -mx-8 -mb-8 p-6 text-center border-t border-slate-200 dark:border-slate-800 mt-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Don't have an account? <Link to="/register" className="text-blue-600 dark:text-primary font-semibold hover:underline">Create Account</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
