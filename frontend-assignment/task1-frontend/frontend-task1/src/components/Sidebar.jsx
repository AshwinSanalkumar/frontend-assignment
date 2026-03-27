import React, { useContext } from 'react';
import { Package, LayoutGrid, FileText, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard' || location.pathname.startsWith('/product');
  const isFiles = location.pathname === '/files';

  return (
    <aside className="w-72 bg-slate-900 h-full flex flex-col p-8 text-white shrink-0">
      <div 
        className="flex items-center gap-3 mb-12 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/dashboard')}
      >
        <div className="bg-indigo-500 p-2 rounded-lg">
          <Package size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight">INVENTO</span>
      </div>
      
      <nav className="flex-1 space-y-2">
        <div 
          onClick={() => navigate('/dashboard')}
          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
            isDashboard 
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' 
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <LayoutGrid size={20} /> <span className="font-semibold">Inventory</span>
        </div>
        
        <div 
          onClick={() => navigate('/files')}
          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
            isFiles 
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' 
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <FileText size={20} /> <span className="font-semibold">Documents</span>
        </div>
      </nav>
      
      <button 
        onClick={logout} 
        className="flex w-full items-center gap-3 p-3 text-slate-400 hover:text-red-400 transition-colors border-t border-slate-800 pt-6 mt-auto"
      >
        <LogOut size={20} /> <span className="font-medium">Sign Out</span>
      </button>
    </aside>
  );
};

export default Sidebar;
