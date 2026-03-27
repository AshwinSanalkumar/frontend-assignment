import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchProducts = createAsyncThunk('products/fetch', async () => {
  const res = await api.get('/products/');
  return res.data;
});

export const addProduct = createAsyncThunk('products/add', async (formData, { dispatch, rejectWithValue }) => {
  try {
    // REMOVED: manual Content-Type header
    // The browser will now automatically set multipart/form-data WITH the boundary
    await api.post('/products/add/', formData); 
    
    dispatch(fetchProducts());
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id) => {
  await api.delete(`/products/delete/${id}/`);
  return id;
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, formData }, { dispatch, rejectWithValue }) => {
  try {
    await api.put(`/products/update/${id}/`, formData);
    dispatch(fetchProducts());
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      });
  },
});

export default productSlice.reducer;