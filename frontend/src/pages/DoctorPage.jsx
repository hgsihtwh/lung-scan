import { useState, useEffect, useRef } from 'react'
import { PageLayout } from '@/components/layout'
import { DicomViewer } from '@/components/viewer'
import { useAuthStore, useScanStore } from '@/store'
import { getPatients, getPatientScans, getDoctorScans, deleteScan } from '@/api'
import { formatDate } from '@/utils/helpers'
import { initCornerstone } from '@/utils/cornerstone'
import HistoryControls from '@/components/profile/HistoryControls'
import StudyGrid from '@/components/profile/StudyGrid'

const PAGE_SIZE = 20

// ── Patients tab ────────────────────────────────────────────────────────────

const PatientsTab = ({ token }) => {
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

  useEffect(() => { setPage(1) }, [debouncedSearch])

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

  if (selectedPatient) {
    return (
      <>
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
    )
  }

  return (
    <>
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
              </button>
            ))}
          </div>

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
  )
}

// ── My Scans tab ─────────────────────────────────────────────────────────────

const MyScansTab = ({ token }) => {
  const { setCurrentScanId, resetScan } = useScanStore()
  const [viewing, setViewing] = useState(false)

  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [verdict, setVerdict] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  const prevFiltersRef = useRef({ search: '', verdict: '', sortOrder: 'desc' })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.search !== debouncedSearch ||
      prevFiltersRef.current.verdict !== verdict ||
      prevFiltersRef.current.sortOrder !== sortOrder

    prevFiltersRef.current = { search: debouncedSearch, verdict, sortOrder }

    if (filtersChanged && page !== 1) {
      setPage(1)
      return
    }

    const currentPage = filtersChanged ? 1 : page

    const load = async () => {
      if (!token) return
      setLoading(true)
      try {
        const result = await getDoctorScans(token, {
          search: debouncedSearch,
          verdict,
          sort_order: sortOrder,
          page: currentPage,
          size: PAGE_SIZE,
        })
        if (result.success) {
          const items = result.data.items ?? []
          setScans((prev) => (currentPage === 1 ? items : [...prev, ...items]))
          setHasMore(result.data.page < result.data.pages)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token, debouncedSearch, verdict, sortOrder, page])

  const handleScanClick = (scanId) => {
    setCurrentScanId(scanId)
    setViewing(true)
  }

  const handleBack = () => {
    resetScan()
    setViewing(false)
  }

  const handleDelete = async (scanId) => {
    const result = await deleteScan(scanId, token)
    if (result.success) {
      setScans((prev) => prev.filter((s) => s.id !== scanId))
    }
  }

  if (viewing) {
    return <DicomViewer onBack={handleBack} />
  }

  return (
    <>
      <HistoryControls
        search={searchInput}
        onSearchChange={setSearchInput}
        verdict={verdict}
        onVerdictChange={setVerdict}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4" />
          <p className="font-outfit text-primary-dark">Loading scans...</p>
        </div>
      ) : (
        <StudyGrid
          scans={scans}
          token={token}
          onScanClick={handleScanClick}
          onDelete={handleDelete}
          hasMore={hasMore}
          onLoadMore={() => setPage((p) => p + 1)}
        />
      )}
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'patients', label: 'PATIENTS' },
  { id: 'myScans', label: 'MY SCANS' },
]

const DoctorPage = () => {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState('patients')

  useEffect(() => {
    initCornerstone()
  }, [])

  return (
    <PageLayout>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-24 sm:pt-32 lg:pt-[150px] pb-12 sm:pb-16 md:pb-20">
        <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark mb-8 sm:mb-10 lg:mb-[50px]">
          {activeTab === 'patients' ? 'PATIENTS' : 'MY SCANS'}
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2 rounded-full font-outfit font-medium text-sm transition-colors"
              style={
                activeTab === tab.id
                  ? { backgroundColor: '#233970', color: '#F5F3E9' }
                  : { backgroundColor: '#EFEDE3', color: '#1C1C1C' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'patients' ? (
          <PatientsTab token={token} />
        ) : (
          <MyScansTab token={token} />
        )}
      </div>
    </PageLayout>
  )
}

export default DoctorPage
