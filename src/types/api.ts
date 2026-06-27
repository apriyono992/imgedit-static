export interface User {
  id: string
  name: string
  email: string
  roleId: number
  active: boolean
  createdAt?: string  // absent from auth/login & auth/me responses, present in /users list
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ActivityLog {
  id: string
  userId: string
  toolName: string
  metadata: Record<string, unknown> | null
  ipAddress: string
  createdAt: string
  user?: { name: string; email: string }
}

export interface AuditLog {
  id: string
  userId: string | null
  action: string
  method: string
  path: string
  statusCode: number
  ipAddress: string
  userAgent: string
  createdAt: string
  user?: { name: string; email: string }
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}

export interface ListQueryParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  search?: string
}

export interface UsersQueryParams extends ListQueryParams {
  roleId?: number
  active?: boolean
}

export interface ActivityLogsQueryParams extends ListQueryParams {
  toolName?: string
  userId?: string
}

export interface AuditLogsQueryParams extends ListQueryParams {
  method?: string
  statusCode?: number
  userId?: string
}
