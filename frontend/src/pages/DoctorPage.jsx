import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const { currentScanId, setCurrentScanId, resetScan } = useScanStore()
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
  const [viewing, setViewing] = useState(false)

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
      setScansTotal((t) => t - 1)
    }
  }

  if (viewing) {
    return <DicomViewer onBack={handleBack} />
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

        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark">
            SCANS
          </h2>
          <button
            onClick={() => navigate(`/dynamics/${selectedPatient.id}`)}
            className="px-5 py-2 rounded-full font-outfit font-medium text-sm transition-colors"
            style={{ backgroundColor: 'var(--color-navy-accent)', color: 'var(--color-bg)' }}
          >
            Dynamics
          </button>
        </div>
        <p className="font-outfit text-base text-primary-dark opacity-60 mb-8 sm:mb-10 lg:mb-[50px]">
          {selectedPatient.email} · {scansTotal} scans
        </p>

        {scansLoading ? (
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
          />
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
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
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
                className="card w-full flex items-center justify-between px-6 py-4 rounded-2xl text-left transition-all"
                style={{ backgroundColor: 'var(--color-bg)' }}
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
  const { currentScanId, setCurrentScanId, resetScan } = useScanStore()
  const [viewing, setViewing] = useState(false)

  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [verdict, setVerdict] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  const [noPatient, setNoPatient] = useState(false)

  const prevFiltersRef = useRef({ search: '', verdict: '', sortOrder: 'desc', noPatient: false })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.search !== debouncedSearch ||
      prevFiltersRef.current.verdict !== verdict ||
      prevFiltersRef.current.sortOrder !== sortOrder ||
      prevFiltersRef.current.noPatient !== noPatient

    prevFiltersRef.current = { search: debouncedSearch, verdict, sortOrder, noPatient }

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
          no_patient: noPatient,
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
  }, [token, debouncedSearch, verdict, sortOrder, noPatient, page])

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
        noPatient={noPatient}
        onNoPatientChange={setNoPatient}
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
  { id: 'patients', label: 'MY PATIENTS' },
  { id: 'myScans', label: 'UPLOADS' },
]

const DoctorPage = () => {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState('patients')

  useEffect(() => {
    initCornerstone()
  }, [])

  return (
    <PageLayout>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-36 sm:pt-44 lg:pt-[200px] pb-12 sm:pb-16 md:pb-20">
        <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark mb-8 sm:mb-10 lg:mb-[50px]">
          {activeTab === 'patients' ? 'MY PATIENTS' : 'UPLOADS'}
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
                  ? { backgroundColor: 'var(--color-navy-accent)', color: 'var(--color-bg)' }
                  : { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }
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
