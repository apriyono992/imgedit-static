import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { extractErrorMessage } from '@/utils/format'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/app/editor" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Selamat datang kembali!')
      navigate('/app/editor')
    } catch (err) {
      setError(extractErrorMessage(err) || 'Email atau password salah')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-100 mb-1">Masuk ke akun</h1>
      <p className="text-sm text-gray-500 mb-6">
        Belum punya akun?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Daftar sekarang
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}
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
          placeholder="••••••••"
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
          autoComplete="current-password"
        />
        <Button type="submit" isLoading={isLoading} className="w-full !mt-6">
          Masuk
        </Button>
      </form>
    </>
  )
}
