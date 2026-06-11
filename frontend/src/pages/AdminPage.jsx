import { useState, useEffect } from 'react'
import { Trash2, Settings } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import { Select } from '@/components/ui'
import { useAuthStore } from '@/store'
import { getUsers, updateUserRole, deleteUser, cleanupOldFiles, cleanupOrphanedFiles } from '@/api'
import { formatDate } from '@/utils/helpers'

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
        style={{ backgroundColor: '#F5F3EA' }}
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
            style={{ border: '1px solid #BEBCB3' }}
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
    <div
      className="mt-16 rounded-2xl px-6 py-8"
      style={{ backgroundColor: '#EFEDE3' }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Settings size={18} className="text-primary-dark opacity-60" />
        <h3 className="font-outfit font-semibold text-xl text-primary-dark">
          System Maintenance
        </h3>
      </div>

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
              style={{ backgroundColor: '#E1DFD5', border: '1px solid #BEBCB3' }}
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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-24 sm:pt-32 lg:pt-[150px] pb-12 sm:pb-16 md:pb-20">

        <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark mb-8 sm:mb-10 lg:mb-[50px]">
          ADMIN PANEL
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="px-4 py-2.5 rounded-full font-outfit text-sm text-primary-dark focus:outline-none w-full max-w-xs"
            style={{ backgroundColor: '#E1DFD5', border: '1px solid #BEBCB3' }}
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 rounded-2xl"
                  style={{ backgroundColor: '#EFEDE3' }}
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

        <MaintenanceBlock token={token} />
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
