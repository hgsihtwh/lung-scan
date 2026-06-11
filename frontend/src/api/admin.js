import { apiClient } from './client'

export const getUsers = async (token, { search, role, page = 1, size = 20 } = {}) => {
  const params = new URLSearchParams({ page, size })
  if (search) params.set('search', search)
  if (role) params.set('role', role)
  return apiClient(`/api/v1/admin/users?${params}`, { token })
}

export const updateUserRole = async (token, userId, role) => {
  return apiClient(`/api/v1/admin/users/${userId}/role`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ role }),
  })
}
