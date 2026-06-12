export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  PROFILE: '/profile',
  DOCTOR: '/doctor',
  ADMIN: '/admin',
  RESET_PASSWORD: '/reset-password',
  DYNAMICS: '/dynamics',
  PATIENT_DYNAMICS: (patientId) => `/dynamics/${patientId}`,
}

export const API_ROUTES = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  ME: '/api/users/me',

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
  SCAN_HISTORY: '/api/scans/history',

  // Reports
  REPORT_PDF: (id) => `/api/reports/pdf/${id}`,
  REPORT_REGISTRY: '/api/reports/registry',

  // Doctor
  DOCTOR_PATIENTS: '/api/doctor/patients',
  DOCTOR_PATIENT_SCANS: (id) => `/api/doctor/patients/${id}/scans`,
  DOCTOR_PATIENT_HISTORY: (id) => `/api/doctor/patients/${id}/history`,

  // Admin
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_ROLE: (id) => `/api/admin/users/${id}/role`,
}
