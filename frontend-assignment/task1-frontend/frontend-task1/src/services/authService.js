import api from '../api/axios';

const authService = {
  login: async (creds) => {
    const res = await api.post('/login/', creds);
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/register/', userData);
    return res.data;
  }
};

export default authService;
