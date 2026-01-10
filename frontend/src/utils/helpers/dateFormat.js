export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)

  if (isNaN(date.getTime())) return 'Invalid date'

  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleDateString('en-GB', { month: 'short' })
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day} ${month} ${year}, ${hours}:${minutes}`
}

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)

  if (isNaN(date.getTime())) return 'Invalid date'

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const formatDateISO = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)

  if (isNaN(date.getTime())) return ''

  return date.toISOString().split('T')[0]
}

export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  const now = new Date()

  if (isNaN(date.getTime())) return 'Invalid date'

  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return formatDate(dateString)
}
