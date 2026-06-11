import { apiClient } from './client'

export const getUsers = async (token, { search, role, page = 1, size = 20 } = {}) => {
  const params = new URLSearchParams({ page, size })
  if (search) params.set('search', search)
  if (role) params.set('role', role)
  return apiClient(`/api/admin/users?${params}`, { token })
}

export const updateUserRole = async (token, userId, role) => {
  return apiClient(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ role }),
  })
}

export const deleteUser = async (token, userId) => {
  return apiClient(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    token,
  })
}

export const getDoctors = async (token, { search, page = 1, size = 20 } = {}) => {
  const params = new URLSearchParams({ page, size })
  if (search) params.set('search', search)
  return apiClient(`/api/admin/doctors?${params}`, { token })
}

export const getDoctorAssignedPatients = async (token, doctorId) => {
  return apiClient(`/api/admin/doctors/${doctorId}/patients?size=100`, { token })
}

export const assignPatient = async (token, doctorId, patientId) => {
  return apiClient(`/api/admin/doctors/${doctorId}/patients/${patientId}`, {
    method: 'POST',
    token,
  })
}

export const unassignPatient = async (token, doctorId, patientId) => {
  return apiClient(`/api/admin/doctors/${doctorId}/patients/${patientId}`, {
    method: 'DELETE',
    token,
  })
}

export const cleanupOldFiles = async (token, days) => {
  return apiClient(`/api/admin/cleanup/old-files?days=${days}`, {
    method: 'POST',
    token,
  })
}

export const cleanupOrphanedFiles = async (token) => {
  return apiClient('/api/admin/cleanup/orphaned-files', {
    method: 'POST',
    token,
  })
}
