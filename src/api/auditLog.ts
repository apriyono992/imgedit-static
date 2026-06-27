import { apiFetch } from './client'
import type { AuditLog, AuditLogsQueryParams, PaginatedResponse } from '@/types/api'

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== '') q.set(key, String(val))
  }
  return q.toString()
}

export async function getAuditLogs(
  params: AuditLogsQueryParams = {},
): Promise<PaginatedResponse<AuditLog>> {
  const q = buildQuery(params as Record<string, string | number | boolean | undefined>)
  const res = await apiFetch(`/log-history${q ? `?${q}` : ''}`)
  if (!res.ok) throw await res.json()
  return res.json() as Promise<PaginatedResponse<AuditLog>>
}
