import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface CreateUserData {
  name: string
  email: string
  password: string
  roleId: number
}

interface UserCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateUserData) => void
  isLoading: boolean
}

export function UserCreateModal({ isOpen, onClose, onSave, isLoading }: UserCreateModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [roleId, setRoleId] = useState(1)

  const handleClose = () => {
    setName(''); setEmail(''); setPassword(''); setRoleId(1); setShowPassword(false)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, email, password, roleId })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah User"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Batal
          </Button>
          <Button form="user-create-form" type="submit" isLoading={isLoading}>
            Buat User
          </Button>
        </>
      }
    >
      <form id="user-create-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap"
          required
          autoFocus
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@contoh.com"
          required
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 karakter"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <Select
          label="Role"
          value={roleId}
          onChange={(e) => setRoleId(Number(e.target.value))}
          options={[
            { value: 1, label: 'User' },
            { value: 2, label: 'Admin' },
          ]}
        />
      </form>
    </Modal>
  )
}
