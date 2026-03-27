import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchFiles = createAsyncThunk('files/fetch', async () => {
  const res = await api.get('/files/list/');
  return res.data;
});

export const uploadFile = createAsyncThunk('files/upload', async (formData, { dispatch, rejectWithValue }) => {
  try {
    await api.post('/files/upload/', formData);
    dispatch(fetchFiles());
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Upload failed');
  }
});

// We might not need this mapped globally if it just returns a link, but keeping it unthunked or thunked is fine.
// We'll use a standard API call directly in the component for `generateLink` so we can easily surface the URL response to the user toast/modal.

const fileSlice = createSlice({
  name: 'files',
  initialState: { items: [], loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => { state.loading = true; })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchFiles.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default fileSlice.reducer;
