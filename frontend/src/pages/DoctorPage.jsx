import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout'
import { useAuthStore } from '@/store'
import { getPatients, getPatientScans } from '@/api'
import { formatDate } from '@/utils/helpers'

const ROLE_BADGE = {
  patient: { label: 'Patient', color: '#1F7819' },
  doctor: { label: 'Doctor', color: '#1A3A5C' },
  admin: { label: 'Admin', color: '#7E2F2F' },
}

const DoctorPage = () => {
  const { token } = useAuthStore()
  const navigate = useNavigate()

  const [patients, setPatients] = useState([])
  const [totalPatients, setTotalPatients] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [selectedPatient, setSelectedPatient] = useState(null)
  const [scans, setScans] = useState([])
  const [scansLoading, setScansLoading] = useState(false)
  const [scansTotal, setScansTotal] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const result = await getPatients(token, { search: debouncedSearch, page })
      if (result.success) {
        setPatients(result.data.items)
        setTotalPatients(result.data.total)
        setPages(result.data.pages)
      }
      setLoading(false)
    }
    load()
  }, [token, debouncedSearch, page])

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient)
    setScansLoading(true)
    const result = await getPatientScans(token, patient.id)
    if (result.success) {
      setScans(result.data.items)
      setScansTotal(result.data.total)
    }
    setScansLoading(false)
  }

  return (
    <PageLayout>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-24 sm:pt-32 lg:pt-[150px] pb-12 sm:pb-16 md:pb-20">

        {!selectedPatient ? (
          <>
            <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark mb-8 sm:mb-10 lg:mb-[50px]">
              PATIENTS
            </h2>

            {/* Search */}
            <div className="mb-8">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email..."
                className="w-full max-w-md px-4 py-3 rounded-full font-outfit text-base focus:outline-none"
                style={{ backgroundColor: '#E1DFD5', border: '1px solid #BEBCB3' }}
              />
            </div>

            {/* Stats */}
            <p className="font-outfit text-sm text-primary-dark opacity-60 mb-6">
              Total patients: {totalPatients}
            </p>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4" />
                <p className="font-outfit text-primary-dark">Loading patients...</p>
              </div>
            ) : patients.length === 0 ? (
              <p className="font-outfit text-primary-dark opacity-60 py-12">No patients found.</p>
            ) : (
              <>
                <div className="space-y-3">
                  {patients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPatient(p)}
                      className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-left transition-all hover:border-primary-navy"
                      style={{ backgroundColor: '#EFEDE3', border: '1px solid transparent' }}
                    >
                      <div>
                        <p className="font-outfit font-medium text-base text-primary-dark">{p.email}</p>
                        <p className="font-outfit text-sm text-primary-dark opacity-60">
                          Registered {formatDate(p.created_at)}
                        </p>
                      </div>
                      <span className="font-outfit text-xs font-medium px-3 py-1 rounded-full text-white"
                        style={{ backgroundColor: ROLE_BADGE[p.role]?.color || '#9CA3AF' }}>
                        {ROLE_BADGE[p.role]?.label || p.role}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center gap-4 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-full font-outfit text-sm bg-primary-navy text-primary-beige disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <span className="font-outfit text-sm text-primary-dark opacity-60">
                      {page} / {pages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      disabled={page === pages}
                      className="px-4 py-2 rounded-full font-outfit text-sm bg-primary-navy text-primary-beige disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* Patient scans view */}
            <button
              onClick={() => setSelectedPatient(null)}
              className="font-outfit text-sm text-primary-dark opacity-60 hover:opacity-100 transition-opacity mb-8 flex items-center gap-2"
            >
              ← Back to patients
            </button>

            <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark mb-2">
              SCANS
            </h2>
            <p className="font-outfit text-base text-primary-dark opacity-60 mb-8 sm:mb-10 lg:mb-[50px]">
              {selectedPatient.email} · {scansTotal} scans
            </p>

            {scansLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4" />
                <p className="font-outfit text-primary-dark">Loading scans...</p>
              </div>
            ) : scans.length === 0 ? (
              <p className="font-outfit text-primary-dark opacity-60 py-12">No scans found.</p>
            ) : (
              <div className="space-y-3">
                {scans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between px-6 py-4 rounded-2xl"
                    style={{ backgroundColor: '#EFEDE3' }}
                  >
                    <div>
                      <p className="font-outfit font-medium text-base text-primary-dark">
                        {scan.patient_name || 'Unknown'}
                      </p>
                      <p className="font-outfit text-sm text-primary-dark opacity-60">
                        {scan.slice_count} slices · {formatDate(scan.created_at)}
                      </p>
                    </div>
                    <span
                      className="font-outfit text-xs font-medium"
                      style={{
                        color: !scan.verdict ? '#9CA3AF' : scan.verdict === 'Normal' ? '#1F7819' : '#7E2F2F',
                      }}
                    >
                      {scan.verdict || scan.status || '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}

export default DoctorPage
