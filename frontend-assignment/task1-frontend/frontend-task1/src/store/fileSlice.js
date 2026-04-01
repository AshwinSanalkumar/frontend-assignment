import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fileService from '../services/fileService';

export const fetchFiles = createAsyncThunk('files/fetch', async () => {
  const data = await fileService.getFiles();
  return data;
});

export const uploadFile = createAsyncThunk('files/upload', async (formData, { dispatch, rejectWithValue }) => {
  try {
    await fileService.uploadFile(formData);
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
