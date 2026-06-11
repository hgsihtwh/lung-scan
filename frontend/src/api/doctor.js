import { apiClient } from './client'

export const getPatients = async (token, { search, page = 1, size = 20 } = {}) => {
  const params = new URLSearchParams({ page, size })
  if (search) params.set('search', search)
  return apiClient(`/api/v1/doctor/patients?${params}`, { token })
}

export const getPatientScans = async (token, patientId, { search, status, verdict, sort_order = 'desc', page = 1, size = 20 } = {}) => {
  const params = new URLSearchParams({ page, size, sort_order })
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  if (verdict) params.set('verdict', verdict)
  return apiClient(`/api/v1/doctor/patients/${patientId}/scans?${params}`, { token })
}
