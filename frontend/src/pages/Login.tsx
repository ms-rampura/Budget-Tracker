import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MdAccountBalance } from 'react-icons/md';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-surface-container p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 dark:bg-primary-container flex items-center justify-center mb-4">
            <MdAccountBalance className="text-white text-2xl" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-800 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account? <Link to="/register" className="font-medium text-blue-600 dark:text-primary hover:text-blue-700 dark:hover:text-blue-400">Sign up</Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-rose-600 dark:text-error text-sm text-center bg-rose-50 dark:bg-error-container/30 border border-rose-200 dark:border-error/50 p-3 rounded-lg">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-none rounded-xl p-3 text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary transition-colors duration-200"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-none rounded-xl p-3 text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary transition-colors duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-primary focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-colors"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
