import { useState, useEffect } from 'react'
import { PageLayout } from '@/components/layout'
import { Select } from '@/components/ui'
import { FileUploadZone } from '@/components/upload'
import { DicomViewer } from '@/components/viewer'
import { useAuthStore, useScanStore, useUIStore } from '@/store'
import { getPatients } from '@/api'
import { initCornerstone } from '@/utils/cornerstone'

const UploadPage = () => {
  const { token } = useAuthStore()
  const { resetScan } = useScanStore()
  const { currentStep, setCurrentStep } = useUIStore()

  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')

  useEffect(() => {
    initCornerstone()
    resetScan()
    setCurrentStep('upload')
  }, [])

  useEffect(() => {
    const load = async () => {
      const result = await getPatients(token, { size: 100 })
      if (result.success) setPatients(result.data.items)
    }
    load()
  }, [token])

  const patientOptions = [
    { label: 'Without patient', value: '' },
    ...patients.map((p) => ({ label: p.email, value: String(p.id) })),
  ]

  return (
    <PageLayout>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-24 sm:pt-32 lg:pt-[150px] pb-12 sm:pb-16 md:pb-20">
        <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark mb-8 sm:mb-10 lg:mb-[50px]">
          UPLOAD SCAN
        </h2>

        {currentStep === 'viewer' ? (
          <DicomViewer />
        ) : (
          <>
            <div className="mb-8">
              <p className="font-outfit text-sm text-primary-dark opacity-60 uppercase tracking-widest mb-3">
                Patient
              </p>
              <Select
                value={selectedPatientId}
                onChange={setSelectedPatientId}
                options={patientOptions}
                placeholder="Without patient"
                searchable
              />
            </div>

            <FileUploadZone patientId={selectedPatientId || null} />
          </>
        )}
      </div>
    </PageLayout>
  )
}

export default UploadPage
