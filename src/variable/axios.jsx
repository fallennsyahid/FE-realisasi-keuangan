import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000/api/';
// const baseURL = 'https://api-dash.kemenkopukm.go.id/api/';

axios.defaults.baseURL = baseURL;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axios;
