import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { extractErrorMessage } from '@/utils/format'
import toast from 'react-hot-toast'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/app/editor" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Akun berhasil dibuat!')
      navigate('/app/editor')
    } catch (err) {
      const apiErr = err as { statusCode?: number }
      if (apiErr?.statusCode === 409) {
        setError('Email sudah terdaftar, gunakan email lain')
      } else {
        setError(extractErrorMessage(err) || 'Gagal membuat akun')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-100 mb-1">Buat akun baru</h1>
      <p className="text-sm text-gray-500 mb-6">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Masuk
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}
        <Input
          label="Nama"
          type="text"
          placeholder="Nama lengkapmu"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          leftElement={<User size={15} />}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="kamu@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          leftElement={<Mail size={15} />}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 6 karakter"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          leftElement={<Lock size={15} />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          required
          minLength={6}
          autoComplete="new-password"
        />
        <Button type="submit" isLoading={isLoading} className="w-full !mt-6">
          Buat Akun
        </Button>
      </form>
    </>
  )
}
