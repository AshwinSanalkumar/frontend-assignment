import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as Dialog from '@radix-ui/react-dialog';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Trash2, Pencil, X, Image as ImageIcon, AlertCircle, CheckCircle2, Package } from 'lucide-react';
import { updateProduct, deleteProduct } from '../store/productSlice';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import productService from '../services/productService';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: 0,
    image_file: null
  });

  useEffect(() => {
    const fetchProductView = async () => {
      try {
        setLoading(true);
        const data = await productService.getProduct(id);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductView();
  }, [id]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock_quantity: product.stock_quantity,
        image_file: null
      });
    }
  }, [product]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description || '');
    data.append('price', formData.price);
    data.append('stock_quantity', formData.stock_quantity);
    if (formData.image_file) data.append('image_file', formData.image_file);

    try {
      await dispatch(updateProduct({ id: product.id, formData: data })).unwrap();
      const freshData = await productService.getProduct(product.id);
      setProduct(freshData);
      addToast({ title: 'Updated', description: 'Product details refined.', type: 'success' });
      setOpenEdit(false);
    } catch (err) {
      addToast({ title: 'Error', description: err?.detail || 'Failed to update.', type: 'error' });
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;
    try {
      await dispatch(deleteProduct(product.id)).unwrap();
      addToast({ title: 'Removed', description: 'Item deleted from inventory.', type: 'success' });
      navigate('/inventory');
    } catch (err) {
      addToast({ title: 'Error', description: 'Deletion failed.', type: 'error' });
    }
  };

  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Loading Details</p>
            </div>
          ) : (
            <div className="text-center">
              <Package size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-xl font-bold text-slate-800 mb-2">Item Not Found</p>
              <button onClick={() => navigate('/inventory')} className="text-indigo-600 font-bold text-sm hover:text-indigo-700">
                Return to Inventory
              </button>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/inventory')} 
          className="group flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-all"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Inventory
        </button>
      </div>

      <Navbar title={product.name} description={`Reference ID: #${product.id.toString().padStart(4, '0')}`}>
        <div className="flex items-center gap-3">
          <Dialog.Root open={openEdit} onOpenChange={setOpenEdit}>
            <Dialog.Trigger asChild>
              <button className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 active:scale-95">
                <Pencil size={16} /> Edit
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-40" />
              <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md outline-none">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-bold text-slate-900">Update Product</Dialog.Title>
                  <Dialog.Close className="text-slate-400 hover:text-slate-600"><X size={20} /></Dialog.Close>
                </div>
                
                <form onSubmit={handleEditSubmit} className="space-y-4">
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

                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-100 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                    <ImageIcon className="w-6 h-6 text-slate-300 mb-2" />
                    <span className="text-xs text-slate-400 font-medium">{formData.image_file ? formData.image_file.name : "Change Product Image"}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setFormData({ ...formData, image_file: e.target.files[0] })} />
                  </label>

                  <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mt-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    Apply Changes
                  </button>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          <button 
            onClick={handleDelete}
            className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 active:scale-95">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </Navbar>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-10">
        {/* Image Showcase */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[3.5rem] p-4 shadow-2xl shadow-slate-200/60 border border-slate-50 aspect-square flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img 
                src={`http://127.0.0.1:8000${product.image}`} 
                alt={product.name} 
                className="w-full h-full object-cover rounded-[2.8rem]"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="text-slate-200 flex flex-col items-center">
                <ImageIcon size={80} strokeWidth={1} />
                <p className="mt-4 font-bold text-xs uppercase tracking-widest">No Visual Asset</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-10">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-3">Core Description</p>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              {product.description || "No description has been logged for this item."}
            </p>
          </div>

          <div className="flex gap-12 py-8 border-y border-slate-50">
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-3">Unit Price</p>
              <div className="flex items-baseline gap-1">
                <span className="text-indigo-600 text-4xl font-black">₹{product.price}</span>
                <span className="text-slate-300 font-bold text-sm">INR</span>
              </div>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-3">Current Inventory</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${product.stock_quantity > 0 ? 'text-slate-900' : 'text-red-500'}`}>
                  {product.stock_quantity}
                </span>
                <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">Units</span>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-[2rem] border flex items-start gap-4 transition-colors ${
            product.stock_quantity > 10 ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 
            product.stock_quantity > 0 ? 'bg-orange-50/50 border-orange-100 text-orange-700' : 
            'bg-red-50/50 border-red-100 text-red-700'
          }`}>
            <div className="mt-1">
              {product.stock_quantity > 10 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Status Report</h3>
              <p className="text-sm font-medium opacity-80">
                {product.stock_quantity > 10 ? 'Inventory levels are optimal. This product is healthy and ready for distribution.' : 
                 product.stock_quantity > 0 ? 'Stock is running low. Evaluate sales trends and consider creating a restock order.' : 
                 'Inventory depleted. This item is hidden from public storefronts until restocked.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;