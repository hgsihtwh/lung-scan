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
