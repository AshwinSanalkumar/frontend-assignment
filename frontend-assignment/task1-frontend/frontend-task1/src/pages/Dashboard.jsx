import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useToast } from '../context/ToastContext';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import { fetchProducts, addProduct } from '../store/productSlice';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.products || { items: [] });
  const { addToast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: 0,
    image_file: null
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const safeItems = Array.isArray(items) ? items : [];
  const totalPages = Math.max(1, Math.ceil(safeItems.length / itemsPerPage));
  const currentItems = safeItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description || '');
    data.append('price', formData.price);
    data.append('stock_quantity', formData.stock_quantity);
    
    if (formData.image_file) {
      data.append('image_file', formData.image_file);
    }

    try {
      await dispatch(addProduct(data)).unwrap();
      addToast({ title: 'Success', description: 'Product added successfully.', type: 'success' });
      setOpen(false);
      setFormData({ name: '', description: '', price: '', stock_quantity: 0, image_file: null });
    } catch (err) {
      addToast({ title: 'Error', description: err?.detail || 'Failed to add product.', type: 'error' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image_file: file });
    }
  };

  return (
    <Layout>
      <Navbar title="Products" description="Manage your inventory">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button 
              onClick={() => {
                setFormData({ name: '', description: '', price: '', stock_quantity: 0, image_file: null });
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2">
              <Plus size={20} /> Add Product
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 max-h-[90vh] overflow-y-auto outline-none">
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-2xl font-bold">New Inventory Item</Dialog.Title>
                <Dialog.Close className="text-slate-400"><X size={24} /></Dialog.Close>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required type="text" placeholder="Name" className="w-full p-3 bg-slate-50 rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />

                <textarea placeholder="Description" className="w-full p-3 bg-slate-50 rounded-xl ring-1 ring-slate-200 h-24 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

                <div className="flex gap-4">
                  <input required type="number" step="0.01" placeholder="Price" className="flex-1 w-full p-3 bg-slate-50 rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                  <input required type="number" placeholder="Stock" className="flex-1 w-full p-3 bg-slate-50 rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} />
                </div>

                <div>
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 font-medium text-center px-4">
                        {formData.image_file ? formData.image_file.name : "Click to upload image"}
                      </p>
                    </div>
                    <input 
                      id="file-upload"
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  </label>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold mt-4 hover:bg-indigo-700 shadow-lg transition-all">
                  Create Product Entry
                </button>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Navbar>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading && safeItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">Loading products...</div>
        ) : safeItems.length > 0 ? currentItems.map(p => (
          <div 
            key={p.id} 
            onClick={() => navigate(`/product/${p.id}`)}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="h-48 bg-slate-200 relative overflow-hidden">
              {p.image ? (
                <img 
                  src={`http://127.0.0.1:8000${p.image}`} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  crossOrigin="anonymous"
                  onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Load+Error'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-500"><ImageIcon size={48} /></div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">{p.name}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{p.description || "No description provided."}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-2xl font-black text-indigo-600">${p.price}</span>
                <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 w-fit rounded-full flex gap-1 items-center">
                  QTY {p.stock_quantity}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 border-dashed">
            No products available. Add your first item!
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-12 gap-4">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-slate-500 font-bold px-4">
            {currentPage} / {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;