import { createStore } from 'vuex';
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
} from '../services/authService';

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
      const response = await loginUser(credentials);
      commit('SET_TOKENS', {
        access: response.data.access,
        refresh: response.data.refresh,
        username: credentials.username
      });
      return response;
    },
    async register(_, userData) {
      const response = await registerUser(userData);
      return response;
    },
    async logout({ commit, state }) {
      try {
        if (state.refreshToken) {
          await logoutUser(state.refreshToken, state.accessToken);
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
        const response = await refreshAccessToken(state.refreshToken);
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
