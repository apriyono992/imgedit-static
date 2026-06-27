import { apiFetch } from './client'
import type { ActivityLog, ActivityLogsQueryParams, PaginatedResponse } from '@/types/api'

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== '') q.set(key, String(val))
  }
  return q.toString()
}

export async function createActivityLog(
  toolName: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  // fire-and-forget: tidak block UI, gagal diam-diam
  apiFetch('/activity-logs', {
    method: 'POST',
    body: JSON.stringify({ toolName, metadata }),
  }).catch(() => {})
}

export async function getMyLogs(
  params: ActivityLogsQueryParams = {},
): Promise<PaginatedResponse<ActivityLog>> {
  const q = buildQuery(params as Record<string, string | number | boolean | undefined>)
  const res = await apiFetch(`/activity-logs${q ? `?${q}` : ''}`)
  if (!res.ok) throw await res.json()
  return res.json() as Promise<PaginatedResponse<ActivityLog>>
}

export async function getAllLogs(
  params: ActivityLogsQueryParams = {},
): Promise<PaginatedResponse<ActivityLog>> {
  const q = buildQuery(params as Record<string, string | number | boolean | undefined>)
  const res = await apiFetch(`/activity-logs/all${q ? `?${q}` : ''}`)
  if (!res.ok) throw await res.json()
  return res.json() as Promise<PaginatedResponse<ActivityLog>>
}
