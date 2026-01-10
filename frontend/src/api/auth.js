import { apiClient } from './client'

export const register = async (email, password) => {
  return apiClient('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export const login = async (email, password) => {
  const formData = new FormData()
  formData.append('username', email)
  formData.append('password', password)

  return apiClient('/api/auth/login', {
    method: 'POST',
    body: formData,
  })
}
