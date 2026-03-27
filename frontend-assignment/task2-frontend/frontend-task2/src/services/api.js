import axios from 'axios';
import store from '../store';
import router from '../router';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    // Access token directly from state as we aren't using an auth module
    const token = store.state.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh fails (or login fails 401)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== 'login/' &&
      originalRequest.url !== 'refresh/'
    ) {
      originalRequest._retry = true;

      try {
        await store.dispatch('refreshToken');
        
        // Update header for new token
        originalRequest.headers.Authorization = `Bearer ${store.state.accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, log the user out to force a fresh login
        await store.dispatch('logout');
        router.push('/login');
        return Promise.reject(refreshError);
      }
    }
    
    console.error('API Response Error:', error.response || error);
    return Promise.reject(error);
  }
);

export default api;
