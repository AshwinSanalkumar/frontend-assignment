import { createStore } from 'vuex';
import axios from 'axios';

// A separate axios instance for store so we don't cause circular dependencies
// with api.interceptors that imports this store.
const storeApi = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default createStore({
  state() {
    return {
      accessToken: localStorage.getItem('access_token') || null,
      refreshToken: localStorage.getItem('refresh_token') || null,
      username: localStorage.getItem('user') || null,
      userFavorites: [],
    };
  },
  mutations: {
    SET_TOKENS(state, { access, refresh, username }) {
      state.accessToken = access;
      state.refreshToken = refresh;
      if (username) {
        state.username = username;
        localStorage.setItem('user', username);
      }
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    },
    CLEAR_TOKENS(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.username = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    },
    UPDATE_ACCESS_TOKEN(state, access) {
      state.accessToken = access;
      localStorage.setItem('access_token', access);
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const response = await storeApi.post('login/', credentials);
      commit('SET_TOKENS', {
        access: response.data.access,
        refresh: response.data.refresh,
        username: credentials.username
      });
      return response;
    },
    async register(_, userData) {
      const response = await storeApi.post('register/', userData);
      return response;
    },
    async logout({ commit, state }) {
      try {
        if (state.refreshToken) {
          // Send request with refresh token to blacklist it on the backend
          const requestHeaders = state.accessToken
            ? { Authorization: `Bearer ${state.accessToken}` }
            : {};
          await storeApi.post('logout/', { refresh: state.refreshToken }, {
            headers: requestHeaders
          });
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        commit('CLEAR_TOKENS');
      }
    },
    async refreshToken({ commit, state }) {
      if (!state.refreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        const response = await storeApi.post('refresh/', {
          refresh: state.refreshToken,
        });

        commit('UPDATE_ACCESS_TOKEN', response.data.access);
        return response.data;
      } catch (error) {
        commit('CLEAR_TOKENS');
        throw error;
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  }
});
