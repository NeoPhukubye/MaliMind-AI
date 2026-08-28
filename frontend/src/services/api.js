import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const transactionsApi = {
  list: (params) => api.get('/api/transactions', { params }),
  create: (data) => api.post('/api/transactions', data),
  flagged: () => api.get('/api/transactions/flagged'),
  summary: () => api.get('/api/transactions/summary'),
  scamShield: (id) => api.get(`/api/transactions/${id}/scam-shield`),
}

export const stokvelsApi = {
  list: () => api.get('/api/stokvels'),
  create: (data) => api.post('/api/stokvels', data),
  get: (id) => api.get(`/api/stokvels/${id}`),
  members: (id) => api.get(`/api/stokvels/${id}/members`),
  addMember: (id, data) => api.post(`/api/stokvels/${id}/members`, data),
  contributions: (id) => api.get(`/api/stokvels/${id}/contributions`),
  addContribution: (id, data) => api.post(`/api/stokvels/${id}/contributions`, data),
}

export const ussdApi = {
  callback: (data) => api.post('/api/ussd/callback', data),
}
