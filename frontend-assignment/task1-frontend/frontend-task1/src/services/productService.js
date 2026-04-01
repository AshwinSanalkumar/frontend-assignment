import api from '../api/axios';

const productService = {
  getProducts: async () => {
    const res = await api.get('/products/');
    return res.data;
  },

  addProduct: async (formData) => {
    const res = await api.post('/products/add/', formData);
    return res.data;
  },

  updateProduct: async (id, formData) => {
    const res = await api.put(`/products/update/${id}/`, formData);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/products/delete/${id}/`);
    return res.data;
  },

  getProduct: async (id) => {
    const res = await api.get(`/products/view/${id}/`);
    return res.data;
  }
};

export default productService;
