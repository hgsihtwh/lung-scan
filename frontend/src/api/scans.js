import { apiClient, API_URL } from './client'

export const uploadDicom = async (file, token, patientId = null) => {
  const formData = new FormData()
  formData.append('file', file)
  if (patientId !== null && patientId !== '') {
    formData.append('patient_id', patientId)
  }

  return apiClient('/api/scans/upload', {
    method: 'POST',
    token,
    body: formData,
  })
}

export const getScans = async (token, params = {}) => {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.status) query.set('status', params.status)
  if (params.verdict) query.set('verdict', params.verdict)
  if (params.sort_order) query.set('sort_order', params.sort_order)
  if (params.page) query.set('page', params.page)
  if (params.size) query.set('size', params.size)
  const qs = query.toString()
  return apiClient(`/api/scans/${qs ? `?${qs}` : ''}`, { token })
}

export const getScanDetails = async (scanId, token) => {
  return apiClient(`/api/scans/${scanId}`, { token })
}

export const getSliceNumbers = async (scanId, token) => {
  return apiClient(`/api/scans/${scanId}/slices`, { token })
}

export const getSlice = async (scanId, sliceNumber, token) => {
  try {
    const response = await fetch(
      `${API_URL}/api/scans/${scanId}/slices/${sliceNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to get slice')
    }

    const blob = await response.blob()
    return { success: true, data: blob }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const analyzeScans = async (scanId, token) => {
  return apiClient(`/api/scans/${scanId}/analyze`, {
    method: 'POST',
    token,
  })
}

export const getAnalysisStatus = async (scanId, token) => {
  return apiClient(`/api/scans/${scanId}/status`, { token })
}

export const saveFeedback = async (scanId, isAccurate, token) => {
  return apiClient(`/api/scans/${scanId}/feedback`, {
    method: 'POST',
    token,
    body: JSON.stringify({ is_accurate: isAccurate }),
  })
}

export const saveComment = async (scanId, comment, token) => {
  return apiClient(`/api/scans/${scanId}/comments`, {
    method: 'POST',
    token,
    body: JSON.stringify({ comment }),
  })
}

export const deleteScan = async (scanId, token) => {
  return apiClient(`/api/scans/${scanId}`, { method: 'DELETE', token })
}
