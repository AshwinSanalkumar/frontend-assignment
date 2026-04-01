import React, { useContext, useState, useEffect } from 'react';
import { Package, LayoutGrid, FileText, LogOut, Box, Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutGrid, path: '/dashboard', active: location.pathname === '/dashboard' },
    { name: 'Inventory', icon: Package, path: '/inventory', active: location.pathname.startsWith('/inventory') || location.pathname.startsWith('/product') },
    { name: 'Documents', icon: FileText, path: '/files', active: location.pathname === '/files' },
  ];

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-5 left-4 z-50 lg:hidden bg-white p-2.5 rounded-xl shadow-lg border border-slate-100 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar  */}
      <aside className={`
        w-64 bg-white h-screen flex flex-col border-r border-slate-100 shrink-0
        fixed lg:static z-50 top-0 left-0
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Logo */}
        <div 
          className="px-8 py-10 flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/dashboard')}
        >
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
            <Box size={20} />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">NexusShare</span>

          {/* Close button for mobile — inside sidebar  */}
          <button
            onClick={(e) => { e.stopPropagation(); setMobileOpen(false); }}
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 transition-colors p-1"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                item.active 
                  ? 'bg-indigo-50/50 text-indigo-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {/* Active Accent Bar */}
              {item.active && (
                <div className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full" />
              )}
              
              <item.icon size={18} strokeWidth={item.active ? 2.5 : 2} />
              <span className={`text-sm font-medium ${item.active ? 'font-semibold' : ''}`}>
                {item.name}
              </span>
            </button>
          ))}
        </nav>
        
        {/* Footer / User Actions */}
        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={logout} 
            className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;