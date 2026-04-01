import api from '../api/axios';

const fileService = {
  getFiles: async () => {
    const res = await api.get('/files/list/');
    return res.data;
  },

  uploadFile: async (formData) => {
    const res = await api.post('/files/upload/', formData);
    return res.data;
  },

  generateFileLink: async (id, duration) => {
    const res = await api.post(`/files/${id}/generate-link/`, {
      duration_minutes: duration
    });
    return res.data;
  },

  downloadFileBlob: async (token) => {
    const res = await api.get(`/file/download/${token}/`, {
      responseType: 'blob'
    });
    return res;
  }
};

export default fileService;
