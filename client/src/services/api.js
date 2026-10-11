import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token from localStorage as fallback
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
};

// Books
export const bookAPI = {
  getBooks: (params) => API.get('/books', { params }),
  getBook: (id) => API.get(`/books/${id}`),
  getCategories: () => API.get('/books/categories'),
};

// Orders
export const orderAPI = {
  getMyOrders: () => API.get('/orders/my-orders'),
  getOrder: (id) => API.get(`/orders/${id}`),
  regenerateToken: (orderId, bookId) =>
    API.post(`/orders/${orderId}/download-token/${bookId}`),
};

// Payment
export const paymentAPI = {
  createOrder: (items) => API.post('/payment/create-order', { items }),
  verifyPayment: (data) => API.post('/payment/verify', data),
};

// Download
export const downloadAPI = {
  getPreview: (bookId) => API.get(`/download/preview/${bookId}`),
  getDownloadInfo: (token) => API.get(`/download/${token}/info`),
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getBooks: () => API.get('/admin/books'),
  createBook: (formData) =>
    API.post('/admin/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateBook: (id, formData) =>
    API.put(`/admin/books/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteBook: (id) => API.delete(`/admin/books/${id}`),
  getOrders: (params) => API.get('/admin/orders', { params }),
};

export default API;
