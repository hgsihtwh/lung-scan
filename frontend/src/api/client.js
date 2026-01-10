const API_URL = 'http://localhost:8000'

export const apiClient = async (endpoint, options = {}) => {
  const { token, ...fetchOptions } = options

  const headers = {
    ...fetchOptions.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || 'Request failed')
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const downloadFile = async (endpoint, filename, token) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.detail || 'Download failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
