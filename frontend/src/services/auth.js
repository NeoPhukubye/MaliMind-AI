import { api } from './api'

export async function loginWithClerk(clerkToken) {
  const res = await api.post('/api/users/auth', { token: clerkToken })
  localStorage.setItem('token', res.data.access_token)
  return res.data.user
}

export async function getCurrentUser() {
  const res = await api.get('/api/users/me')
  return res.data
}

export function logout() {
  localStorage.removeItem('token')
  window.location.href = '/'
}
