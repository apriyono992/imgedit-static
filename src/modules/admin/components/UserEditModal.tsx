import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { User } from '@/types/api'

interface UserEditModalProps {
  user: User | null
  onClose: () => void
  onSave: (id: string, data: { name?: string; roleId?: number; active?: boolean }) => void
  isLoading: boolean
}

export function UserEditModal({ user, onClose, onSave, isLoading }: UserEditModalProps) {
  const [name, setName] = useState('')
  const [roleId, setRoleId] = useState(1)
  const [active, setActive] = useState(true)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setRoleId(user.roleId)
      setActive(user.active)
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    onSave(user.id, { name, roleId, active })
  }

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title="Edit User"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button form="user-edit-form" type="submit" isLoading={isLoading}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="user-edit-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Select
          label="Role"
          value={roleId}
          onChange={(e) => setRoleId(Number(e.target.value))}
          options={[
            { value: 1, label: 'User' },
            { value: 2, label: 'Admin' },
          ]}
        />
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Status Akun</label>
          <div className="flex gap-3">
            {[
              { val: true, label: 'Aktif' },
              { val: false, label: 'Nonaktif' },
            ].map(({ val, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => setActive(val)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  active === val
                    ? val
                      ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-red-600/20 border-red-500/40 text-red-400'
                    : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}
