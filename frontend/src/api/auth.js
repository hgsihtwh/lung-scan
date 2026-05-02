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

export const verifyCode = async (email, code) => {
  return apiClient('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  })
}

export const resendCode = async (email) => {
  return apiClient('/api/auth/resend-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export const forgotPassword = async (email) => {
  return apiClient('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export const resetPassword = async (token, new_password) => {
  return apiClient('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password }),
  })
}
