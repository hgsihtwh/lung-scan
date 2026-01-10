export const CONFIG = {
  // API
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',

  // Upload
  MAX_FILE_SIZE_MB: 500,
  ACCEPTED_FILE_TYPES: {
    'application/zip': ['.zip'],
    'application/x-zip-compressed': ['.zip'],
  },

  // Viewer
  DEFAULT_WINDOW_WIDTH: 400,
  DEFAULT_WINDOW_CENTER: 40,
  THUMBNAILS_COUNT: 8,
  PAN_MODE_DURATION: 30000, // 30 секунд

  // Auto-save
  COMMENT_DEBOUNCE_MS: 1000,

  // Pagination
  STUDIES_PER_PAGE: 12,
}
