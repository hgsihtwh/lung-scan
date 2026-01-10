export { register, login } from './auth'

export {
  uploadDicom,
  getScans,
  getScanDetails,
  getSliceNumbers,
  getSlice,
  analyzeScans,
  saveFeedback,
  saveComment,
} from './scans'

export { downloadScanReport, downloadPdfReport, downloadRegistry } from './reports'
