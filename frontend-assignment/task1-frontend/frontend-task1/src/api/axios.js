import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Matches your Django server
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't already retried this request, and it's not the login endpoint
    if (
      error.response && 
      error.response.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url.includes('/login/')
    ) {
      
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to get a new access token using the refresh token
        // IMPORTANT: Ensure this endpoint matches your backend token refresh URL
        const res = await axios.post('http://127.0.0.1:8000/api/refresh/', {
          refresh: refreshToken,
        });

        if (res.status === 200) {
          // Save new access token (and refresh token if backend rotates it)
          localStorage.setItem('access', res.data.access);
          if (res.data.refresh) {
            localStorage.setItem('refresh', res.data.refresh);
          }

          processQueue(null, res.data.access);

          // Update the original request's auth header
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          isRefreshing = false;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;

        // Refresh token expired or invalid, clear localStorage and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;