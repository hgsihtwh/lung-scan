import { useState, useEffect } from 'react'
import { PageLayout } from '@/components/layout'
import { useAuthStore } from '@/store'
import { getUsers, updateUserRole } from '@/api'
import { formatDate } from '@/utils/helpers'

const ROLES = ['patient', 'doctor', 'admin']

const ROLE_COLORS = {
  patient: '#1F7819',
  doctor: '#1A3A5C',
  admin: '#7E2F2F',
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
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
    } else {
      setError(result.error)
    }
    setUpdatingId(null)
  }

  return (
    <PageLayout>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-24 sm:pt-32 lg:pt-[150px] pb-12 sm:pb-16 md:pb-20">

        <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark mb-8 sm:mb-10 lg:mb-[50px]">
          ADMIN PANEL
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="px-4 py-3 rounded-full font-outfit text-base focus:outline-none w-full max-w-xs"
            style={{ backgroundColor: '#E1DFD5', border: '1px solid #BEBCB3' }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 rounded-full font-outfit text-base focus:outline-none"
            style={{ backgroundColor: '#E1DFD5', border: '1px solid #BEBCB3' }}
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
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
                    <span
                      className="font-outfit text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap"
                      style={{ backgroundColor: ROLE_COLORS[u.role] || '#9CA3AF' }}
                    >
                      {u.role}
                    </span>

                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={updatingId === u.id}
                      className="px-3 py-2 rounded-full font-outfit text-sm focus:outline-none disabled:opacity-50"
                      style={{ backgroundColor: '#E1DFD5', border: '1px solid #BEBCB3' }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
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
      </div>
    </PageLayout>
  )
}

export default AdminPage
