import React, { useContext } from 'react';
import { User, Bell, ChevronDown, Search } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="flex justify-between items-center h-16 sm:h-20 px-4 sm:px-8 shrink-0 bg-white/40 backdrop-blur-sm sticky top-0 z-30 transition-all">
      {/* Spacer for mobile hamburger area */}
      <div className="w-10 lg:hidden" />
     
      <div className="flex items-center gap-5 ml-auto">

        
        <div className="h-6 w-px bg-slate-200/60 mx-1 hidden sm:block" />
        
        {/* User Profile */}
        <div className="flex items-center gap-3 group cursor-pointer pl-2 py-1 rounded-2xl hover:bg-white/80 transition-all">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">
              Hi, {user?.username.charAt(0).toUpperCase() + user?.username.slice(1) || 'Guest User'}
            </p>
          </div>
          
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 transition-all group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-600">
              
              <User size={20} strokeWidth={2.5} />
            </div>
          </div>
          
          
        </div>
      </div>
    </header>
  );
};

export default Header;