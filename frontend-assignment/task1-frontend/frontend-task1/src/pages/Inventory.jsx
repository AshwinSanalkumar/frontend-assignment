import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useToast } from '../context/ToastContext';
import { Plus, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts, addProduct } from '../store/productSlice';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import ViewToggle from '../components/ViewToggle';

const Inventory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.products || { items: [] });
  const { addToast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: 0,
    image_file: null
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 8 : 10;
  const safeItems = Array.isArray(items) ? items : [];
  const totalPages = Math.max(1, Math.ceil(safeItems.length / itemsPerPage));
  const currentItems = safeItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });

    try {
      await dispatch(addProduct(data)).unwrap();
      addToast({ title: 'Success', description: 'Product added successfully.', type: 'success' });
      setOpen(false);
      setFormData({ name: '', description: '', price: '', stock_quantity: 0, image_file: null });
    } catch (err) {
      addToast({ title: 'Error', description: err?.detail || 'Failed to add product.', type: 'error' });
    }
  };

  return (
    <Layout>
      <Navbar title="Inventory" description="Manage and track your products.">
        <div className="flex items-center gap-4 mr-4">
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm shadow-sm active:scale-95">
                <Plus size={18} /> Add Product
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-40 animate-in fade-in duration-300" />
              <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md outline-none animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-bold text-slate-900">New Product</Dialog.Title>
                  <Dialog.Close className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></Dialog.Close>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input required type="text" placeholder="Product Name" className="w-full p-3 bg-slate-50 rounded-xl border border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all"
                      value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />

                  <textarea placeholder="Description" className="w-full p-3 bg-slate-50 rounded-xl border border-transparent focus:border-indigo-100 focus:bg-white h-24 outline-none transition-all resize-none"
                      value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

                  <div className="flex gap-3">
                    <input required type="number" step="0.01" placeholder="Price" className="w-45 flex-1 p-3 bg-slate-50 rounded-xl border border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all"
                        value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                    <input required type="number" placeholder="Stock" className="w-45 flex-1 p-3 bg-slate-50 rounded-xl border border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all"
                        value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} />
                  </div>

                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-100 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50 transition-all group">
                    <ImageIcon className="w-6 h-6 text-slate-300 mb-2 group-hover:text-indigo-400" />
                    <span className="text-xs text-slate-400 font-medium">{formData.image_file ? formData.image_file.name : "Upload image"}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setFormData({ ...formData, image_file: e.target.files[0] })} />
                  </label>

                  <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mt-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                    Create Product
                  </button>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
      </Navbar>

      <div className="mt-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading && safeItems.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-medium animate-pulse">Loading products...</div>
            ) : currentItems.map(p => (
              <div 
                key={p.id} 
                onClick={() => navigate(`/product/${p.id}`)}
                className="group bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Fixed Image Proportion */}
                <div className="h-40 bg-slate-50 relative overflow-hidden">
                  {p.image ? (
                    <img 
                      src={`http://127.0.0.1:8000${p.image}`} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100">
                    STK: {p.stock_quantity}
                  </div>
                </div>
                {/* Refined Info Area */}
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-800 truncate flex-1">{p.name}</h3>
                    <span className="text-sm font-bold text-indigo-600">₹{p.price}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-1 font-medium leading-relaxed">
                    {p.description || "No description provided."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map(p => (
                  <tr key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          {p.image && <img src={`http://127.0.0.1:8000${p.image}`} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />}
                        </div>
                        <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 font-bold text-slate-900">₹{p.price}</td>
                    <td className="px-8 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${p.stock_quantity > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        <div className={`w-1 h-1 rounded-full ${p.stock_quantity > 5 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {p.stock_quantity > 0 ? `${p.stock_quantity} IN STOCK` : 'OUT OF STOCK'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Minimalist Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-3 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="bg-white px-6 py-3 rounded-xl border border-slate-100 shadow-sm text-sm font-bold text-slate-600">
              {currentPage} <span className="text-slate-300 mx-2">/</span> {totalPages}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-3 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Inventory;