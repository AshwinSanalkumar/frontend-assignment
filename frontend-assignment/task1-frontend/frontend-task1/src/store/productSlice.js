import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../services/productService';

export const fetchProducts = createAsyncThunk('products/fetch', async () => {
  const data = await productService.getProducts();
  return data;
});

export const addProduct = createAsyncThunk('products/add', async (formData, { dispatch, rejectWithValue }) => {
  try {
    await productService.addProduct(formData);
    dispatch(fetchProducts());
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id) => {
  await productService.deleteProduct(id);
  return id;
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, formData }, { dispatch, rejectWithValue }) => {
  try {
    await productService.updateProduct(id, formData);
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