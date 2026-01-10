import { downloadFile } from './client'
import { saveComment } from './scans'

export const downloadScanReport = async (scanId, comment, token) => {
  try {
    if (comment && comment.trim()) {
      await saveComment(scanId, comment, token)
    }

    return downloadFile(`/api/scans/${scanId}/report`, `scan_report_${scanId}.xlsx`, token)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const downloadPdfReport = async (scanId, token) => {
  return downloadFile(`/api/reports/pdf/${scanId}`, `Report_Scan_${scanId}.pdf`, token)
}

export const downloadRegistry = async (token) => {
  return downloadFile('/api/reports/registry', 'scans_registry.xlsx', token)
}
