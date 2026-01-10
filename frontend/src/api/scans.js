import { apiClient } from './client'

export const uploadDicom = async (file, token) => {
  const formData = new FormData()
  formData.append('file', file)

  return apiClient('/api/scans/upload', {
    method: 'POST',
    token,
    body: formData,
  })
}

export const getScans = async (token) => {
  return apiClient('/api/scans/', { token })
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
      `http://localhost:8000/api/scans/${scanId}/slices/${sliceNumber}`,
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
