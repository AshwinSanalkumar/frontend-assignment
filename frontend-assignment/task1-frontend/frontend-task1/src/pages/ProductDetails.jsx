import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as Dialog from '@radix-ui/react-dialog';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Trash2, Pencil, X, Image as ImageIcon } from 'lucide-react';
import { updateProduct, deleteProduct } from '../store/productSlice';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import api from '../api/axios';

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
        const res = await api.get(`/products/view/${id}/`);
        setProduct(res.data);
      } catch (err) {
        addToast({ title: 'Error', description: 'Failed to load product details.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductView();
  }, [id, addToast]);

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
    
    if (formData.image_file) {
      data.append('image_file', formData.image_file);
    }

    try {
      await dispatch(updateProduct({ id: product.id, formData: data })).unwrap();
      
      const freshData = await api.get(`/products/view/${product.id}/`);
      setProduct(freshData.data);
      
      addToast({ title: 'Success', description: 'Product updated successfully.', type: 'success' });
      setOpenEdit(false);
    } catch (err) {
      addToast({ title: 'Error', description: err?.detail || 'Failed to update product.', type: 'error' });
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      await dispatch(deleteProduct(product.id)).unwrap();
      addToast({ title: 'Deleted', description: 'Product removed from inventory.', type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      addToast({ title: 'Error', description: 'Failed to delete product.', type: 'error' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image_file: file });
    }
  };

  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          {loading ? (
            <p className="text-xl font-bold text-slate-500">Loading details...</p>
          ) : (
            <div className="text-center">
              <p className="text-2xl font-black text-slate-800 mb-2">Product Not Found</p>
              <button onClick={() => navigate('/dashboard')} className="text-indigo-600 font-bold hover:underline">
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <button 
        onClick={() => navigate('/dashboard')} 
        className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 mb-8 transition-colors w-fit"
      >
        <ArrowLeft size={20} /> Back to Products
      </button>

      <Navbar title={product.name} description={`Listing ID: ${product.id}`}>
        <div className="flex items-center gap-4">
          <Dialog.Root open={openEdit} onOpenChange={setOpenEdit}>
            <Dialog.Trigger asChild>
              <button className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-6 py-3 rounded-2xl font-bold shadow-sm flex items-center gap-2 transition-all">
                <Pencil size={20} /> Edit Product
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" />
              <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 max-h-[90vh] overflow-y-auto outline-none">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-2xl font-bold">Edit Product</Dialog.Title>
                  <Dialog.Close className="text-slate-400"><X size={24} /></Dialog.Close>
                </div>
                
                <form onSubmit={handleEditSubmit} className="space-y-4">
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
                          {formData.image_file ? formData.image_file.name : "Click to upload a new image"}
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
                    Update Product Entry
                  </button>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          <button 
            onClick={handleDelete}
            className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-3 rounded-2xl font-bold shadow-sm flex items-center gap-2 transition-all">
            <Trash2 size={20} /> Delete Product
          </button>
        </div>
      </Navbar>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">
        <div className="bg-white rounded-[3rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center overflow-hidden aspect-square">
          {product.image ? (
            <img 
              src={`http://127.0.0.1:8000${product.image}`} 
              alt={product.name} 
              className="w-full h-full object-cover rounded-[2.5rem]"
              crossOrigin="anonymous"
              onError={(e) => { e.target.src = 'https://placehold.co/800x800?text=Load+Error'; }}
            />
          ) : (
            <div className="text-slate-300 flex flex-col items-center">
              <ImageIcon size={64} />
              <p className="mt-4 font-bold">No Image Available</p>
            </div>
          )}
        </div>

        <div className="space-y-8 flex flex-col justify-center">
          <div>
            <h2 className="text-slate-500 font-bold uppercase tracking-wider mb-2">Description</h2>
            <p className="text-slate-700 text-lg leading-relaxed">{product.description || "No description provided."}</p>
          </div>

          <div className="flex gap-8 border-y border-slate-100 py-8">
            <div>
              <h2 className="text-slate-500 font-bold uppercase tracking-wider mb-2">Price</h2>
              <p className="text-4xl font-black text-indigo-600">${product.price}</p>
            </div>
            <div>
              <h2 className="text-slate-500 font-bold uppercase tracking-wider mb-2">Stock Level</h2>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-black ${product.stock_quantity > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {product.stock_quantity}
                </span>
                <span className="text-slate-400 font-bold">Units Available</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2">Inventory Status</h3>
            {product.stock_quantity > 10 ? (
              <p className="text-slate-600">Product is safely stocked. No immediate action required.</p>
            ) : product.stock_quantity > 0 ? (
              <p className="text-orange-600 font-medium">Low stock warning! Consider restocking this item soon.</p>
            ) : (
              <p className="text-red-600 font-bold">Out of stock! This item is currently unavailable.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
