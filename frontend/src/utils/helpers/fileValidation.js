export const isZipFile = (file) => {
  if (!file) return false

  const validTypes = ['application/zip', 'application/x-zip-compressed', 'application/x-zip']

  const hasValidType = validTypes.includes(file.type)
  const hasValidExtension = file.name?.toLowerCase().endsWith('.zip')

  return hasValidType || hasValidExtension
}

export const checkFileSize = (file, maxSizeMB = 500) => {
  if (!file) return { valid: false, error: 'No file provided' }

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  return { valid: true }
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const validateDicomArchive = (file, options = {}) => {
  const { maxSizeMB = 500 } = options
  const errors = []

  if (!file) {
    return { valid: false, errors: ['No file provided'] }
  }

  if (!isZipFile(file)) {
    errors.push('File must be a ZIP archive')
  }

  const sizeCheck = checkFileSize(file, maxSizeMB)
  if (!sizeCheck.valid) {
    errors.push(sizeCheck.error)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
