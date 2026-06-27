import { format, formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: id })
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id })
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatRole(roleId: number): string {
  return roleId === 2 ? 'Admin' : 'User'
}

export function extractErrorMessage(err: unknown): string {
  if (!err || typeof err !== 'object') return 'Terjadi kesalahan'
  const e = err as { message?: string | string[]; statusCode?: number }
  if (Array.isArray(e.message)) return e.message[0]
  if (typeof e.message === 'string') return e.message
  return 'Terjadi kesalahan'
}
