export { register, login, verifyCode, resendCode, forgotPassword, resetPassword, getMe } from './auth'
export { getPatients, getPatientScans } from './doctor'
export { getUsers, updateUserRole } from './admin'

export {
  uploadDicom,
  getScans,
  getScanDetails,
  getSliceNumbers,
  getSlice,
  analyzeScans,
  getAnalysisStatus,
  saveFeedback,
  saveComment,
} from './scans'

export { downloadScanReport } from './reports'
