import React, { useState } from 'react';
import api from '../api/axios';

const ProductForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0) return alert("Please fill fields correctly");
    
    setLoading(true);
    try {
      await api.post('/products/add/', formData);
      onSuccess(); // Refreshes list and closes modal
    } catch (err) {
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <input 
        type="text" placeholder="Product Name" required
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
        onChange={e => setFormData({...formData, name: e.target.value})}
      />
      <input 
        type="number" placeholder="Price" required
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
        onChange={e => setFormData({...formData, price: e.target.value})}
      />
      <textarea 
        placeholder="Description" rows="3"
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
        onChange={e => setFormData({...formData, description: e.target.value})}
      ></textarea>
      <button 
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Create Product"}
      </button>
    </form>
  );
};

export default ProductForm;