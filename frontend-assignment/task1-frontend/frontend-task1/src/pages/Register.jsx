import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    const { password, password_confirm } = formData;

    if (password !== password_confirm) {
      addToast({ title: 'Registration Failed', description: 'Password fields must match.', type: 'error' });
      return;
    }

    if (!/[a-z]/.test(password)) {
      addToast({ title: 'Registration Failed', description: 'Password Must contain atleast One lower case', type: 'error' });
      return;
    }

    if (!/[A-Z]/.test(password)) {
      addToast({ title: 'Registration Failed', description: 'Password Must contain atleast One Uppercase', type: 'error' });
      return;
    }

    if (!/[!@#$%^&*()]/.test(password)) {
      addToast({ title: 'Registration Failed', description: 'Password Must contain atleast One special char', type: 'error' });
      return;
    }

    if (!/[0-9]/.test(password)) {
      addToast({ title: 'Registration Failed', description: 'Password Must contain atleast One Number', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      await api.post('/register/', formData);
      addToast({ title: 'Account Created', description: 'Successfully registered! Please sign in.', type: 'success' });
      navigate('/login');
    } catch (err) {
      const errorData = err.response?.data;
      const errorMsg = 
        errorData?.detail || 
        errorData?.email?.[0] ||
        errorData?.username?.[0] || 
        errorData?.password?.[0] || 
        errorData?.non_field_errors?.[0] ||
        'Registration failed.';
      addToast({ title: 'Registration Failed', description: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <form onSubmit={handleRegister} className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-black mb-2 text-slate-800">Create Account</h1>
        <p className="text-slate-500 mb-6 text-sm">Join us to manage your inventory</p>
        
        <div className="space-y-4">
          <input 
            type="text" name="username" placeholder="Username" required
            className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={handleChange}
            value={formData.username}
          />
          <input 
            type="email" name="email" placeholder="Email Address" required
            className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={handleChange}
            value={formData.email}
          />
          <div className="flex gap-4">
            <input 
              type="text" name="first_name" placeholder="First Name" required
              className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
              value={formData.first_name}
            />
            <input 
              type="text" name="last_name" placeholder="Last Name" required
              className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
              value={formData.last_name}
            />
          </div>
          <input 
            type="password" name="password" placeholder="Password" required
            className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={handleChange}
            value={formData.password}
          />
          <input 
            type="password" name="password_confirm" placeholder="Confirm Password" required
            className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={handleChange}
            value={formData.password_confirm}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </div>
        
        <div className="mt-8 text-center text-slate-500 text-sm font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
