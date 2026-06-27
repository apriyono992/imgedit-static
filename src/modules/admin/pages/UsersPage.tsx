import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, Download, UserPlus } from 'lucide-react'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/users'
import { Table } from '@/components/ui/Table'
import type { Column } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/common/SearchInput'
import { QueryErrorMessage } from '@/components/common/QueryErrorMessage'
import { UserCreateModal } from '../components/UserCreateModal'
import { UserEditModal } from '../components/UserEditModal'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { UserDetailModal } from '../components/UserDetailModal'
import type { User } from '@/types/api'
import { formatDate, extractErrorMessage, formatRole } from '@/utils/format'
import { useTableState } from '@/hooks/useTableState'
import { downloadCSV } from '@/utils/csv'
import toast from 'react-hot-toast'

const LIMIT = 15

export function UsersPage() {
  const qc = useQueryClient()
  const { page, setPage, sortBy, sortOrder, search, handleSearch, handleSort } = useTableState({
    defaultSortBy: 'createdAt',
  })
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [detailUser, setDetailUser] = useState<User | null>(null)

  const query = useQuery({
    queryKey: ['admin', 'users', { page, sortBy, sortOrder, search, roleFilter, activeFilter }],
    queryFn: () =>
      getUsers({
        page,
        limit: LIMIT,
        sortBy,
        sortOrder,
        search: search || undefined,
        roleId: roleFilter ? Number(roleFilter) : undefined,
        active: activeFilter !== '' ? activeFilter === 'true' : undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createUser>[0]) => createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User berhasil dibuat')
      setShowCreate(false)
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User berhasil diupdate')
      setEditUser(null)
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User berhasil dihapus')
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  })

  const handleExport = () => {
    const rows = (query.data?.data ?? []).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: formatRole(u.roleId),
      status: u.active ? 'Aktif' : 'Nonaktif',
      created: u.createdAt ?? '',
    }))
    downloadCSV(
      rows,
      [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nama' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status' },
        { key: 'created', label: 'Dibuat' },
      ],
      `users-${new Date().toISOString().slice(0, 10)}.csv`,
    )
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-sm font-bold text-indigo-400 shrink-0">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-200 text-sm truncate">{row.name}</p>
            <p className="text-xs text-gray-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roleId',
      header: 'Role',
      sortable: true,
      render: (row) => (
        <Badge variant={row.roleId === 2 ? 'purple' : 'default'}>
          {row.roleId === 2 ? 'Admin' : 'User'}
        </Badge>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.active ? 'success' : 'danger'}>
          {row.active ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Dibuat',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {row.createdAt ? formatDate(row.createdAt) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setEditUser(row)}
            title="Edit user"
            className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-md transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            title="Hapus user"
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const meta = query.data?.meta

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manajemen user platform
            {meta && <span className="ml-2 text-gray-600">({meta.total.toLocaleString()} total)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            leftIcon={<UserPlus size={14} />}
            onClick={() => setShowCreate(true)}
          >
            Tambah User
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleExport}
            disabled={!query.data?.data.length}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Cari nama atau email..."
          className="flex-1"
        />
        <Select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          options={[
            { value: '', label: 'Semua Role' },
            { value: '1', label: 'User' },
            { value: '2', label: 'Admin' },
          ]}
          className="sm:w-40"
        />
        <Select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value); setPage(1) }}
          options={[
            { value: '', label: 'Semua Status' },
            { value: 'true', label: 'Aktif' },
            { value: 'false', label: 'Nonaktif' },
          ]}
          className="sm:w-40"
        />
      </div>

      {query.isError ? (
        <QueryErrorMessage error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          <p className="text-xs text-gray-600 mb-2">Klik baris untuk melihat detail user</p>
          <Table<User>
            columns={columns}
            data={query.data?.data ?? []}
            keyExtractor={(r) => r.id}
            isLoading={query.isLoading}
            skeletonRows={LIMIT}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => setDetailUser(row)}
            emptyMessage="Tidak ada user yang cocok"
          />
        </>
      )}

      {meta && meta.totalPages > 1 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          hasNextPage={meta.hasNextPage}
          hasPrevPage={meta.hasPrevPage}
          onPageChange={setPage}
          className="mt-4"
        />
      )}

      {/* Modals */}
      <UserCreateModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        isLoading={createMutation.isPending}
        onSave={(data) => createMutation.mutate(data)}
      />
      <UserDetailModal
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onEdit={(u) => { setDetailUser(null); setEditUser(u) }}
      />
      <UserEditModal
        user={editUser}
        onClose={() => setEditUser(null)}
        isLoading={updateMutation.isPending}
        onSave={(id, data) => updateMutation.mutate({ id, data })}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        message={`User "${deleteTarget?.name}" akan dinonaktifkan. Lanjutkan?`}
      />
    </div>
  )
}
