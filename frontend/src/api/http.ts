import axios from 'axios';

const BASE = process.env.REACT_APP_API_BASE || '/api';

const http = axios.create({ baseURL: BASE, timeout: 30000 });

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
  return cfg;
});

http.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default http;
