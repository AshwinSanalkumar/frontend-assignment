import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

const Login = () => {
  const [creds, setCreds] = useState({ username: '', password: '' });
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
      const res = await api.post('/login/', creds);
      if (res.data.access) {
        login(res.data);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-black mb-6 text-slate-800">Sign In</h1>
        <div className="space-y-4">
          <input 
            type="text" placeholder="Username" required
            className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={e => setCreds({...creds, username: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={e => setCreds({...creds, password: e.target.value})}
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Entering...' : 'Enter Dashboard'}
          </button>
        </div>
        <div className="mt-8 text-center text-slate-500 text-sm font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
            Create one
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;