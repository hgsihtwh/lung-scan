export { register, login, verifyCode, resendCode, forgotPassword, resetPassword, getMe } from './auth'
export { getPatients, getPatientScans, getDoctorScans, getPatientHistory } from './doctor'
export { getUsers, updateUserRole, deleteUser, getDoctors, getDoctorAssignedPatients, assignPatient, unassignPatient, cleanupOldFiles, cleanupOrphanedFiles } from './admin'

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
  deleteScan,
  getScansHistory,
} from './scans'

export { downloadScanReport } from './reports'
