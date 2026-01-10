export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  PROFILE: '/profile',
}

export const API_ROUTES = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',

  // Scans
  SCANS: '/api/scans',
  SCAN_UPLOAD: '/api/scans/upload',
  SCAN_DETAILS: (id) => `/api/scans/${id}`,
  SCAN_SLICES: (id) => `/api/scans/${id}/slices`,
  SCAN_SLICE: (id, num) => `/api/scans/${id}/slices/${num}`,
  SCAN_ANALYZE: (id) => `/api/scans/${id}/analyze`,
  SCAN_FEEDBACK: (id) => `/api/scans/${id}/feedback`,
  SCAN_COMMENTS: (id) => `/api/scans/${id}/comments`,
  SCAN_REPORT: (id) => `/api/scans/${id}/report`,

  // Reports
  REPORT_PDF: (id) => `/api/reports/pdf/${id}`,
  REPORT_REGISTRY: '/api/reports/registry',
}
