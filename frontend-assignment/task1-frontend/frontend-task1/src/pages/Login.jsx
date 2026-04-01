import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authService from '../services/authService';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // New state for visibility
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!creds.username || !creds.password) {
      addToast({ title: 'Login Failed', description: 'Please enter both username and password.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(creds);
      if (data.access) {
        login({ ...data, username: creds.username });
        addToast({ title: 'Welcome Back!', description: 'Successfully signed in.', type: 'success' });
        navigate('/dashboard');
      }
    } catch (err) {
      const errorData = err.response?.data;
      const errorMsg = 
        errorData?.detail || 
        errorData?.non_field_errors?.[0] ||
        'Invalid credentials. The gate remains closed.';
      addToast({ title: 'Login Failed', description: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 relative overflow-hidden">
      {/* Decorative Gradient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <form 
        onSubmit={handleLogin} 
        className="bg-white p-10 md:p-12 rounded-[3rem] w-full max-w-md shadow-2xl relative z-10 border border-white/10"
      >
        <div className="mb-10 text-center">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100/50">
            <Lock size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Dashboard</h1>
          <p className="text-slate-400 text-sm font-medium mt-2">Enter your credentials to continue</p>
        </div>

        <div className="space-y-4">
          {/* Username Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
              <User size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Username" 
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
              onChange={e => setCreds({...creds, username: e.target.value})}
            />
          </div>

          {/* Password Input with Eye Toggle */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
              <Lock size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              required
              className="w-full pl-12 pr-12 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
              onChange={e => setCreds({...creds, password: e.target.value})}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200/50 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                Enter System
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">New to the platform?</p>
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl border border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-200 transition-all"
          >
            Create an Account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;