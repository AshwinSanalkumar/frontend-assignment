import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import authService from '../services/authService';
import { UserPlus, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Password Strength Logic
  const strength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return 0;
    let score = 0;
    if (/[a-z]/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*()]/.test(pw)) score++;
    if (pw.length >= 8) score++;
    return score;
  }, [formData.password]);

  const strengthColor = [
    'bg-slate-200',    // 0
    'bg-red-500',      // 1
    'bg-orange-500',   // 2
    'bg-yellow-500',   // 3
    'bg-emerald-400',  // 4
    'bg-emerald-600'   // 5
  ][strength];

  const strengthLabel = ['Empty', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength];

  const handleRegister = async (e) => {
    e.preventDefault();
    const { password, password_confirm } = formData;

    if (password !== password_confirm) {
      addToast({ title: 'Registration Failed', description: 'Password fields must match.', type: 'error' });
      return;
    }

    // Existing Validations
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
      await authService.register(formData);
      addToast({ title: 'Account Created', description: 'Successfully registered! Please sign in.', type: 'success' });
      navigate('/login');
    } catch (err) {
      const errorData = err.response?.data;
      addToast({ title: 'Registration Failed', description: errorData?.detail || 'Registration failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <form onSubmit={handleRegister} className="bg-white p-10 md:p-12 rounded-[3rem] w-full max-w-lg shadow-2xl relative z-10 border border-white/10">
        <div className="mb-8 text-center">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100/50">
            <UserPlus size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-400 text-sm font-medium mt-2">Join us to manage your inventory</p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="username" placeholder="Username" required className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300" onChange={handleChange} value={formData.username} />
            <input type="email" name="email" placeholder="Email Address" required className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300" onChange={handleChange} value={formData.email} />
          </div>

          <div className="flex gap-4">
            <input type="text" name="first_name" placeholder="First Name" required className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300" onChange={handleChange} value={formData.first_name} />
            <input type="text" name="last_name" placeholder="Last Name" required className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300" onChange={handleChange} value={formData.last_name} />
          </div>

          {/* Password Field with Strength Bar */}
          <div className="relative group">
            <input 
              type={showPassword ? "text" : "password"} name="password" placeholder="Password" required
              className="w-full p-4 pr-12 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
              onChange={handleChange} value={formData.password}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/3 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors p-1">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            
            {/* Strength Indicator Bar */}
            <div className="px-1 mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Strength</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${strength > 3 ? 'text-emerald-500' : 'text-slate-400'}`}>{strengthLabel}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${strengthColor} transition-all duration-500 ease-out`} 
                  style={{ width: `${(strength / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="relative group">
            <input 
              type={showConfirmPassword ? "text" : "password"} name="password_confirm" placeholder="Confirm Password" required
              className="w-full p-4 pr-12 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
              onChange={handleChange} value={formData.password_confirm}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors p-1">
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200/50 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Register Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Already a member?</p>
          <Link to="/login" className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl border border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">Sign In</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;