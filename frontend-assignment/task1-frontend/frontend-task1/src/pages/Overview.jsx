import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';
import { fetchFiles } from '../store/fileSlice';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import { Package, FileText, ArrowRight, Clock, Box, HardDrive, ChevronRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Overview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, loading: pLoading } = useSelector((state) => state.products);
  const { items: files, loading: fLoading } = useSelector((state) => state.files);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchFiles());
  }, [dispatch]);

  const lowStockThreshold = 5;
  const lowStockItems = products?.filter(p => p.stock_quantity <= lowStockThreshold) || [];

  const stats = [
    { label: 'Total Products', value: products?.length || 0, icon: Box, color: 'text-blue-600', bgColor: 'bg-blue-50', link: '/inventory' },
    { label: 'Cloud Documents', value: files?.length || 0, icon: HardDrive, color: 'text-indigo-600', bgColor: 'bg-indigo-50', link: '/files' },
    { label: 'Low Stock Count', value: lowStockItems.length, icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-50', link: '/inventory' },
  ];

  const recentProducts = [...(products || [])].sort((a, b) => b.id - a.id).slice(0, 3);
  const recentFiles = [...(files || [])].sort((a, b) => b.id - a.id).slice(0, 3);

  return (
    <Layout>
      <Navbar title="Dashboard" description="Welcome back! Here's a quick overview of your system." />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10 mt-4 sm:mt-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => navigate(stat.link)}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div className={`mt-4 flex items-center font-semibold text-xs gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 ${stat.color}`}>
              {stat.label.includes('Alerts') ? 'Action Required' : `Manage ${stat.label.split(' ')[1]}`} <ChevronRight size={14} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        {/* Critical Alerts - Only if items exist */}
        {lowStockItems.length > 0 && (
          <div className="lg:col-span-3">
            <div className="bg-red-50/50 border border-red-100 rounded-[2.5rem] p-6">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={16} /> Critical Stock Alerts
                </h2>
                <button onClick={() => navigate('/inventory')} className="text-red-600 font-bold text-xs hover:underline">Restock All</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                {lowStockItems.slice(0, 4).map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="bg-white p-4 rounded-2xl border border-red-100/50 flex flex-col gap-3 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-red-600 transition-colors">{p.name}</h4>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase mt-1 ${p.stock_quantity === 0 ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                          {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity} Remaining`}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                        {p.image && <img src={`http://127.0.0.1:8000${p.image}`} className="w-full h-full object-cover" crossOrigin="anonymous" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Products */}
        <div className="bg-white/50 p-2 rounded-[2.5rem]">
          <div className="flex items-center justify-between px-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-indigo-500" /> Recent Items
            </h2>
            <button onClick={() => navigate('/inventory')} className="text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors">View All</button>
          </div>
          <div className="space-y-1">
            {pLoading ? (
              <p className="text-center py-10 text-slate-400 text-sm animate-pulse">Updating inventory...</p>
            ) : recentProducts.map(p => (
              <div 
                key={p.id} 
                onClick={() => navigate(`/product/${p.id}`)}
                className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white hover:shadow-sm hover:shadow-indigo-500/5 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-50">
                  {p.image ? (
                    <img src={`http://127.0.0.1:8000${p.image}`} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" crossOrigin="anonymous" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={20} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{p.name}</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    <span className="text-indigo-600 font-bold">₹{p.price}</span> &bull; {p.stock_quantity} in stock
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Files */}
        <div className="bg-white/50 p-2 rounded-[2.5rem]">
          <div className="flex items-center justify-between px-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" /> Cloud Storage
            </h2>
            <button onClick={() => navigate('/files')} className="text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors">Explorer</button>
          </div>
          <div className="space-y-1">
            {fLoading ? (
              <p className="text-center py-10 text-slate-400 text-sm animate-pulse">Syncing files...</p>
            ) : recentFiles.map(f => (
              <div 
                key={f.id} 
                onClick={() => navigate('/files')}
                className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white hover:shadow-sm hover:shadow-indigo-500/5 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 border border-indigo-100/50 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{f.filename}</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">
                    {f.mime_type.split('/')[1] || 'File'} Document
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Overview;