import { useState, useEffect } from 'react'
import { Trash2, ChevronDown, X } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Select } from '@/components/ui'
import { useAuthStore } from '@/store'
import {
  getUsers, updateUserRole, deleteUser,
  getDoctors, getDoctorAssignedPatients, assignPatient, unassignPatient,
  cleanupOldFiles, cleanupOrphanedFiles, getAuditLog,
} from '@/api'
import { formatDate, formatDateTime } from '@/utils/helpers'

const Section = ({ title, children, defaultOpen = true, maxHeight = '560px' }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card mt-8 rounded-2xl" style={{ backgroundColor: 'var(--color-bg)' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-6 text-left"
        style={{ borderRadius: open ? '16px 16px 0 0' : '16px' }}
      >
        <h3 className="font-outfit font-semibold text-xl text-primary-dark">{title}</h3>
        <ChevronDown
          size={20}
          className="text-primary-dark opacity-50 transition-transform flex-shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div
          className="px-6 pb-8 scroll-styled"
          style={{
            borderTop: '1px solid rgba(28,28,28,0.08)',
            borderRadius: '0 0 16px 16px',
            maxHeight,
            overflowY: 'auto',
          }}
        >
          <div className="pt-6">{children}</div>
        </div>
      )}
    </div>
  )
}

const ROLES = ['patient', 'doctor', 'admin']

const ROLE_OPTIONS = ROLES.map((r) => ({ label: r, value: r }))

const ROLE_FILTER_OPTIONS = [
  { label: 'All roles', value: '' },
  ...ROLE_OPTIONS,
]

const ConfirmModal = ({ isOpen, email, onConfirm, onCancel }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <h3 className="font-outfit font-semibold text-xl text-primary-dark mb-3">
          Delete user?
        </h3>
        <p className="font-outfit text-sm text-primary-dark opacity-70 mb-8">
          User <span className="font-medium opacity-100">{email}</span> and all their scans will be
          permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-full font-outfit text-sm text-primary-dark hover:opacity-70 transition-opacity"
            style={{ border: '1px solid var(--color-border)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-full bg-red-600 text-white font-outfit text-sm hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

const MaintenanceBlock = ({ token }) => {
  const [days, setDays] = useState(30)
  const [oldFilesResult, setOldFilesResult] = useState(null)
  const [orphanedResult, setOrphanedResult] = useState(null)
  const [loadingOld, setLoadingOld] = useState(false)
  const [loadingOrphaned, setLoadingOrphaned] = useState(false)

  const handleCleanOld = async () => {
    setLoadingOld(true)
    setOldFilesResult(null)
    const result = await cleanupOldFiles(token, days)
    if (result.success) {
      setOldFilesResult(`Removed ${result.data.deleted} file(s) older than ${days} days.`)
    } else {
      setOldFilesResult(`Error: ${result.error}`)
    }
    setLoadingOld(false)
  }

  const handleCleanOrphaned = async () => {
    setLoadingOrphaned(true)
    setOrphanedResult(null)
    const result = await cleanupOrphanedFiles(token)
    if (result.success) {
      setOrphanedResult(`Removed ${result.data.deleted_orphaned} orphaned file(s).`)
    } else {
      setOrphanedResult(`Error: ${result.error}`)
    }
    setLoadingOrphaned(false)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6">
        {/* Old files */}
        <div className="flex-1">
          <p className="font-outfit text-sm text-primary-dark opacity-70 mb-3">
            Delete scans older than N days
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-full font-outfit text-sm text-primary-dark focus:outline-none"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            />
            <button
              onClick={handleCleanOld}
              disabled={loadingOld}
              className="px-5 py-2 rounded-full font-outfit text-sm bg-primary-navy text-primary-beige hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {loadingOld ? 'Cleaning...' : 'Run'}
            </button>
          </div>
          {oldFilesResult && (
            <p className="mt-2 font-outfit text-sm text-primary-dark opacity-70">{oldFilesResult}</p>
          )}
        </div>

        <div className="w-px bg-primary-dark opacity-10 hidden sm:block" />

        {/* Orphaned files */}
        <div className="flex-1">
          <p className="font-outfit text-sm text-primary-dark opacity-70 mb-3">
            Delete orphaned files (not linked to any scan)
          </p>
          <button
            onClick={handleCleanOrphaned}
            disabled={loadingOrphaned}
            className="px-5 py-2 rounded-full font-outfit text-sm bg-primary-navy text-primary-beige hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {loadingOrphaned ? 'Cleaning...' : 'Run'}
          </button>
          {orphanedResult && (
            <p className="mt-2 font-outfit text-sm text-primary-dark opacity-70">{orphanedResult}</p>
          )}
        </div>
    </div>
  )
}

// ── Assignments block ────────────────────────────────────────────────────────

const DoctorRow = ({ doctor, token, allPatients }) => {
  const [expanded, setExpanded] = useState(false)
  const [assigned, setAssigned] = useState(null)
  const [loadingAssigned, setLoadingAssigned] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [assigning, setAssigning] = useState(false)

  const load = async () => {
    setLoadingAssigned(true)
    const result = await getDoctorAssignedPatients(token, doctor.id)
    if (result.success) setAssigned(result.data.items)
    setLoadingAssigned(false)
  }

  const handleExpand = () => {
    const next = !expanded
    setExpanded(next)
    if (next && assigned === null) load()
  }

  const handleAssign = async () => {
    if (!selectedPatientId) return
    setAssigning(true)
    const result = await assignPatient(token, doctor.id, Number(selectedPatientId))
    if (result.success) {
      const patient = allPatients.find((p) => String(p.id) === selectedPatientId)
      if (patient) setAssigned((prev) => [...(prev || []), patient])
      setSelectedPatientId('')
    }
    setAssigning(false)
  }

  const handleUnassign = async (patientId) => {
    const result = await unassignPatient(token, doctor.id, patientId)
    if (result.success) setAssigned((prev) => prev.filter((p) => p.id !== patientId))
  }

  const assignedIds = new Set((assigned || []).map((p) => String(p.id)))
  const patientOptions = [
    { label: 'Select patient...', value: '' },
    ...allPatients
      .filter((p) => !assignedIds.has(String(p.id)))
      .map((p) => ({ label: p.email, value: String(p.id) })),
  ]

  return (
    <div className="card" style={{ backgroundColor: 'var(--color-bg)', borderRadius: '16px' }}>
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        style={{ borderRadius: expanded ? '16px 16px 0 0' : '16px' }}
      >
        <div>
          <p className="font-outfit font-medium text-base text-primary-dark">{doctor.email}</p>
          <p className="font-outfit text-sm text-primary-dark opacity-60">
            {assigned !== null ? `${assigned.length} patient(s) assigned` : 'Click to expand'}
          </p>
        </div>
        <ChevronDown
          size={18}
          className="text-primary-dark opacity-50 transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {expanded && (
        <div className="px-6 pb-5" style={{ borderTop: '1px solid rgba(28,28,28,0.1)', borderRadius: '0 0 16px 16px' }}>
          {loadingAssigned ? (
            <p className="font-outfit text-sm text-primary-dark opacity-60 pt-4">Loading...</p>
          ) : (
            <>
              {/* Assigned patients */}
              <div className="flex flex-wrap gap-2 pt-4 mb-4 min-h-[36px]">
                {assigned && assigned.length > 0 ? assigned.map((p) => (
                  <span
                    key={p.id}
                    className="flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full font-outfit text-sm"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
                  >
                    {p.email}
                    <button
                      onClick={() => handleUnassign(p.id)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )) : (
                  <p className="font-outfit text-sm text-primary-dark opacity-40">No patients assigned</p>
                )}
              </div>

              {/* Add patient */}
              <div className="flex items-center gap-3">
                <div className="flex-1 max-w-xs">
                  <Select
                    value={selectedPatientId}
                    onChange={setSelectedPatientId}
                    options={patientOptions}
                    placeholder="Select patient..."
                    searchable
                  />
                </div>
                <button
                  onClick={handleAssign}
                  disabled={!selectedPatientId || assigning}
                  className="px-5 py-2 rounded-full font-outfit text-sm bg-primary-navy text-primary-beige hover:opacity-80 transition-opacity disabled:opacity-40"
                >
                  {assigning ? 'Adding...' : 'Add'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const AssignmentsBlock = ({ token }) => {
  const [doctors, setDoctors] = useState([])
  const [allPatients, setAllPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [docRes, patRes] = await Promise.all([
        getDoctors(token, { size: 100 }),
        getUsers(token, { role: 'patient', size: 100 }),
      ])
      if (docRes.success) setDoctors(docRes.data.items)
      if (patRes.success) setAllPatients(patRes.data.items)
      setLoading(false)
    }
    load()
  }, [token])

  return loading ? (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-navy mx-auto" />
    </div>
  ) : doctors.length === 0 ? (
    <p className="font-outfit text-sm text-primary-dark opacity-60">No doctors registered yet.</p>
  ) : (
    <div className="space-y-3">
      {doctors.map((d) => (
        <DoctorRow key={d.id} doctor={d} token={token} allPatients={allPatients} />
      ))}
    </div>
  )
}

const ACTION_OPTIONS = [
  { label: 'All actions', value: '' },
  { label: 'Login', value: 'login' },
  { label: 'Scan Upload', value: 'scan_upload' },
  { label: 'Scan View', value: 'scan_view' },
  { label: 'Scan Analyze', value: 'scan_analyze' },
  { label: 'Report Download', value: 'report_download' },
  { label: 'Scan Delete', value: 'scan_delete' },
  { label: 'Annotation Create', value: 'annotation_create' },
  { label: 'Role Change', value: 'user_role_change' },
  { label: 'User Delete', value: 'user_delete' },
]

const ACTION_BADGE_COLORS = {
  login: { bg: '#DBEAFE', text: '#1D4ED8' },
  scan_upload: { bg: '#DCFCE7', text: '#15803D' },
  scan_view: { bg: '#E0F2FE', text: '#0369A1' },
  scan_analyze: { bg: '#EDE9FE', text: '#6D28D9' },
  report_download: { bg: '#DBEAFE', text: '#1D4ED8' },
  scan_delete: { bg: '#FEE2E2', text: '#991B1B' },
  annotation_create: { bg: '#DBEAFE', text: 'var(--color-navy-accent)' },
  user_role_change: { bg: '#FEF9C3', text: '#92400E' },
  user_delete: { bg: '#FEE2E2', text: '#991B1B' },
}

const AuditLogBlock = ({ token }) => {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [actionFilter, setActionFilter] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [debouncedEmail, setDebouncedEmail] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [applied, setApplied] = useState({ dateFrom: '', dateTo: '' })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedEmail(userEmail), 400)
    return () => clearTimeout(t)
  }, [userEmail])

  useEffect(() => {
    setPage(1)
  }, [actionFilter, debouncedEmail, applied])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const result = await getAuditLog(token, {
        userEmail: debouncedEmail || undefined,
        action: actionFilter || undefined,
        dateFrom: applied.dateFrom || undefined,
        dateTo: applied.dateTo || undefined,
        page,
        size: 50,
      })
      if (result.success) {
        setLogs(result.data.items)
        setTotal(result.data.total)
        setPages(result.data.pages)
      }
      setLoading(false)
    }
    load()
  }, [token, actionFilter, debouncedEmail, applied, page])

  const handleApplyDates = () => setApplied({ dateFrom, dateTo })
  const handleClearDates = () => {
    setDateFrom('')
    setDateTo('')
    setApplied({ dateFrom: '', dateTo: '' })
  }

  const badge = (action) => {
    const c = ACTION_BADGE_COLORS[action] || { bg: 'var(--color-surface)', text: 'var(--color-text)' }
    const label = ACTION_OPTIONS.find((o) => o.value === action)?.label || action
    return (
      <span
        className="inline-block px-2 py-0.5 rounded-full font-outfit text-xs font-medium"
        style={{ backgroundColor: c.bg, color: c.text }}
      >
        {label}
      </span>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <p className="font-outfit text-xs text-primary-dark opacity-60 mb-1">Action</p>
          <Select
            value={actionFilter}
            onChange={(v) => setActionFilter(v)}
            options={ACTION_OPTIONS}
            placeholder="All actions"
          />
        </div>
        <div>
          <p className="font-outfit text-xs text-primary-dark opacity-60 mb-1">User email</p>
          <input
            type="text"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Filter by email..."
            className="px-4 py-2.5 rounded-full font-outfit text-sm text-primary-dark focus:outline-none w-48"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          />
        </div>
        <div>
          <p className="font-outfit text-xs text-primary-dark opacity-60 mb-1">From</p>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2.5 rounded-full font-outfit text-sm text-primary-dark focus:outline-none"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          />
        </div>
        <div>
          <p className="font-outfit text-xs text-primary-dark opacity-60 mb-1">To</p>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2.5 rounded-full font-outfit text-sm text-primary-dark focus:outline-none"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          />
        </div>
        <button
          onClick={handleApplyDates}
          className="px-5 py-2.5 rounded-full font-outfit text-sm bg-primary-navy text-primary-beige hover:opacity-80 transition-opacity"
        >
          Apply
        </button>
        {(applied.dateFrom || applied.dateTo) && (
          <button
            onClick={handleClearDates}
            className="px-5 py-2.5 rounded-full font-outfit text-sm hover:opacity-70 transition-opacity"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
          >
            Clear
          </button>
        )}
      </div>

      <p className="font-outfit text-sm text-primary-dark opacity-60 mb-4">
        Total records: {total}
      </p>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-navy mx-auto" />
        </div>
      ) : logs.length === 0 ? (
        <p className="font-outfit text-primary-dark opacity-60 py-8">No records found.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl scroll-styled" style={{ backgroundColor: 'var(--color-bg)' }}>
            <table className="w-full text-sm font-outfit">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
                  <th className="text-left px-4 py-3 text-primary-dark opacity-60 font-medium whitespace-nowrap">Time</th>
                  <th className="text-left px-4 py-3 text-primary-dark opacity-60 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-primary-dark opacity-60 font-medium">Action</th>
                  <th className="text-left px-4 py-3 text-primary-dark opacity-60 font-medium">Resource</th>
                  <th className="text-left px-4 py-3 text-primary-dark opacity-60 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    style={{ borderBottom: '1px solid rgba(28,28,28,0.05)' }}
                  >
                    <td className="px-4 py-3 text-primary-dark opacity-70 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-4 py-3 text-primary-dark">
                      {log.user_email ?? <span className="opacity-40">—</span>}
                    </td>
                    <td className="px-4 py-3">{badge(log.action)}</td>
                    <td className="px-4 py-3 text-primary-dark opacity-70">
                      {log.resource_type
                        ? `${log.resource_type}${log.resource_id != null ? ` #${log.resource_id}` : ''}`
                        : <span className="opacity-40">—</span>}
                    </td>
                    <td className="px-4 py-3 text-primary-dark opacity-60 max-w-[240px] truncate">
                      {log.details ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center gap-4 mt-6">
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
    </div>
  )
}

const AdminPage = () => {
  const { token } = useAuthStore()

  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  const [confirmTarget, setConfirmTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, roleFilter])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const result = await getUsers(token, { search: debouncedSearch, role: roleFilter, page })
      if (result.success) {
        setUsers(result.data.items)
        setTotal(result.data.total)
        setPages(result.data.pages)
      }
      setLoading(false)
    }
    load()
  }, [token, debouncedSearch, roleFilter, page])

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId)
    setError('')
    const result = await updateUserRole(token, userId, newRole)
    if (result.success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    } else {
      setError(result.error)
    }
    setUpdatingId(null)
  }

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return
    setDeleting(true)
    setError('')
    const result = await deleteUser(token, confirmTarget.id)
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== confirmTarget.id))
      setTotal((t) => t - 1)
    } else {
      setError(result.error || 'Failed to delete user')
    }
    setConfirmTarget(null)
    setDeleting(false)
  }

  return (
    <PageLayout>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-36 sm:pt-44 lg:pt-[200px] pb-12 sm:pb-16 md:pb-20">

        <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark mb-8 sm:mb-10 lg:mb-[50px]">
          ADMIN PANEL
        </h2>

        <Section title="User Management">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="px-4 py-2.5 rounded-full font-outfit text-sm text-primary-dark focus:outline-none w-full max-w-xs"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            />
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              options={ROLE_FILTER_OPTIONS}
              placeholder="All roles"
            />
          </div>

          <p className="font-outfit text-sm text-primary-dark opacity-60 mb-6">
            Total users: {total}
          </p>

          {error && (
            <div className="mb-4 font-outfit text-sm text-red-600">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4" />
              <p className="font-outfit text-primary-dark">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <p className="font-outfit text-primary-dark opacity-60 py-12">No users found.</p>
          ) : (
            <>
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 rounded-2xl"
                    style={{ backgroundColor: 'var(--color-bg)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-outfit font-medium text-base text-primary-dark truncate">{u.email}</p>
                      <p className="font-outfit text-sm text-primary-dark opacity-60">
                        ID: {u.id} · Registered {formatDate(u.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={u.role}
                        onChange={(newRole) => handleRoleChange(u.id, newRole)}
                        options={ROLE_OPTIONS}
                        disabled={updatingId === u.id}
                      />
                      <button
                        onClick={() => setConfirmTarget(u)}
                        className="p-2 rounded-full hover:bg-red-50 text-primary-dark opacity-40 hover:opacity-80 hover:text-red-600 transition-all"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
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
        </Section>

        <Section title="Assignments">
          <AssignmentsBlock token={token} />
        </Section>

        <Section title="Audit Log">
          <AuditLogBlock token={token} />
        </Section>

        <Section title="System Maintenance">
          <MaintenanceBlock token={token} />
        </Section>
      </div>

      <ConfirmModal
        isOpen={!!confirmTarget}
        email={confirmTarget?.email}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setConfirmTarget(null)}
      />
    </PageLayout>
  )
}

export default AdminPage
