import { configureStore } from '@reduxjs/toolkit';
import productReducer from './store/productSlice'; // Double check this path!
import fileReducer from './store/fileSlice';

export default configureStore({
  reducer: {
    products: productReducer,
    files: fileReducer,
  },
});