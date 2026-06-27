import { apiFetch, BASE_URL } from './client'
import type { AuthResponse, User } from '@/types/api'

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  if (!res.ok) throw await res.json()
  return res.json() as Promise<AuthResponse>
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw await res.json()
  return res.json() as Promise<AuthResponse>
}

export async function logout(refreshToken: string): Promise<void> {
  await apiFetch('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  }).catch(() => {})
}

export async function getMe(): Promise<User> {
  const res = await apiFetch('/auth/me')
  if (!res.ok) throw await res.json()
  return res.json() as Promise<User>
}
