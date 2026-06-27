import { apiFetch } from './client'
import type { PaginatedResponse, User, UsersQueryParams } from '@/types/api'

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== '') q.set(key, String(val))
  }
  return q.toString()
}

export async function getUsers(params: UsersQueryParams = {}): Promise<PaginatedResponse<User>> {
  const q = buildQuery(params as Record<string, string | number | boolean | undefined>)
  const res = await apiFetch(`/users${q ? `?${q}` : ''}`)
  if (!res.ok) throw await res.json()
  return res.json() as Promise<PaginatedResponse<User>>
}

export async function getUserById(id: string): Promise<User> {
  const res = await apiFetch(`/users/${id}`)
  if (!res.ok) throw await res.json()
  return res.json() as Promise<User>
}

export async function updateUser(
  id: string,
  data: { name?: string; roleId?: number; active?: boolean },
): Promise<User> {
  const res = await apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json() as Promise<User>
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  roleId?: number
}): Promise<User> {
  const res = await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json() as Promise<User>
}

export async function deleteUser(id: string): Promise<void> {
  const res = await apiFetch(`/users/${id}`, { method: 'DELETE' })
  if (!res.ok) throw await res.json()
}
